const express = require("express");
const GameXucXac3PAdminController = require("../../controllers/admin/game.xucxac.3p.admin.controller");
const authController = require("../../controllers/auth_controller");

const router = express.Router();
router.use("/lich-su", require("./lichsu.game.xucxac.3p.admin.routers"));
router.route("/ti-le").post(authController.protect, authController.reStrictTo("admin"), GameXucXac3PAdminController.setTiLeGame);
router.route("/autogame").post(authController.protect, authController.reStrictTo("admin"), GameXucXac3PAdminController.setStatusAutoGame);

router.route("/ti-le").get(authController.protect, authController.reStrictTo("admin"), GameXucXac3PAdminController.getTiLeGame);
router.route("/autogame").get(authController.protect, authController.reStrictTo("admin"), GameXucXac3PAdminController.getStatusAutoGame);
router.route("/:id").get(authController.protect, authController.reStrictTo("admin"), GameXucXac3PAdminController.getLichSuGameChiTiet);
router.route("/thay-doi-cuoc").post(authController.protect, authController.reStrictTo("admin"), GameXucXac3PAdminController.thayDoiCuoc);

module.exports = router;
