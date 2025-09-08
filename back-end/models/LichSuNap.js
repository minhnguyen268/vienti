const mongoose = require("mongoose");
const { STATUS_DEPOSIT } = require("../configs/deposit.config");

const lichSuNapSchema = new mongoose.Schema(
  {
    nguoiDung: {
      type: mongoose.Schema.ObjectId,
      ref: "NguoiDung",
    },
    nganHang: {
      type: Object,
    },
    soTien: {
      type: Number,
      default: 0,
    },
    tinhTrang: {
      type: String,
      enum: [STATUS_DEPOSIT.PENDING, STATUS_DEPOSIT.SUCCESS, STATUS_DEPOSIT.CANCEL],
      default: STATUS_DEPOSIT.PENDING,
    },
    noiDung: {
      type: String,
      trim: true,
    },
    bienDongSoDuId: {
      type: String,
    },
  },
  {
    collection: "LichSuNap",
    timestamps: true,
  }
);

const LichSuNap = mongoose.models.LichSuNap || mongoose.model("LichSuNap", lichSuNapSchema);
module.exports = LichSuNap;
