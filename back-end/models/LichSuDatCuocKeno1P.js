const mongoose = require("mongoose");
const { MIN_BET_MONEY, STATUS_BET_GAME, STATUS_HISTORY_GAME, LOAI_CUOC_GAME, LOAI_BI } = require("../configs/game.keno");

const lichSuDatCuocKeno1PSchema = new mongoose.Schema(
  {
    phien: {
      type: mongoose.Schema.ObjectId,
      ref: "GameKeno1P",
    },
    nguoiDung: {
      type: mongoose.Schema.ObjectId,
      ref: "NguoiDung",
    },
    datCuoc: [
      {
        loaiBi: {
          type: String,
          enum: Object.values(LOAI_BI),
        },
        chiTietCuoc: [
          {
            loaiCuoc: { type: String, enum: Object.values(LOAI_CUOC_GAME) },
            tienCuoc: {
              type: Number,
              min: MIN_BET_MONEY,
              default: 0,
            },
          },
        ],
        tongTienCuoc: {
          type: Number,
          min: MIN_BET_MONEY,
          default: 0,
        },
        tongThang: {
          type: Number,
          default: 0,
        },
        trangThai: {
          type: String,
          enum: Object.values(STATUS_BET_GAME),
          default: STATUS_BET_GAME.DANG_CHO,
        },
      },
    ],

    tinhTrang: {
      type: String,
      enum: Object.values(STATUS_HISTORY_GAME),
      default: STATUS_HISTORY_GAME.DANG_CHO,
    },
  },
  {
    collection: "LichSuDatCuocKeno1P",
    timestamps: true,
  }
);

const LichSuDatCuocKeno1P = mongoose.models.LichSuDatCuocKeno1P || mongoose.model("LichSuDatCuocKeno1P", lichSuDatCuocKeno1PSchema);
module.exports = LichSuDatCuocKeno1P;
