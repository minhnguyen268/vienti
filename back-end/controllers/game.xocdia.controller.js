const NguoiDung = require("../models/NguoiDung");
const HeThong = require("../models/HeThong");
const { BadRequestError, UnauthorizedError, NotFoundError } = require("../utils/app_error");
const catchAsync = require("../utils/catch_async");
const { convertMoney } = require("../utils/convertMoney");
const UserSocketService = require("../services/user.socket.service");
const TelegramService = require("../services/telegram.service");
const { default: mongoose } = require("mongoose");
const { OkResponse, CreatedResponse } = require("../utils/successResponse");
const { STATUS_GAME, STATUS_HISTORY_GAME, CHI_TIET_CUOC_GAME, DEFAULT_SETTING_GAME, MIN_BET_MONEY } = require("../configs/game.xocdia");
const { TYPE_SEND_MESSAGE } = require("../configs/telegram.config");
const BienDongSoDuServiceFactory = require("../services/biendongsodu.service");
const { TYPE_BALANCE_FLUCTUATION } = require("../configs/balance.fluctuation.config");
const { convertChiTietCuoc } = require("../utils/game/xocdia");

class GameXocDiaController {
  constructor({ CONFIG }) {
    this.CONFIG = CONFIG;
  }
  getTiLeGame = catchAsync(async (req, res, next) => {
    const results = await HeThong.findOne({
      systemID: 1,
    });
    const bangTiLe = {
      [CHI_TIET_CUOC_GAME.CHAN]:
        results?.gameConfigs?.xocDiaConfigs?.[`${this.CONFIG.KEY_SYSTEM_DB}`]?.tiLeCL ?? DEFAULT_SETTING_GAME.BET_PAYOUT_PERCENT,
      [CHI_TIET_CUOC_GAME.HAI_TRANG_HAI_DO]:
        results?.gameConfigs?.xocDiaConfigs?.[`${this.CONFIG.KEY_SYSTEM_DB}`]?.tiLeHaiHai ??
        DEFAULT_SETTING_GAME.HAI_HAI_BET_PAYOUT_PERCENT,
      [CHI_TIET_CUOC_GAME.FULL_DO]:
        results?.gameConfigs?.xocDiaConfigs?.[`${this.CONFIG.KEY_SYSTEM_DB}`]?.tiLeFull ?? DEFAULT_SETTING_GAME.FULL_BET_PAYOUT_PERCENT,
      [CHI_TIET_CUOC_GAME.FULL_TRANG]:
        results?.gameConfigs?.xocDiaConfigs?.[`${this.CONFIG.KEY_SYSTEM_DB}`]?.tiLeFull ?? DEFAULT_SETTING_GAME.FULL_BET_PAYOUT_PERCENT,
      [CHI_TIET_CUOC_GAME.LE]:
        results?.gameConfigs?.xocDiaConfigs?.[`${this.CONFIG.KEY_SYSTEM_DB}`]?.tiLeCL ?? DEFAULT_SETTING_GAME.BET_PAYOUT_PERCENT,
      [CHI_TIET_CUOC_GAME.BA_DO_MOT_TRANG]:
        results?.gameConfigs?.xocDiaConfigs?.[`${this.CONFIG.KEY_SYSTEM_DB}`]?.tiLeBaMot ?? DEFAULT_SETTING_GAME.BA_MOT_BET_PAYOUT_PERCENT,
      [CHI_TIET_CUOC_GAME.BA_TRANG_MOT_DO]:
        results?.gameConfigs?.xocDiaConfigs?.[`${this.CONFIG.KEY_SYSTEM_DB}`]?.tiLeBaMot ?? DEFAULT_SETTING_GAME.BA_MOT_BET_PAYOUT_PERCENT,
    };
    return new OkResponse({
      data: bangTiLe,
    }).send(res);
  });
  getAllLichSuGame = catchAsync(async (req, res, next) => {
    const page = req.query.page * 1 || 1;
    const results = req.query.results * 1 || 10;
    const skip = (page - 1) * results;
    let sortValue = ["-createdAt"];
    sortValue = sortValue.join(" ");
    const list = await this.CONFIG.MODEL.GAME_XOCDIA.find({
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

    const findPhien = await this.CONFIG.MODEL.GAME_XOCDIA.findOne({
      phien,
      tinhTrang: STATUS_GAME.DANG_CHO,
    }).lean();
    if (!findPhien) {
      throw new BadRequestError("Vui lòng chờ phiên mới");
    }

    // Cược tối thiểu

    let checkMinBet = true;
    chiTietCuoc?.forEach((item) => {
      if (item?.tienCuoc < MIN_BET_MONEY) {
        checkMinBet = false;
      }
    });
    if (!checkMinBet) {
      throw new UnauthorizedError(`Số tiền tối thiểu đặt cược mỗi loại là ${convertMoney(MIN_BET_MONEY)}`);
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
            noiDungBienDongSoDu += `Cược ${convertChiTietCuoc(item.chiTietCuoc)} - ${convertMoney(item.tienCuoc)} | `;
          });
          noiDungBienDongSoDu = noiDungBienDongSoDu.substr(0, noiDungBienDongSoDu.length - 2);

          await BienDongSoDuServiceFactory.createBienDong({
            type: TYPE_BALANCE_FLUCTUATION.GAME,
            phienId: findPhien._id,
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

      for (const itemCu of lichSuDatCuoc) {
        const getItemMoi = lichSuDacCuocMoi.find((item) => item.chiTietCuoc === itemCu.chiTietCuoc);
        if (getItemMoi) {
          if (getItemMoi.tienCuoc - itemCu.tienCuoc !== 0) {
            tongTienCuoc += getItemMoi.tienCuoc - itemCu.tienCuoc;
            noiDungBienDongSoDu += `Cược thêm ${convertChiTietCuoc(getItemMoi.chiTietCuoc)} - ${convertMoney(
              getItemMoi.tienCuoc - itemCu.tienCuoc
            )} | `;
          }
        }
      }
      for (const itemMoi of lichSuDacCuocMoi) {
        const checkIsExist = lichSuDatCuoc.find((item) => item.chiTietCuoc === itemMoi.chiTietCuoc);
        if (!checkIsExist) {
          tongTienCuoc += itemMoi.tienCuoc;
          noiDungBienDongSoDu += `Cược ${convertChiTietCuoc(itemMoi.chiTietCuoc)} - ${convertMoney(itemMoi.tienCuoc)} | `;
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
            phienId: findPhien._id,
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
    this.CONFIG.METHOD.SEND_ROOM_ADMIN_XOCDIA({
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
    const findPhien = await this.CONFIG.MODEL.GAME_XOCDIA.findOne({
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
module.exports = GameXocDiaController;
