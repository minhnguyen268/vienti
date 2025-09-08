const mongoose = require("mongoose");
const { MIN_BET_MONEY, STATUS_BET_GAME, STATUS_HISTORY_GAME, LOAI_CUOC_GAME, LOAI_BI } = require("../configs/game.keno");

const lichSuDatCuocKeno5PSchema = new mongoose.Schema(
  {
    phien: {
      type: mongoose.Schema.ObjectId,
      ref: "GameKeno5P",
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
    collection: "LichSuDatCuocKeno5P",
    timestamps: true,
  }
);

const LichSuDatCuocKeno5P = mongoose.models.LichSuDatCuocKeno5P || mongoose.model("LichSuDatCuocKeno5P", lichSuDatCuocKeno5PSchema);
module.exports = LichSuDatCuocKeno5P;
