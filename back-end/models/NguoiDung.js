const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { MIN_LENGTH_ACCOUNT, MIN_LENGTH_PASSWORD, USER_ROLE, USER_STATUS } = require("../configs/user.config");
const HeThong = require("./HeThong");

const nguoiDungSchema = new mongoose.Schema(
  {
    taiKhoan: {
      type: String,
      unique: true,
      trim: true,
      minlength: [MIN_LENGTH_ACCOUNT, `Tài khoản phải từ ${MIN_LENGTH_ACCOUNT} kí tự trở lên`],
      required: [true, "Vui lòng nhập tài khoản"],
    },
    matKhau: {
      type: String,
      trim: true,
      minlength: [MIN_LENGTH_PASSWORD, `Mật khẩu phải từ ${MIN_LENGTH_PASSWORD} kí tự trở lên`],
      required: [true, "Vui lòng nhập mật khẩu"],
    },

    nhapLaiMatKhau: {
      type: String,
      trim: true,
      minlength: [MIN_LENGTH_PASSWORD, `Nhập lại mật khẩu phải từ ${MIN_LENGTH_PASSWORD} kí tự trở lên`],
      required: [true, "Vui lòng nhập nhập lại mật khẩu"],
      validate: {
        validator: function (el) {
          return this.matKhau === el;
        },
        message: "Mật khẩu không trùng khớp",
      },
    },
    soDienThoai: {
      type: String,
      trim: true,
      required: [true, "Vui lòng nhập số điện thoại"],
    },
    matKhauRutTien: {
      type: String,
      trim: true,
      minlength: [MIN_LENGTH_PASSWORD, `Mật khẩu rút tiền phải từ ${MIN_LENGTH_PASSWORD} kí tự trở lên`],
    },

    avatar: {
      type: String,
      default: "https://i.imgur.com/gc17EZ8.jpg",
    },
    money: {
      type: Number,
      default: 0,
    },
    tienCuoc: {
      type: Number,
      default: 0,
    },
    tienThang: {
      type: Number,
      default: 0,
    },

    role: {
      type: String,
      enum: [USER_ROLE.USER, USER_ROLE.ADMIN],
      default: USER_ROLE.USER,
    },
    refreshToken: [
      {
        type: String,
      },
    ],
    refreshTokenUsed: [
      {
        type: String,
      },
    ],
    status: {
      type: Boolean,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    referralCode: {
      type: String,
      // unique: true,
      default: null,
    },
    referralUserId: {
      type: mongoose.Schema.ObjectId,
      ref: "NguoiDung",
    },
    vipLevel: {
      type: Number,
      default: 0,
    },
    publicId: {
      type: Number,
    },
  },
  {
    collection: "NguoiDung",
    timestamps: true,
  }
);
nguoiDungSchema.pre("save", async function (next) {
  const system = await HeThong.findOne({ systemID: 1 });
  this.matKhau = await bcrypt.hash(this.matKhau, 12);
  this.nhapLaiMatKhau = undefined;
  this.publicId = system.currentId;
  system.currentId++;
  await system.save();
  next();
});

const NguoiDung = mongoose.models.NguoiDung || mongoose.model("NguoiDung", nguoiDungSchema);
module.exports = NguoiDung;
