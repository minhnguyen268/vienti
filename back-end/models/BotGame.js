const mongoose = require("mongoose");

const botGameSchema = new mongoose.Schema(
  {
    taiKhoan: {
      type: String,
      trim: true,
    },
    soTien: {
      type: Number,
      default: 0,
    },
    game: {
      type: String,
      trim: true,
    },
  },
  {
    collection: "BotGame",
    timestamps: true,
  }
);

const BotGame = mongoose.models.BotGame || mongoose.model("BotGame", botGameSchema);
module.exports = BotGame;
