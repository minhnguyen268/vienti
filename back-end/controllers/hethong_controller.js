const HeThong = require("../models/HeThong");
const { BadRequestError } = require("../utils/app_error");
const catchAsync = require("../utils/catch_async");
const { OkResponse } = require("../utils/successResponse");
const BotGame = require("../models/BotGame");

exports.getNganHang = catchAsync(async (req, res, next) => {
  const data = await HeThong.findOne({
    systemID: 1,
    danhSachNganHang: {
      $elemMatch: {
        status: true,
      },
    },
  }).select("danhSachNganHang");
  return new OkResponse({
    message: "Lấy danh sách ngân hàng thành công",
    data: data?.danhSachNganHang?.filter((item) => item.status) ?? [],
  }).send(res);
});
exports.getSlide = catchAsync(async (req, res, next) => {
  const data = await HeThong.findOne({
    systemID: 1,
  });
  return new OkResponse({
    data: data?.danhSachSlide ?? [],
    metadata: {
      bannerVideo: data?.bannerVideo || "",
    },
  }).send(res);
});
exports.getConfigTawk = catchAsync(async (req, res, next) => {
  const results = await HeThong.findOne({
    systemID: 1,
  }).select("cskhConfigs.tawk");
  return new OkResponse({
    data: results?.cskhConfigs?.tawk ?? {},
  }).send(res);
});
exports.getLatestBotGames = catchAsync(async (req, res, next) => {
  // get latest 10 bot games
  const results = await BotGame.find().sort({ createdAt: -1 }).limit(10);

  return new OkResponse({
    data: results,
  }).send(res);
});
exports.getCSKHLink = catchAsync(async (req, res, next) => {
  const results = await HeThong.findOne({
    systemID: 1,
  }).select("cskhConfigs.link");
  return new OkResponse({
    data: results?.cskhConfigs?.link,
  }).send(res);
});
