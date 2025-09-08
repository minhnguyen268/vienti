const NguoiDung = require("../models/NguoiDung");
const HeThong = require("../models/HeThong");
const { BadRequestError, UnauthorizedError, NotFoundError } = require("../utils/app_error");
const catchAsync = require("../utils/catch_async");
const { convertMoney } = require("../utils/convertMoney");
const UserSocketService = require("../services/user.socket.service");
const TelegramService = require("../services/telegram.service");
const { default: mongoose } = require("mongoose");
const { OkResponse, CreatedResponse } = require("../utils/successResponse");
const { STATUS_GAME, STATUS_HISTORY_GAME, LOAI_CUOC_GAME, LOAI_BI, MIN_BET_MONEY, DEFAULT_SETTING_GAME } = require("../configs/game.keno");
const { TYPE_SEND_MESSAGE } = require("../configs/telegram.config");
const BienDongSoDuServiceFactory = require("../services/biendongsodu.service");
const { TYPE_BALANCE_FLUCTUATION } = require("../configs/balance.fluctuation.config");
const _ = require("lodash");
const { convertLoaiCuocGame } = require("../utils/game/keno");
class GameKenoController {
  constructor({ CONFIG }) {
    this.CONFIG = CONFIG;
  }
  getTiLeGame = catchAsync(async (req, res, next) => {
    const results = await HeThong.findOne({
      systemID: 1,
    });
    // const bangTiLe = Object.fromEntries(
    //   Object.values(LOAI_CUOC_GAME).map((loaiCuoc) => [
    //     loaiCuoc,
    //     results?.gameConfigs?.kenoConfigs?.[`${this.CONFIG.KEY_SYSTEM_DB}`]?.[`${convertKeyTiLe(loaiCuoc)}`] ?? getTiLeDefault(loaiCuoc),
    //   ])
    // );
    const bangTiLe = {};

    for (let i = 1; i <= 5; i++) {
      const keyBi = `bi_${i}`;
      bangTiLe[keyBi] = {
        [LOAI_CUOC_GAME.CHAN]:
          results.gameConfigs.kenoConfigs[`${this.CONFIG.KEY_SYSTEM_DB}`]?.tiLeTraThuong?.[keyBi]?.[LOAI_CUOC_GAME.CHAN] ??
          DEFAULT_SETTING_GAME[`BI_${i}_CHAN_BET_PAYOUT_PERCENT`],
        [LOAI_CUOC_GAME.LE]:
          results.gameConfigs.kenoConfigs[`${this.CONFIG.KEY_SYSTEM_DB}`]?.tiLeTraThuong?.[keyBi]?.[LOAI_CUOC_GAME.LE] ??
          DEFAULT_SETTING_GAME[`BI_${i}_LE_BET_PAYOUT_PERCENT`],
        [LOAI_CUOC_GAME.LON]:
          results.gameConfigs.kenoConfigs[`${this.CONFIG.KEY_SYSTEM_DB}`]?.tiLeTraThuong?.[keyBi]?.[LOAI_CUOC_GAME.LON] ??
          DEFAULT_SETTING_GAME[`BI_${i}_LON_BET_PAYOUT_PERCENT`],
        [LOAI_CUOC_GAME.NHO]:
          results.gameConfigs.kenoConfigs[`${this.CONFIG.KEY_SYSTEM_DB}`]?.tiLeTraThuong?.[keyBi]?.[LOAI_CUOC_GAME.NHO] ??
          DEFAULT_SETTING_GAME[`BI_${i}_NHO_BET_PAYOUT_PERCENT`],
      };
    }

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
    const list = await this.CONFIG.MODEL.GAME_KENO.find({
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
    const { phien, listDatCuoc, tienCuoc } = req.body;
    const { _id: userID } = req.user;

    if (!tienCuoc || !_.isNumber(tienCuoc)) {
      throw new UnauthorizedError("Vui lòng chọn tiền cược hợp lệ");
    }
    if (parseInt(tienCuoc) <= 0) {
      throw new UnauthorizedError("Vui lòng chọn tiền cược hợp lệ");
    }
    if (parseInt(tienCuoc) < MIN_BET_MONEY) {
      throw new UnauthorizedError(`Số tiền tối thiểu đặt cược là ${convertMoney(MIN_BET_MONEY)}`);
    }

    if (!_.isArray(listDatCuoc)) {
      throw new UnauthorizedError("Vui lòng chọn cược hợp lệ");
    }

    listDatCuoc.forEach(({ loaiCuoc, loaiBi }) => {
      if (!Object.values(LOAI_CUOC_GAME).includes(loaiCuoc)) {
        throw new UnauthorizedError("Vui lòng chọn loại cược hợp lệ");
      }
      if (!Object.values(LOAI_BI).includes(loaiBi)) {
        throw new UnauthorizedError("Vui lòng chọn loại bi hợp lệ");
      }
    });

    const findPhien = await this.CONFIG.MODEL.GAME_KENO.findOne({
      phien,
      tinhTrang: STATUS_GAME.DANG_CHO,
    }).lean();
    if (!findPhien) {
      throw new BadRequestError("Vui lòng chờ phiên mới");
    }

    const findUser = await NguoiDung.findOne({
      _id: userID,
    }).lean();

    const tongTienCuoc = tienCuoc * listDatCuoc.length;

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

        const listPromisesInsertLichSu = listDatCuoc.map(async ({ loaiCuoc, loaiBi }) => {
          const result = await this.CONFIG.MODEL.LICH_SU_DAT_CUOC.create(
            [
              {
                tinhTrang: STATUS_HISTORY_GAME.DANG_CHO,
                phien: findPhien._id,
                nguoiDung: userID,
                datCuoc: [
                  {
                    loaiBi: loaiBi,
                    chiTietCuoc: {
                      loaiCuoc,
                      tienCuoc,
                    },
                    tongTienCuoc: tienCuoc,
                  },
                ],
              },
            ],
            {
              session,
            }
          );
          return result;
        });
        await Promise.all(listPromisesInsertLichSu);
        // Insert Biến động số dư
        let noiDungBienDongSoDu = "";
        listDatCuoc.forEach(({ loaiCuoc, loaiBi }) => {
          noiDungBienDongSoDu += `Cược bi ${loaiBi} - ${convertLoaiCuocGame(loaiCuoc)} - ${convertMoney(tienCuoc)} | `;
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

    this.CONFIG.METHOD.SEND_ROOM_ADMIN_KENO({
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
    const findPhien = await this.CONFIG.MODEL.GAME_KENO.findOne({
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
module.exports = GameKenoController;
