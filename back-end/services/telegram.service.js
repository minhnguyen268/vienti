"use strict";
const HeThong = require("../models/HeThong");
const TelegramBot = require("node-telegram-bot-api");
const { TYPE_SEND_MESSAGE } = require("../configs/telegram.config");

class TelegramService {
  static initBot = async () => {
    try {
      const getHeThong = await HeThong.findOne({
        systemID: 1,
      });
      global._telegramBotConfigs = getHeThong?.telegramBotConfigs ?? {};

      global._botToken = getHeThong?.telegramBotConfigs?.botToken ?? "";
      if (!global._botToken) {
        throw new Error("Chưa cấu hình bot telegram");
      }

      const botTelegram = new TelegramBot(global._botToken, { polling: true });

      if (getHeThong) {
        global._telegramReceiveMessageID = getHeThong.telegramBotConfigs.idReceiveMessage;
      }

      global._botTelegram = botTelegram;
    } catch (err) {
      global._botTelegram = null;
      global._telegramBotConfigs = {};
      console.error("Bot không hợp lệ:", err);
    }
  };
  static sendNotification = ({ content, type = TYPE_SEND_MESSAGE.MESSAGE }) => {
    if (global._botTelegram) {
      if (type === TYPE_SEND_MESSAGE.MESSAGE) {
        global._botTelegram.sendMessage(global._telegramReceiveMessageID, content).catch((err) => {
          console.log(err);
        });
      } else if (type === TYPE_SEND_MESSAGE.GAME && global._telegramBotConfigs?.isGameNotify) {
        global._botTelegram.sendMessage(global._telegramReceiveMessageID, content).catch((err) => {
          console.log(err);
        });
      } else if (type === TYPE_SEND_MESSAGE.DEPOSIT && global._telegramBotConfigs?.isDepositNotify) {
        global._botTelegram.sendMessage(global._telegramReceiveMessageID, content).catch((err) => {
          console.log(err);
        });
      } else if (type === TYPE_SEND_MESSAGE.WITHDRAW && global._telegramBotConfigs?.isWithdrawNotify) {
        global._botTelegram.sendMessage(global._telegramReceiveMessageID, content).catch((err) => {
          console.log(err);
        });
      }
    }
  };
}

module.exports = TelegramService;
