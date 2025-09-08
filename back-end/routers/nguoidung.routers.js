const express = require("express");
const NguoiDungController = require("../controllers/nguoidung.controller");
const authController = require("../controllers/auth_controller");
const router = express.Router();

router.route("/").get(authController.protect, NguoiDungController.getDetailedUser);
router.route("/refresh-token").post(authController.protect, NguoiDungController.refreshToken);
router.route("/sign-in").post(NguoiDungController.signInUser);
router.route("/sign-out").post(NguoiDungController.signOutUser);
router.route("/change-password").post(authController.protect, NguoiDungController.changePassword);
router.route("/update-password-withdraw").post(authController.protect, NguoiDungController.updatePasswordWithdraw);
router.route("/check-has-withdraw-password").post(authController.protect, NguoiDungController.checkHasWithdrawPassword);
router.route("/change-phone").post(authController.protect, NguoiDungController.changePhone);
router.route("/sign-up").post(NguoiDungController.createUser);

module.exports = router;
