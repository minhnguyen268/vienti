"use strict";

const catchAsync = require("../../utils/catch_async");
const _ = require("lodash");
const { OkResponse, CreatedResponse } = require("../../utils/successResponse");

const Setting = require("../../models/Setting");

const keno1P = require("../../services/game.keno1p.service");
const keno3P = require("../../services/game.keno3p.service");
const keno5P = require("../../services/game.keno5p.service");
const xoso3P = require("../../services/game.xoso3p.service");
const xoso5P = require("../../services/game.xoso5p.service");
const xucxac1P = require("../../services/game.xucxac1p.service");
const xucxac3P = require("../../services/game.xucxac3p.service");
const xocdia1P = require("../../services/game.xocdia1p.service");

class SettingAdminController {
  static get = catchAsync(async (req, res, next) => {
    const data = await Setting.findOne({}).lean();

    return new OkResponse({
      data,
    }).send(res);
  });

  static clientGet = catchAsync(async (req, res, next) => {
    const data = await Setting.findOne({}).lean();

    const { maGioiThieu, ...rest } = data;

    return new OkResponse({
      data: rest,
    }).send(res);
  });

  static update = catchAsync(async (req, res, next) => {
    const { logo, maGioiThieu, noiDungPopup, scriptChat, vips, games } = req.body;
    await Setting.findOneAndUpdate({}, { logo, maGioiThieu, noiDungPopup, scriptChat, vips, games }, { upsert: true });

    if (games) {
      keno1P.setIsPlayGame(games.keno1P === "active");
      keno3P.setIsPlayGame(games.keno3P === "active");
      keno5P.setIsPlayGame(games.keno5P === "active");
      xoso3P.setIsPlayGame(games.xoso3P === "active");
      xoso5P.setIsPlayGame(games.xoso5P === "active");
      xucxac1P.setIsPlayGame(games.xucxac1P === "active");
      xucxac3P.setIsPlayGame(games.xucxac3P === "active");
      xocdia1P.setIsPlayGame(games.xocdia1P === "active");
    }

    return new CreatedResponse({
      message: "Cập nhật thành công",
    }).send(res);
  });
}

module.exports = SettingAdminController;
