const NguoiDung = require("../models/NguoiDung");
const HeThong = require("../models/HeThong");
const { BadRequestError, UnauthorizedError, NotFoundError } = require("../utils/app_error");
const catchAsync = require("../utils/catch_async");
const { convertMoney } = require("../utils/convertMoney");
const UserSocketService = require("../services/user.socket.service");
const TelegramService = require("../services/telegram.service");
const { default: mongoose } = require("mongoose");
const { convertChiTietCuoc } = require("../utils/game/xucxac");
const { OkResponse, CreatedResponse } = require("../utils/successResponse");
const { STATUS_GAME, STATUS_HISTORY_GAME } = require("../configs/game.xucxac");
const { TYPE_SEND_MESSAGE } = require("../configs/telegram.config");
const { TYPE_BALANCE_FLUCTUATION } = require("../configs/balance.fluctuation.config");
const BienDongSoDuServiceFactory = require("../services/biendongsodu.service");
class GameXucXacController {
  constructor({ CONFIG }) {
    this.CONFIG = CONFIG;
  }
  getTiLeGame = catchAsync(async (req, res, next) => {
    const results = await HeThong.findOne({
      systemID: 1,
    });
    const tiLeCLTX = results.gameConfigs.xucXacConfigs[`${this.CONFIG.KEY_SYSTEM_DB}`].tiLeCLTX;
    return new OkResponse({
      data: tiLeCLTX,
    }).send(res);
  });
  getAllLichSuGame = catchAsync(async (req, res, next) => {
    const page = req.query.page * 1 || 1;
    const results = req.query.results * 1 || 10;
    const skip = (page - 1) * results;
    let sortValue = ["-createdAt"];
    sortValue = sortValue.join(" ");
    const list = await this.CONFIG.MODEL.GAME_XUCXAC.find({
      tinhTrang: STATUS_GAME.HOAN_TAT,
    })
      .skip(skip)
      .limit(results)
      .sort(sortValue)
      .lean();

    return new OkResponse({
      data: list,
      metadata: {
        results: list.length,
        page,
        limitItems: results,
        sort: sortValue,
      },
    }).send(res);
  });

  createDatCuoc = catchAsync(async (req, res, next) => {
    const { phien, chiTietCuoc } = req.body;
    const { _id: userID } = req.user;

    const findPhien = await this.CONFIG.MODEL.GAME_XUCXAC.findOne({
      phien,
      tinhTrang: STATUS_GAME.DANG_CHO,
    }).lean();
    if (!findPhien) {
      throw new BadRequestError("Vui lòng chờ phiên mới");
    }

    const findUser = await NguoiDung.findOne({
      _id: userID,
    }).lean();
    // Get lịch sử đặt cược
    const lichSuCuoc = await this.CONFIG.MODEL.LICH_SU_DAT_CUOC.findOne({
      phien: findPhien._id,
      nguoiDung: userID,
      tinhTrang: STATUS_HISTORY_GAME.DANG_CHO,
    }).lean();
    // Nếu chưa tồn tại lịch sử cược phiên
    if (!lichSuCuoc) {
      const tongTienCuoc = chiTietCuoc.reduce((a, b) => a + b.tienCuoc, 0);

      const session = await mongoose.startSession();
      await session.withTransaction(async () => {
        try {
          // check tiền người dùng
          if (findUser.money < tongTienCuoc) {
            throw new BadRequestError("Không đủ tiền cược");
          }
          // Cập nhật tiền người dùng
          const updateTienNguoiDung = await NguoiDung.findOneAndUpdate(
            {
              _id: userID,
            },
            {
              $inc: { money: -tongTienCuoc, tienCuoc: tongTienCuoc },
            },
            {
              session,
            }
          );
          // Insert lịch sử đặt cược
          await this.CONFIG.MODEL.LICH_SU_DAT_CUOC.create(
            [
              {
                tinhTrang: STATUS_HISTORY_GAME.DANG_CHO,
                phien: findPhien._id,
                nguoiDung: userID,
                datCuoc: chiTietCuoc,
              },
            ],
            {
              session,
            }
          );

          // Insert Biến động số dư
          let noiDungBienDongSoDu = "";

          chiTietCuoc.forEach((item) => {
            noiDungBienDongSoDu += `Cược ${convertChiTietCuoc(item.chiTietCuoc, item.loaiCuoc)} - ${convertMoney(item.tienCuoc)} | `;
          });
          noiDungBienDongSoDu = noiDungBienDongSoDu.substr(0, noiDungBienDongSoDu.length - 2);
          await BienDongSoDuServiceFactory.createBienDong({
            type: TYPE_BALANCE_FLUCTUATION.GAME,
            payload: {
              nguoiDung: userID,
              tienTruoc: updateTienNguoiDung.money,
              tienSau: updateTienNguoiDung.money - tongTienCuoc,
              noiDung: `Cược game ${this.CONFIG.TYPE_GAME}: ${noiDungBienDongSoDu}`,
              loaiGame: this.CONFIG.ROOM,
            },
            options: {
              session,
            },
          });

          // Update số dư tài khoản realtime
          UserSocketService.updateUserBalance({ user: findUser.taiKhoan, updateBalance: -tongTienCuoc });

          // Send notification Telegram
          const noiDungBot = `${findUser.taiKhoan} vừa cược game ${this.CONFIG.TYPE_GAME} ở phiên ${phien}: ${noiDungBienDongSoDu}`;
          TelegramService.sendNotification({ content: noiDungBot, type: TYPE_SEND_MESSAGE.GAME });
          await session.commitTransaction();
        } catch (err) {
          console.log(err);
          await session.abortTransaction();
          throw err;
        } finally {
          await session.endSession();
        }
      });
    } else {
      // Check tồn tại một loại cược khác loại cược ban đầu

      const lichSuDatCuoc = lichSuCuoc.datCuoc;
      const lichSuDacCuocMoi = chiTietCuoc;
      let tongTienCuoc = 0;
      let noiDungBienDongSoDu = "";

      let isDuplicateCuoc = false;

      for (const itemMoi of lichSuDacCuocMoi) {
        const findCuoc = lichSuDatCuoc.find((item) => item.chiTietCuoc === itemMoi.chiTietCuoc && item.loaiCuoc === itemMoi.loaiCuoc);
        if (findCuoc) {
          isDuplicateCuoc = false;
        } else {
          isDuplicateCuoc = true;
        }
      }
      if (isDuplicateCuoc) {
        throw new BadRequestError("Bạn chỉ được phép đặt cược 1 bên");
      }

      for (const itemCu of lichSuDatCuoc) {
        const getItemMoi = lichSuDacCuocMoi.find((item) => item.chiTietCuoc === itemCu.chiTietCuoc && item.loaiCuoc === itemCu.loaiCuoc);
        if (getItemMoi) {
          if (getItemMoi.tienCuoc - itemCu.tienCuoc !== 0) {
            tongTienCuoc += getItemMoi.tienCuoc - itemCu.tienCuoc;
            noiDungBienDongSoDu += `Cược thêm ${convertChiTietCuoc(getItemMoi.chiTietCuoc, getItemMoi.loaiCuoc)} - ${convertMoney(
              getItemMoi.tienCuoc - itemCu.tienCuoc
            )} | `;
          }
        }
      }
      noiDungBienDongSoDu = noiDungBienDongSoDu.substr(0, noiDungBienDongSoDu.length - 2);
      if (tongTienCuoc === 0) {
        throw new UnauthorizedError("Vui lòng chọn cược");
      }

      if (findUser.money < tongTienCuoc) {
        throw new BadRequestError("Không đủ tiền cược");
      }

      const session = await mongoose.startSession();

      await session.withTransaction(async () => {
        try {
          const updateTienNguoiDung = await NguoiDung.findOneAndUpdate(
            {
              _id: userID,
            },
            {
              $inc: { money: -tongTienCuoc, tienCuoc: tongTienCuoc },
            },
            {
              session,
            }
          );

          await this.CONFIG.MODEL.LICH_SU_DAT_CUOC.findOneAndUpdate(
            { tinhTrang: STATUS_HISTORY_GAME.DANG_CHO, phien: findPhien._id, nguoiDung: userID },
            {
              datCuoc: lichSuDacCuocMoi,
            },
            {
              new: true,
              session,
            }
          );
          await BienDongSoDuServiceFactory.createBienDong({
            type: TYPE_BALANCE_FLUCTUATION.GAME,
            payload: {
              nguoiDung: userID,
              tienTruoc: updateTienNguoiDung.money,
              tienSau: updateTienNguoiDung.money - tongTienCuoc,
              noiDung: `Cược game ${this.CONFIG.TYPE_GAME}: ${noiDungBienDongSoDu}`,
              loaiGame: this.CONFIG.ROOM,
            },
            options: {
              session,
            },
          });

          // Update số dư tài khoản realtime
          UserSocketService.updateUserBalance({ user: findUser.taiKhoan, updateBalance: -tongTienCuoc });

          // Send notification Telegram
          const noiDungBot = `${findUser.taiKhoan} vừa cược game ${this.CONFIG.TYPE_GAME} ở phiên ${phien}: ${noiDungBienDongSoDu}`;
          TelegramService.sendNotification({ content: noiDungBot, type: TYPE_SEND_MESSAGE.GAME });
          await session.commitTransaction();
        } catch (err) {
          console.log(err);
          await session.abortTransaction();
          throw err;
        } finally {
          await session.endSession();
        }
      });
    }
    this.CONFIG.METHOD.SEND_ROOM_ADMIN_XUCXAC({
      key: `${this.CONFIG.ROOM}:admin:refetch-data-lich-su-cuoc-game`,
      data: { phien: findPhien._id },
    });

    return new CreatedResponse({
      message: "Đặt cược thành công",
    }).send(res);
  });

  getAllLichSuCuocGame = catchAsync(async (req, res, next) => {
    const { _id: userID } = req.user;
    const page = req.query.page * 1 || 1;
    const results = req.query.results * 1 || 10;
    const skip = (page - 1) * results;
    let sortValue = ["-createdAt"];
    sortValue = sortValue.join(" ");
    const list = await this.CONFIG.MODEL.LICH_SU_DAT_CUOC.find({
      nguoiDung: userID,
    })
      .skip(skip)
      .limit(results)
      .sort(sortValue)
      .populate("phien")
      .lean();
    return new OkResponse({
      data: list,
      metadata: {
        results: list.length,
        page,
        limitItems: results,
        sort: sortValue,
      },
    }).send(res);
  });

  getLichSuCuocGameChiTiet = catchAsync(async (req, res, next) => {
    const { _id: userID } = req.user;
    const { phien } = req.params;
    const findPhien = await this.CONFIG.MODEL.GAME_XUCXAC.findOne({
      phien,
    });
    if (!findPhien) {
      throw new NotFoundError("Không tìm thấy phiên game");
    }

    const list = await this.CONFIG.MODEL.LICH_SU_DAT_CUOC.findOne({
      nguoiDung: userID,
      phien: findPhien._id,
    }).select("datCuoc");
    return new OkResponse({
      data: list,
    }).send(res);
  });
}
module.exports = GameXucXacController;
