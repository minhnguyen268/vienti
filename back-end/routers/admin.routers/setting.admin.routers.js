const express = require("express");
const SettingController = require("../../controllers/admin/setting.admin.controller");
const authController = require("../../controllers/auth_controller");
const router = express.Router();

router.route("/").get(SettingController.get);
router.route("/client").get(SettingController.clientGet);
router.route("/").post(authController.protect, authController.reStrictTo("admin"), SettingController.update);

module.exports = router;
