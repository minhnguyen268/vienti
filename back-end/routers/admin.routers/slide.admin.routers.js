const express = require("express");
const AdminController = require("../../controllers/admin/slide.admin.controller");
const authController = require("../../controllers/auth_controller");
const router = express.Router();

// router.route("/get-all").get(authController.protect, authController.reStrictTo("admin"), AdminController.countAllThongBao);
router.route("/video").put(authController.protect, authController.reStrictTo("admin"), AdminController.updateVideo);
router.route("/:id").get(authController.protect, authController.reStrictTo("admin"), AdminController.getChiTietSlide);
router.route("/:id").put(authController.protect, authController.reStrictTo("admin"), AdminController.editSlide);
router.route("/:id").delete(authController.protect, authController.reStrictTo("admin"), AdminController.deleteSlide);
router.route("/").get(authController.protect, authController.reStrictTo("admin"), AdminController.getDanhSachSlide);
router.route("/").post(authController.protect, authController.reStrictTo("admin"), AdminController.createSlide);

module.exports = router;
