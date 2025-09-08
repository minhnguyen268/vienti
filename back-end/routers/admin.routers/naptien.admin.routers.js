const express = require("express");
const AdminController = require("../../controllers/admin/naptien.admin.controller");
const authController = require("../../controllers/auth_controller");
const router = express.Router();

router.route("/get-all").get(authController.protect, authController.reStrictTo("admin"), AdminController.countAllLichSuNap);
router.route("/:id").get(authController.protect, authController.reStrictTo("admin"), AdminController.getChiTietLichSuNap);
router.route("/:id").put(authController.protect, authController.reStrictTo("admin"), AdminController.updateChiTietLichSuNap);
router.route("/").get(authController.protect, authController.reStrictTo("admin"), AdminController.getDanhSachLichSuNap);
router.route("/").post(authController.protect, authController.reStrictTo("admin"), AdminController.napTienChoNguoiDung);
router.route("/:id").delete(authController.protect, authController.reStrictTo("admin"), AdminController.xoaLichSuNap);

module.exports = router;
