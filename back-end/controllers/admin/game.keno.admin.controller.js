const { LOAI_CUOC_GAME, DEFAULT_SETTING_GAME } = require("../../configs/game.keno");
const HeThong = require("../../models/HeThong");
const { BadRequestError, UnauthorizedError, NotFoundError } = require("../../utils/app_error");
const catchAsync = require("../../utils/catch_async");
const { OkResponse, CreatedResponse } = require("../../utils/successResponse");
const BienDongSoDuServiceFactory = require("../../services/biendongsodu.service");
const { TYPE_BALANCE_FLUCTUATION } = require("../../configs/balance.fluctuation.config");
const UserSocketService = require("../../services/user.socket.service");
const { convertLoaiCuocGame } = require("../../utils/game/keno");
const { convertMoney } = require("../../utils/convertMoney");

class GameKenoAdminController {
  constructor({ CONFIG }) {
    this.CONFIG = CONFIG;
  }
  getTiLeGame = catchAsync(async (req, res, next) => {
    const results = await HeThong.findOne({
      systemID: 1,
    });

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
  setTiLeGame = catchAsync(async (req, res, next) => {
    const { tiLe } = req.body;
    if (!tiLe) {
      throw new UnauthorizedError("Vui lòng nhập đầy đủ thông tin");
    }
    let update = {};

    console.log(tiLe);

    Object.keys(tiLe).forEach((keyTiLe) => {
      const objectLoaiBi = tiLe[keyTiLe];
      Object.keys(objectLoaiBi).forEach((item) => {
        const field = `gameConfigs.kenoConfigs.${this.CONFIG.KEY_SYSTEM_DB}.tiLeTraThuong.${keyTiLe}.${item}`;
        update = { ...update, [field]: tiLe[keyTiLe][item] };
      });
    });
    console.log({ update });
    await HeThong.findOneAndUpdate(
      {
        systemID: 1,
      },
      { $set: update }
    );
    return new OkResponse({
      data: tiLe,
    }).send(res);
  });

  setStatusAutoGame = catchAsync(async (req, res, next) => {
    const { autoGame } = req.body;
    const field = `gameConfigs.kenoConfigs.${this.CONFIG.KEY_SYSTEM_DB}.autoGame`;
    const update = {};
    update[field] = !!autoGame;
    await HeThong.findOneAndUpdate(
      {
        systemID: 1,
      },
      { $set: update }
    );

    return new OkResponse({
      data: autoGame,
      message: "Chỉnh thành công, kết quả sẽ được áp dụng từ phiên sau",
    }).send(res);
  });

  getStatusAutoGame = catchAsync(async (req, res, next) => {
    const results = await HeThong.findOne({
      systemID: 1,
    });
    const isAutoGame = results.gameConfigs.kenoConfigs[`${this.CONFIG.KEY_SYSTEM_DB}`].autoGame;
    return new OkResponse({
      data: isAutoGame,
    }).send(res);
  });
  getAllLichSuGame = catchAsync(async (req, res, next) => {
    const page = req.query.page * 1 || 1;
    const results = req.query.results * 1 || 10;
    const skip = (page - 1) * results;
    const searchQuery = req.query?.query ?? "";
    let sortValue = ["-createdAt"];
    sortValue = sortValue.join(" ");
    let query = {};
    if (searchQuery) {
      query = {
        phien: {
          $eq: searchQuery,
        },
      };
    }
    const list = await this.CONFIG.MODEL.GAME_KENO.find(query).skip(skip).limit(results).sort(sortValue).lean();
    return new OkResponse({
      data: list,
      metadata: {
        results: list.length,
        page,
        limitItems: results,
        sort: sortValue,
        searchQuery,
      },
    }).send(res);
  });
  countAllGame = catchAsync(async (req, res, next) => {
    const countList = await this.CONFIG.MODEL.GAME_KENO.countDocuments({});
    return new OkResponse({
      data: countList,
    }).send(res);
  });
  getLichSuGameChiTiet = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const result = await this.CONFIG.MODEL.GAME_KENO.findOne({
      _id: id,
    }).lean();
    return new OkResponse({
      data: result,
      metadata: {
        id,
      },
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
    const { phien } = req.params;
    const findPhien = await this.CONFIG.MODEL.GAME_KENO.findOne({
      _id: phien,
    });
    if (!findPhien) {
      throw new NotFoundError("Không tìm thấy phiên game");
    }

    const list = await this.CONFIG.MODEL.LICH_SU_DAT_CUOC.find({
      phien: findPhien._id,
    })
      .populate("nguoiDung")
      .lean();
    return new OkResponse({
      data: list,
    }).send(res);
  });

  thayDoiCuoc = catchAsync(async (req, res, next) => {
    const session = await this.CONFIG.MODEL.LICH_SU_DAT_CUOC.startSession();
    session.startTransaction();

    try {
      const { id, loaiBi, loaiCuoc, tienCuoc } = req.body;

      const findPhien = await this.CONFIG.MODEL.LICH_SU_DAT_CUOC.findOne({ _id: id }).session(session);

      if (!findPhien) {
        throw new NotFoundError("Không tìm thấy bản chỉnh sửa");
      }

      if (findPhien.tinhTrang === "hoanTat") {
        throw new BadRequestError("Phiên đã hoàn tất");
      }

      const biCu = findPhien.datCuoc[0].loaiBi;
      const loaiCuocCu = findPhien.datCuoc[0].chiTietCuoc[0].loaiCuoc;
      const tienCuocCu = findPhien.datCuoc[0].chiTietCuoc[0].tienCuoc;

      findPhien.datCuoc[0].loaiBi = loaiBi;
      findPhien.datCuoc[0].chiTietCuoc[0].loaiCuoc = loaiCuoc;
      findPhien.datCuoc[0].chiTietCuoc[0].tienCuoc = tienCuoc;

      await findPhien.save({ session });

      const lichSuCuoc = await this.CONFIG.MODEL.LICH_SU_DAT_CUOC.updateMany(
        { phien: findPhien.phien, nguoiDung: findPhien.nguoiDung },
        {
          $set: {
            "datCuoc.0.chiTietCuoc.0.tienCuoc": tienCuoc,
          },
        }
      ).session(session);

      const nguoiDung = await this.CONFIG.MODEL.NGUOI_DUNG.findOne({
        _id: findPhien.nguoiDung,
      }).session(session);

      const tienChenhLech = (tienCuocCu - tienCuoc) * lichSuCuoc.modifiedCount;

      if (nguoiDung.money + tienChenhLech < 0) {
        throw new BadRequestError("Số tiền còn lại k đủ");
      }

      await this.CONFIG.MODEL.NGUOI_DUNG.updateOne(
        {
          _id: findPhien.nguoiDung,
        },
        { money: nguoiDung.money + tienChenhLech }
      ).session(session);

      const docToUpdate = await this.CONFIG.MODEL.BIEN_DONG_SO_DU.findOne({
        nguoiDung: findPhien.nguoiDung,
        tienSau: nguoiDung.money,
      })
        .sort({ createdAt: -1 })
        .session(session);

      docToUpdate.noiDung = docToUpdate?.noiDung?.replaceAll(`- ${convertMoney(tienCuocCu)}`, `- ${convertMoney(tienCuoc)}`);
      docToUpdate.noiDung = docToUpdate.noiDung.replace(
        `Cược bi ${biCu} - ${convertLoaiCuocGame(loaiCuocCu)}`,
        `Cược bi ${loaiBi} - ${convertLoaiCuocGame(loaiCuoc)}`
      );
      docToUpdate.tienSau = nguoiDung.money + tienChenhLech;

      await docToUpdate.save({ session });

      await session.commitTransaction();
      session.endSession();

      this.CONFIG.METHOD.SEND_ROOM_KENO({
        key: `${this.CONFIG.ROOM}:update-lich-su-cuoc-ca-nhan`,
        data: { phien: findPhien._id },
      });

      this.CONFIG.METHOD.SEND_ROOM_ADMIN_KENO({
        key: `${this.CONFIG.ROOM}:admin:refetch-data-lich-su-cuoc-game`,
        data: { phien: findPhien._id },
      });
      // Update số dư tài khoản realtime
      UserSocketService.updateUserBalance({ user: nguoiDung.taiKhoan, updateBalance: tienChenhLech });

      return new OkResponse({
        data: findPhien,
      }).send(res);
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  });
}
module.exports = GameKenoAdminController;
