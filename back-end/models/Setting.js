const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema(
  {
    logo: {
      type: String,
      trim: true,
    },
    maGioiThieu: {
      type: String,
      trim: true,
    },
    noiDungPopup: {
      type: String,
      trim: true,
    },
    scriptChat: {
      type: String,
      trim: true,
    },
    vips: [
      {
        level: {
          type: Number,
          required: true,
        },
        url: {
          type: String,
          required: true,
          trim: true,
        },
      },
    ],
    games: {
      keno1P: {
        type: String,
        required: true,
        trim: true,
        default: "active",
      },
      keno3P: {
        type: String,
        required: true,
        trim: true,
        default: "active",
      },
      keno5P: {
        type: String,
        required: true,
        trim: true,
        default: "active",
      },
      xoso3P: {
        type: String,
        required: true,
        trim: true,
        default: "active",
      },
      xoso5P: {
        type: String,
        required: true,
        trim: true,
        default: "active",
      },
      xucxac1P: {
        type: String,
        required: true,
        trim: true,
        default: "active",
      },
      xucxac3P: {
        type: String,
        required: true,
        trim: true,
        default: "active",
      },
      xocdia1P: {
        type: String,
        required: true,
        trim: true,
        default: "active",
      },
    },
  },
  {
    collection: "Setting",
    timestamps: true,
  }
);

const Setting = mongoose.models.Setting || mongoose.model("Setting", SettingSchema);
module.exports = Setting;
