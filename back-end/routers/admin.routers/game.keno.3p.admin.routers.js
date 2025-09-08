const express = require("express");
const GameKeno3PAdminController = require("../../controllers/admin/game.keno.3p.admin.controller");
const authController = require("../../controllers/auth_controller");
const router = express.Router();

router.use("/lich-su", require("./lichsu.game.keno.3p.admin.routers"));
router.route("/ti-le").post(authController.protect, authController.reStrictTo("admin"), GameKeno3PAdminController.setTiLeGame);
router.route("/autogame").post(authController.protect, authController.reStrictTo("admin"), GameKeno3PAdminController.setStatusAutoGame);
router.route("/ti-le").get(authController.protect, authController.reStrictTo("admin"), GameKeno3PAdminController.getTiLeGame);
router.route("/autogame").get(authController.protect, authController.reStrictTo("admin"), GameKeno3PAdminController.getStatusAutoGame);
router.route("/thay-doi-cuoc").post(authController.protect, authController.reStrictTo("admin"), GameKeno3PAdminController.thayDoiCuoc);
router.route("/:id").get(authController.protect, authController.reStrictTo("admin"), GameKeno3PAdminController.getLichSuGameChiTiet);
module.exports = router;
