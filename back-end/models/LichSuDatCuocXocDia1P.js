const mongoose = require("mongoose");
const { MIN_BET_MONEY, STATUS_BET_GAME, STATUS_HISTORY_GAME, LOAI_CUOC_GAME, CHI_TIET_CUOC_GAME } = require("../configs/game.xocdia");

const lichSuDatCuocXocDia1PSchema = new mongoose.Schema(
  {
    phien: {
      type: mongoose.Schema.ObjectId,
      ref: "GameXocDia1P",
    },
    nguoiDung: {
      type: mongoose.Schema.ObjectId,
      ref: "NguoiDung",
    },
    datCuoc: [
      {
        loaiCuoc: {
          type: String,
          enum: Object.values(LOAI_CUOC_GAME),
        },
        chiTietCuoc: {
          type: String,
          enum: Object.values(CHI_TIET_CUOC_GAME),
        },
        tienCuoc: {
          type: Number,
          min: MIN_BET_MONEY,
          default: 0,
        },
        trangThai: {
          type: String,
          enum: Object.values(STATUS_BET_GAME),
          default: STATUS_BET_GAME.DANG_CHO,
        },
        createdAt: {
          type: Date,
          default: Date.now,
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
    collection: "LichSuDatCuocXocDia1P",
    timestamps: true,
  }
);

const LichSuDatCuocXocDia1P = mongoose.models.LichSuDatCuocXocDia1P || mongoose.model("LichSuDatCuocXocDia1P", lichSuDatCuocXocDia1PSchema);
module.exports = LichSuDatCuocXocDia1P;
