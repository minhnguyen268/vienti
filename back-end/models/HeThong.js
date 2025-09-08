const mongoose = require("mongoose");
const { DEFAULT_SETTING_GAME } = require("../configs/game.keno");
function getTileValue(value) {
  if (typeof value !== "undefined") {
    return parseFloat(value.toString());
  }
  return value;
}

const heThongSchema = new mongoose.Schema(
  {
    systemID: { type: Number, default: 1 },
    currentId: { type: Number },
    danhSachNganHang: [
      {
        shortName: { type: String },
        tenBank: { type: String },
        tenChuTaiKhoan: { type: String },
        soTaiKhoan: { type: String },
        image: { type: String },
        code: { type: String },
        status: { type: Boolean, default: true },
      },
    ],
    danhSachSlide: [
      {
        hinhAnh: { type: String },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    bannerVideo: { type: String, default: "" },
    bots: [
      {
        taiKhoan: { type: String },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    telegramBotConfigs: {
      idReceiveMessage: { type: String, default: "" },
      botToken: { type: String, default: "" },
      isGameNotify: { type: Boolean, default: true },
      isDepositNotify: { type: Boolean, default: true },
      isWithdrawNotify: { type: Boolean, default: true },
    },

    cskhConfigs: {
      tawk: {
        propertyId: { type: String, default: "property_id" },
        widgetId: { type: String, default: "default" },
      },
      telegram: {
        tenNguoiDung: { type: String, default: "" },
        status: { type: Boolean, default: true },
      },
      link: { type: String, default: "" },
    },
    gameConfigs: {
      kenoConfigs: {
        keno1P: {
          tiLeTraThuong: {
            bi_1: {
              C: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_1_CHAN_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              L: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_1_LE_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              LON: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_1_LON_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              NHO: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_1_NHO_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
            },
            bi_2: {
              C: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_2_CHAN_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              L: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_2_LE_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              LON: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_2_LON_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              NHO: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_2_NHO_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
            },
            bi_3: {
              C: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_3_CHAN_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              L: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_3_LE_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              LON: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_3_LON_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              NHO: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_3_NHO_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
            },
            bi_4: {
              C: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_4_CHAN_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              L: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_4_LE_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              LON: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_4_LON_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              NHO: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_4_NHO_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
            },
            bi_5: {
              C: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_5_CHAN_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              L: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_5_LE_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              LON: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_5_LON_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              NHO: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_5_NHO_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
            },
          },
          tiLeCLTX: {
            type: mongoose.Types.Decimal128,
            default: 1.98,
            get: getTileValue,
          },
          autoGame: {
            type: Boolean,
            default: true,
          },
        },
        keno3P: {
          tiLeTraThuong: {
            bi_1: {
              C: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_1_CHAN_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              L: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_1_LE_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              LON: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_1_LON_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              NHO: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_1_NHO_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
            },
            bi_2: {
              C: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_2_CHAN_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              L: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_2_LE_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              LON: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_2_LON_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              NHO: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_2_NHO_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
            },
            bi_3: {
              C: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_3_CHAN_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              L: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_3_LE_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              LON: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_3_LON_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              NHO: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_3_NHO_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
            },
            bi_4: {
              C: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_4_CHAN_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              L: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_4_LE_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              LON: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_4_LON_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              NHO: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_4_NHO_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
            },
            bi_5: {
              C: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_5_CHAN_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              L: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_5_LE_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              LON: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_5_LON_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              NHO: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_5_NHO_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
            },
          },
          tiLeCLTX: {
            type: mongoose.Types.Decimal128,
            default: 1.98,
            get: getTileValue,
          },
          autoGame: {
            type: Boolean,
            default: true,
          },
        },
        keno5P: {
          tiLeTraThuong: {
            bi_1: {
              C: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_1_CHAN_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              L: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_1_LE_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              LON: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_1_LON_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              NHO: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_1_NHO_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
            },
            bi_2: {
              C: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_2_CHAN_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              L: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_2_LE_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              LON: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_2_LON_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              NHO: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_2_NHO_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
            },
            bi_3: {
              C: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_3_CHAN_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              L: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_3_LE_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              LON: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_3_LON_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              NHO: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_3_NHO_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
            },
            bi_4: {
              C: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_4_CHAN_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              L: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_4_LE_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              LON: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_4_LON_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              NHO: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_4_NHO_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
            },
            bi_5: {
              C: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_5_CHAN_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              L: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_5_LE_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              LON: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_5_LON_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
              NHO: {
                type: mongoose.Types.Decimal128,
                default: DEFAULT_SETTING_GAME.BI_5_NHO_BET_PAYOUT_PERCENT,
                get: getTileValue,
              },
            },
          },
          tiLeCLTX: {
            type: mongoose.Types.Decimal128,
            default: 1.98,
            get: getTileValue,
          },
          autoGame: {
            type: Boolean,
            default: true,
          },
        },
      },
      xucXacConfigs: {
        xucXac1P: {
          tiLeCLTX: { type: mongoose.Types.Decimal128, default: 1.98, get: getTileValue },
          autoGame: {
            type: Boolean,
            default: true,
          },
        },
        xucXac3P: {
          tiLeCLTX: { type: mongoose.Types.Decimal128, default: 1.98, get: getTileValue },
          autoGame: {
            type: Boolean,
            default: true,
          },
        },
        xucXac5P: {
          tiLeCLTX: { type: mongoose.Types.Decimal128, default: 1.98, get: getTileValue },
          autoGame: {
            type: Boolean,
            default: true,
          },
        },
      },
      xocDiaConfigs: {
        xocDia1P: {
          tiLeCL: { type: mongoose.Types.Decimal128, default: 1.98, get: getTileValue },
          tiLeBaMot: { type: mongoose.Types.Decimal128, default: 3.5, get: getTileValue },
          tiLeHaiHai: { type: mongoose.Types.Decimal128, default: 3.5, get: getTileValue },
          tiLeFull: { type: mongoose.Types.Decimal128, default: 12, get: getTileValue },
          autoGame: {
            type: Boolean,
            default: true,
          },
        },
      },
      xoSoConfigs: {
        xoSo3P: {
          tiLeLo: { type: mongoose.Types.Decimal128, default: 1.98, get: getTileValue },
          tiLeDe: { type: mongoose.Types.Decimal128, default: 3.5, get: getTileValue },
          tiLeBaCang: { type: mongoose.Types.Decimal128, default: 3.5, get: getTileValue },
          tiLeLoXien2: { type: mongoose.Types.Decimal128, default: 12, get: getTileValue },
          tiLeLoXien3: { type: mongoose.Types.Decimal128, default: 12, get: getTileValue },
          tiLeLoXien4: { type: mongoose.Types.Decimal128, default: 12, get: getTileValue },
          autoGame: {
            type: Boolean,
            default: true,
          },
        },
        xoSo5P: {
          tiLeLo: { type: mongoose.Types.Decimal128, default: 1.98, get: getTileValue },
          tiLeDe: { type: mongoose.Types.Decimal128, default: 3.5, get: getTileValue },
          tiLeBaCang: { type: mongoose.Types.Decimal128, default: 3.5, get: getTileValue },
          tiLeLoXien2: { type: mongoose.Types.Decimal128, default: 12, get: getTileValue },
          tiLeLoXien3: { type: mongoose.Types.Decimal128, default: 12, get: getTileValue },
          tiLeLoXien4: { type: mongoose.Types.Decimal128, default: 12, get: getTileValue },
          autoGame: {
            type: Boolean,
            default: true,
          },
        },
      },
    },
  },
  {
    collection: "HeThong",
    timestamps: true,
    toJSON: { getters: true },
  }
);

const HeThong = mongoose.models.HeThong || mongoose.model("HeThong", heThongSchema);
module.exports = HeThong;
