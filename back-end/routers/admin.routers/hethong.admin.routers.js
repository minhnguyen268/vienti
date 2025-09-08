const express = require("express");
const AdminController = require("../../controllers/admin/hethong.admin.controller");
const authController = require("../../controllers/auth_controller");
const router = express.Router();

router.route("/bot-telegram").get(authController.protect, authController.reStrictTo("admin"), AdminController.getBotTelegramConfig);
router.route("/tawk-to").get(authController.protect, authController.reStrictTo("admin"), AdminController.getTawkToConfig);
router.route("/bot-telegram").put(authController.protect, authController.reStrictTo("admin"), AdminController.updateBotTelegramConfig);
router.route("/tawk-to").put(authController.protect, authController.reStrictTo("admin"), AdminController.updateTawkToConfig);
router.route("/cskh-link").put(authController.protect, authController.reStrictTo("admin"), AdminController.updateCSKHLink);
router.route("/cskh-link").get(authController.protect, authController.reStrictTo("admin"), AdminController.getCSKHLink);

module.exports = router;
