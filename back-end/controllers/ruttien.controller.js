const { default: mongoose } = require("mongoose");
const { MIN_MONEY_WITHDRAW } = require("../configs/withdraw.config");
const LichSuRut = require("../models/LichSuRut");
const LienKetNganHang = require("../models/LienKetNganHang");
const { UnauthorizedError, BadRequestError } = require("../utils/app_error");
const catchAsync = require("../utils/catch_async");
const { convertMoney } = require("../utils/convertMoney");
const { OkResponse, CreatedResponse } = require("../utils/successResponse");
const _ = require("lodash");
const BienDongSoDuServiceFactory = require("../services/biendongsodu.service");
const { TYPE_BALANCE_FLUCTUATION } = require("../configs/balance.fluctuation.config");
const UserSocketService = require("../services/user.socket.service");
const TelegramService = require("../services/telegram.service");
const { TYPE_SEND_MESSAGE } = require("../configs/telegram.config");
const NguoiDung = require("../models/NguoiDung");
const bcrypt = require("bcryptjs");
const WithdrawSocketService = require("../services/withdraw.socket.service");

class RutTienController {
  static getDanhSach = catchAsync(async (req, res, next) => {
    const page = req.query.page * 1 || 1;
    const results = req.query.results * 1 || 10;
    const skip = (page - 1) * results;
    let sortValue = ["-createdAt"];
    sortValue = sortValue.join(" ");
    const { _id: userId } = req.user;
    const list = await LichSuRut.find({ nguoiDung: userId }).skip(skip).limit(results).sort(sortValue).populate("nganHang").lean();
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
  static createRutTien = catchAsync(async (req, res, next) => {
    const { _id: userId, money, taiKhoan, matKhauRutTien: matKhauRutTienUser, tienCuoc } = req.user;
    const { soTien, nganHang, matKhauRutTien } = req.body;
    if (!soTien || !nganHang || !matKhauRutTien) {
      throw new UnauthorizedError("Vui lòng nhập đầy đủ thông tin");
    }
    if (!_.isNumber(soTien)) {
      throw new UnauthorizedError("Vui lòng nhập đầy đủ thông tin");
    }
    if (tienCuoc <= 0) {
      throw new BadRequestError("Bạn cần đạt cược ít nhất 1 lần để rút tiền");
    }
    if (soTien < MIN_MONEY_WITHDRAW) {
      throw new UnauthorizedError("Số tiền rút tối thiểu phải là " + convertMoney(MIN_MONEY_WITHDRAW));
    }
    if (soTien > money) {
      throw new UnauthorizedError("Không đủ tiền để rút");
    }
    const findThongTinNganHang = await LienKetNganHang.findOne({
      _id: nganHang,
    });
    if (!findThongTinNganHang) {
      throw new UnauthorizedError("Không tìm thấy thông tin ngân hàng của bạn");
    }

    // Allow only withdraw 3 times per day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const countWithdrawToday = await LichSuRut.countDocuments({
      nguoiDung: userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });
    if (countWithdrawToday >= 3) {
      throw new BadRequestError("Bạn chỉ được phép rút tối đa 3 lần mỗi ngày");
    }

    const authPasswordWithdraw = await bcrypt.compare(matKhauRutTien, matKhauRutTienUser);
    if (!authPasswordWithdraw) {
      throw new BadRequestError("Mật khẩu rút tiền không chính xác");
    }

    const session = await mongoose.startSession();

    await session.withTransaction(async () => {
      try {
        const insertLichSuRut = await LichSuRut.create(
          [
            {
              nguoiDung: userId,
              nganHang,
              soTien,
            },
          ],
          {
            session,
          }
        );
        // Tru tien User
        const updateUserMoney = await NguoiDung.findOneAndUpdate(
          {
            taiKhoan,
          },
          { $inc: { money: -soTien } },
          {
            new: false,
            session,
          }
        );

        const thongTinNganHang = `${findThongTinNganHang.tenNganHang} - ${findThongTinNganHang.tenChuTaiKhoan} - ${findThongTinNganHang.soTaiKhoan}`;
        await BienDongSoDuServiceFactory.createBienDong({
          type: TYPE_BALANCE_FLUCTUATION.WITHDRAW,
          payload: {
            nguoiDung: userId,
            tienTruoc: money,
            tienSau: money - soTien,
            noiDung: `Gửi yêu cầu rút tiền về ${thongTinNganHang} với số tiền ${convertMoney(soTien)}`,
            nganHang: thongTinNganHang,
          },
          options: {
            session,
          },
        });

        // Update số dư tài khoản realtime
        UserSocketService.updateUserBalance({ user: taiKhoan, updateBalance: -soTien });

        // Send notification Telegram
        const noiDungBot = `${taiKhoan} vừa gửi yêu cầu rút tiền về ${thongTinNganHang} với số tiền ${convertMoney(soTien)}`;
        TelegramService.sendNotification({ content: noiDungBot, type: TYPE_SEND_MESSAGE.WITHDRAW });

        WithdrawSocketService.updateUsersWithdrawList();
        await session.commitTransaction();
      } catch (err) {
        console.log(err);
        await session.abortTransaction();
        throw err;
      } finally {
        await session.endSession();
      }
    });

    return new CreatedResponse({
      message: "Gửi yêu cầu rút tiền thành công",
    }).send(res);
  });
}
module.exports = RutTienController;
