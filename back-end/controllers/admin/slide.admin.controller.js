"use strict";

const catchAsync = require("../../utils/catch_async");
const _ = require("lodash");
const { OkResponse, CreatedResponse } = require("../../utils/successResponse");

const ThongBao = require("../../models/ThongBao");
const { BadRequestError } = require("../../utils/app_error");
const HeThong = require("../../models/HeThong");

class SlideAdminController {
  static getChiTietSlide = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const data = await HeThong.findOne({
      systemID: 1,
      danhSachSlide: {
        $elemMatch: {
          _id: id,
        },
      },
    })
      .select("danhSachSlide")
      .lean();
    if (!data) {
      throw new BadRequestError("Slide không tồn tại");
    }

    return new OkResponse({
      data: data?.danhSachSlide?.[0] ?? null,
    }).send(res);
  });
  static updateVideo = catchAsync(async (req, res, next) => {
    const { bannerVideo } = req.body;

    await HeThong.findOneAndUpdate(
      {
        systemID: 1,
      },
      {
        bannerVideo,
      }
    );

    return new CreatedResponse({
      message: "Cập nhật video thành công",
    }).send(res);
  });
  static createSlide = catchAsync(async (req, res, next) => {
    const { hinhAnh } = req.body;

    if (!hinhAnh) {
      throw new BadRequestError("Vui lòng nhập đầy đủ thông tin");
    }

    const data = await HeThong.findOneAndUpdate(
      {
        systemID: 1,
      },
      {
        $push: {
          danhSachSlide: {
            hinhAnh,
          },
        },
      }
    );

    return new CreatedResponse({
      message: "Tạo slide thành công",
    }).send(res);
  });
  static editSlide = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { hinhAnh } = req.body;
    const data = await HeThong.findOneAndUpdate(
      {
        systemID: 1,
        danhSachSlide: {
          $elemMatch: {
            _id: id,
          },
        },
      },
      {
        $set: {
          "danhSachSlide.$.hinhAnh": hinhAnh,
        },
      },
      {
        new: false,
      }
    );
    if (!data) {
      throw new BadRequestError("Slide không tồn tại");
    }
    return new OkResponse({
      message: "Chỉnh sửa thành công",
    }).send(res);
  });
  static deleteSlide = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const data = await HeThong.findOneAndUpdate(
      {
        systemID: 1,
      },
      {
        $pull: {
          danhSachSlide: {
            _id: id,
          },
        },
      }
    );

    return new OkResponse({
      message: "Xóa thông báo thành công",
    }).send(res);
  });
  static countAllSlide = catchAsync(async (req, res, next) => {
    const countList = await HeThong.findOne({
      systemID: 1,
    }).select("danhSachSlide");
    return new OkResponse({
      data: countList?.danhSachSlide?.length ?? 0,
    }).send(res);
  });
  static getDanhSachSlide = catchAsync(async (req, res, next) => {
    const list = await HeThong.findOne({
      systemID: 1,
    });

    return new OkResponse({
      data: list?.danhSachSlide ?? [],
      metadata: {
        results: list?.danhSachSlide?.length ?? 0,
        bannerVideo: list?.bannerVideo || "",
      },
    }).send(res);
  });
}

module.exports = SlideAdminController;
