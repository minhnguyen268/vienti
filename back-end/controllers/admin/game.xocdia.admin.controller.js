const { CHI_TIET_CUOC_GAME, DEFAULT_SETTING_GAME } = require("../../configs/game.xocdia");
const HeThong = require("../../models/HeThong");
const { BadRequestError, UnauthorizedError, NotFoundError } = require("../../utils/app_error");
const catchAsync = require("../../utils/catch_async");
const { OkResponse, CreatedResponse } = require("../../utils/successResponse");
const UserSocketService = require("../../services/user.socket.service");
const { convertMoney } = require("../../utils/convertMoney");
const { convertChiTietCuoc } = require("../../utils/game/xocdia");

class GameXocDiaAdminController {
  constructor({ CONFIG }) {
    this.CONFIG = CONFIG;
  }
  getTiLeGame = catchAsync(async (req, res, next) => {
    const results = await HeThong.findOne({
      systemID: 1,
    });
    const bangTiLe = {
      tiLeCL: results?.gameConfigs?.xocDiaConfigs?.[`${this.CONFIG.KEY_SYSTEM_DB}`]?.tiLeCL ?? DEFAULT_SETTING_GAME.BET_PAYOUT_PERCENT,
      tiLeHaiHai:
        results?.gameConfigs?.xocDiaConfigs?.[`${this.CONFIG.KEY_SYSTEM_DB}`]?.tiLeHaiHai ??
        DEFAULT_SETTING_GAME.HAI_HAI_BET_PAYOUT_PERCENT,
      tiLeFull:
        results?.gameConfigs?.xocDiaConfigs?.[`${this.CONFIG.KEY_SYSTEM_DB}`]?.tiLeFull ?? DEFAULT_SETTING_GAME.FULL_BET_PAYOUT_PERCENT,
      tiLeBaMot:
        results?.gameConfigs?.xocDiaConfigs?.[`${this.CONFIG.KEY_SYSTEM_DB}`]?.tiLeBaMot ?? DEFAULT_SETTING_GAME.BA_MOT_BET_PAYOUT_PERCENT,
    };
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

    Object.keys(tiLe).forEach((keyTiLe) => {
      const field = `gameConfigs.xocDiaConfigs.${this.CONFIG.KEY_SYSTEM_DB}.${keyTiLe}`;
      update = { ...update, [field]: tiLe[keyTiLe] };
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
    const field = `gameConfigs.xocDiaConfigs.${this.CONFIG.KEY_SYSTEM_DB}.autoGame`;
    const update = {};
    update[field] = !!autoGame;
    await HeThong.findOneAndUpdate(
      {
        systemID: 1,
      },
      { $set: update }
    );
    return new OkResponse({
      message: "Chỉnh thành công, kết quả sẽ được áp dụng từ phiên sau",

      data: autoGame,
    }).send(res);
  });

  getStatusAutoGame = catchAsync(async (req, res, next) => {
    const results = await HeThong.findOne({
      systemID: 1,
    });
    const isAutoGame = results.gameConfigs.xocDiaConfigs[`${this.CONFIG.KEY_SYSTEM_DB}`].autoGame;
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
    const list = await this.CONFIG.MODEL.GAME_XOCDIA.find(query).skip(skip).limit(results).sort(sortValue).lean();
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
  getLichSuGameChiTiet = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const result = await this.CONFIG.MODEL.GAME_XOCDIA.findOne({
      _id: id,
    }).lean();
    return new OkResponse({
      data: result,
      metadata: {
        id,
      },
    }).send(res);
  });
  countAllGame = catchAsync(async (req, res, next) => {
    const countList = await this.CONFIG.MODEL.GAME_XOCDIA.countDocuments({});
    return new OkResponse({
      data: countList,
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
    const findPhien = await this.CONFIG.MODEL.GAME_XOCDIA.findOne({
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
      const { id, datCuoc } = req.body;

      const datCuocFormat = datCuoc.map((item) => ({ ...item, tienCuoc: Number(item.tienCuoc) }));

      const findPhien = await this.CONFIG.MODEL.LICH_SU_DAT_CUOC.findOne({ _id: id }).session(session);

      if (!findPhien) {
        throw new NotFoundError("Không tìm thấy bản chỉnh sửa");
      }

      if (findPhien.tinhTrang === "hoanTat") {
        throw new BadRequestError("Phiên đã hoàn tất");
      }
      const tienCuocCu = findPhien.datCuoc[0].tienCuoc;

      findPhien.datCuoc = datCuocFormat;
      const tienCuoc = datCuocFormat[0].tienCuoc;

      await findPhien.save({ session });

      const nguoiDung = await this.CONFIG.MODEL.NGUOI_DUNG.findOne({
        _id: findPhien.nguoiDung,
      }).session(session);

      const tienChenhLech = tienCuocCu - datCuocFormat[0].tienCuoc;

      if (nguoiDung.money + tienChenhLech < 0) {
        throw new BadRequestError("Số tiền còn lại k đủ");
      }

      await this.CONFIG.MODEL.NGUOI_DUNG.updateOne(
        {
          _id: findPhien.nguoiDung,
        },
        { money: nguoiDung.money + tienChenhLech }
      ).session(session);

      const docToUpdate = await this.CONFIG.MODEL.BIEN_DONG_SO_DU.find({
        nguoiDung: findPhien.nguoiDung,
        "metadata.loaiGame": this.CONFIG.ROOM,
        "metadata.phienId": findPhien.phien,
      }).session(session);

      let index = 0;
      let tienCuocTruocTemp = docToUpdate[0].tienTruoc;
      for (const item of docToUpdate) {
        if (item.noiDung.includes("thắng")) continue;
        const soCuaCuoc = item.noiDung.split("").filter((i) => i === "|").length + 1;
        item.tienTruoc = tienCuocTruocTemp;
        item.tienSau = tienCuocTruocTemp - tienCuoc * soCuaCuoc;

        const datCuocSlice = datCuocFormat.slice(index, index + soCuaCuoc);
        const datCuocString = datCuocSlice
          .map((i) => `Cược ${convertChiTietCuoc(i.chiTietCuoc)} - ${convertMoney(i.tienCuoc)}`)
          .join(" | ");
        item.noiDung = `Cược game ${this.CONFIG.TYPE_GAME} ${datCuocString}`;
        await item.save({ session });
        tienCuocTruocTemp = item.tienSau;
        index += soCuaCuoc;
      }

      await session.commitTransaction();
      session.endSession();

      this.CONFIG.METHOD.SEND_ROOM_XOCDIA({
        key: `${this.CONFIG.ROOM}:update-lich-su-cuoc-ca-nhan`,
        data: { phien: findPhien._id },
      });

      this.CONFIG.METHOD.SEND_ROOM_ADMIN_XOCDIA({
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
module.exports = GameXocDiaAdminController;
