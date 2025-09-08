const { default: mongoose } = require("mongoose");
const { MIN_MONEY_WITHDRAW, STATUS_WITHDRAW } = require("../../configs/withdraw.config");
const LichSuNap = require("../../models/LichSuNap");
const LienKetNganHang = require("../../models/LienKetNganHang");
const { UnauthorizedError, BadRequestError } = require("../../utils/app_error");
const catchAsync = require("../../utils/catch_async");
const { convertMoney } = require("../../utils/convertMoney");
const { OkResponse, CreatedResponse } = require("../../utils/successResponse");
const _ = require("lodash");
const BienDongSoDuServiceFactory = require("../../services/biendongsodu.service");
const { TYPE_BALANCE_FLUCTUATION } = require("../../configs/balance.fluctuation.config");
const UserSocketService = require("../../services/user.socket.service");
const TelegramService = require("../../services/telegram.service");
const { TYPE_SEND_MESSAGE } = require("../../configs/telegram.config");
const { LOAI_DEPOSIT, STATUS_DEPOSIT } = require("../../configs/deposit.config");
const NguoiDung = require("../../models/NguoiDung");
const HeThong = require("../../models/HeThong");
const BienDongSoDu = require("../../models/BienDongSoDu");

class NapTienAdminController {
  static getChiTietLichSuNap = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const data = await LichSuNap.findOne({ _id: id })
      .select("-__v")
      .populate({
        path: "nguoiDung",
        select: "taiKhoan",
      })

      .lean();
    if (!data) {
      throw new BadRequestError("Lịch sử nạp không tồn tại");
    }
    return new OkResponse({
      data: data,
    }).send(res);
  });
  static updateChiTietLichSuNap = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { tinhTrang, noiDung } = req.body;
    const data = await LichSuNap.findOne({ _id: id })
      .select("-__v")
      .populate({
        path: "nguoiDung",
      })
      .lean();
    if (!data) {
      throw new BadRequestError("Lịch sử nạp không tồn tại");
    }

    const session = await mongoose.startSession();

    await session.withTransaction(async () => {
      try {
        const updateLichSuNap = await LichSuNap.findOneAndUpdate(
          { _id: id },
          { tinhTrang, noiDung },
          {
            session,
            new: false,
          }
        );

        // Hoàn tất thì cộng tiền cho người dùng
        if (updateLichSuNap.tinhTrang === STATUS_DEPOSIT.PENDING && tinhTrang === STATUS_DEPOSIT.SUCCESS) {
          // Cong tien User
          const updateUserMoney = await NguoiDung.findOneAndUpdate(
            {
              taiKhoan: data.nguoiDung.taiKhoan,
            },
            { $inc: { money: data.soTien } },
            {
              new: false,
              session,
            }
          );

          // Update số dư tài khoản realtime
          UserSocketService.updateUserBalance({ user: data.nguoiDung.taiKhoan, updateBalance: data.soTien });

          const thongTinNganHang = `${data.nganHang.shortName} - ${data.nganHang.tenChuTaiKhoan} - ${data.nganHang.soTaiKhoan}`;
          await BienDongSoDuServiceFactory.createBienDong({
            type: TYPE_BALANCE_FLUCTUATION.DEPOSIT,
            payload: {
              nguoiDung: updateUserMoney._id,
              tienTruoc: updateUserMoney.money,
              tienSau: updateUserMoney.money + data.soTien,
              noiDung: `Cộng tiền do đơn nạp tiền thành công từ ${thongTinNganHang} với số tiền ${convertMoney(data.soTien)}. `,
              loaiDeposit: LOAI_DEPOSIT.NAP_TIEN,
            },
            options: {
              session,
            },
          });
        }

        await session.commitTransaction();
      } catch (err) {
        console.log(err);
        await session.abortTransaction();
        throw err;
      } finally {
        await session.endSession();
      }
    });

    return new OkResponse({
      message: "Cập nhật thành công",
    }).send(res);
  });

  static countAllLichSuNap = catchAsync(async (req, res, next) => {
    const userId = req.query.userId || "";
    let query = {};
    if (userId) {
      query = {
        nguoiDung: userId,
      };
    }
    const countList = await LichSuNap.countDocuments(query);
    return new OkResponse({
      data: countList,
      metadata: {
        userId,
      },
    }).send(res);
  });
  static getDanhSachLichSuNap = catchAsync(async (req, res, next) => {
    const userId = req.query.userId || "";
    const page = req.query.page * 1 || 1;
    const results = req.query.results * 1 || 10;
    const skip = (page - 1) * results;
    let sortValue = ["-createdAt"];
    sortValue = sortValue.join(" ");
    let query = {};
    if (userId) {
      query = {
        nguoiDung: userId,
      };
    }
    const list = await LichSuNap.find(query).select("-__v").skip(skip).limit(results).sort(sortValue).lean().populate({
      path: "nguoiDung",
      select: "taiKhoan",
    });
    return new OkResponse({
      data: list,
      metadata: {
        results: list.length,
        page,
        limitItems: results,
        sort: sortValue,
        userId,
      },
    }).send(res);
  });
  static napTienChoNguoiDung = catchAsync(async (req, res, next) => {
    const { userId, soTien, nganHang, noiDung } = req.body;
    if (!soTien || !userId || !_.isNumber(soTien)) {
      throw new BadRequestError("Vui lòng nhập đầy đủ thông tin");
    }

    const user = await NguoiDung.findOne({ _id: userId });
    if (!user) {
      throw new BadRequestError("Người dùng không tồn tại");
    }

    const session = await mongoose.startSession();

    await session.withTransaction(async () => {
      try {
        let findThongTinNganHang;
        if (nganHang) {
          const hethong = await HeThong.findOne({
            systemID: 1,
            danhSachNganHang: {
              $elemMatch: {
                _id: nganHang,
              },
            },
          });
          findThongTinNganHang = (hethong.danhSachNganHang || []).find((item) => item._id.toString() === nganHang);
        }

        const bienDongSodu = await BienDongSoDuServiceFactory.createBienDong({
          type: TYPE_BALANCE_FLUCTUATION.DEPOSIT,
          payload: {
            nguoiDung: userId,
            tienTruoc: user.money,
            tienSau: user.money + soTien,
            noiDung: "Nạp tiền vào tài khoản",
            loaiDeposit: LOAI_DEPOSIT.NAP_TIEN,
          },
          options: {
            session,
          },
        });

        await LichSuNap.create(
          [
            {
              nguoiDung: userId,
              nganHang: findThongTinNganHang ?? undefined,
              soTien,
              tinhTrang: STATUS_DEPOSIT.SUCCESS,
              noiDung,
              bienDongSoDuId: bienDongSodu[0]._id.toString(),
            },
          ],
          {
            session,
          }
        );

        await NguoiDung.findOneAndUpdate(
          {
            taiKhoan: user.taiKhoan,
          },
          { $inc: { money: soTien } },
          {
            new: false,
            session,
          }
        );

        UserSocketService.updateUserBalance({ user: user.taiKhoan, updateBalance: soTien });

        await session.commitTransaction();
      } catch (err) {
        console.log(err);
        await session.abortTransaction();
        throw err;
      } finally {
        await session.endSession();
      }
    });

    return new OkResponse({
      data: "success",
    }).send(res);
  });

  static xoaLichSuNap = catchAsync(async (req, res, next) => {
    const { id } = req.params;

    const lichSuNap = await LichSuNap.findOne({ _id: id });
    if (!lichSuNap) {
      throw new BadRequestError("Lịch sử nạp không tồn tại");
    }

    const session = await mongoose.startSession();

    await session.withTransaction(async () => {
      try {
        await LichSuNap.deleteOne({ _id: id }, { session });
        if (lichSuNap.bienDongSoDuId) {
          await BienDongSoDu.deleteOne({ _id: lichSuNap.bienDongSoDuId }, { session });
        }
        await session.commitTransaction();
      } catch (err) {
        console.log(err);
        await session.abortTransaction();
        throw err;
      } finally {
        await session.endSession();
      }
    });

    return new OkResponse({
      data: "success",
    }).send(res);
  });
}
module.exports = NapTienAdminController;
