const express = require("express");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
dotenv.config({ path: "./config.env" });
dotenv.config({ path: "./docker.config.env" });
const app = express();
const http = require("http");
const { NotFoundError } = require("./utils/app_error");
const errorController = require("./controllers/error_controller");
const adminRouters = require("./routers/admin.routers");
const thongBaoRouters = require("./routers/thongbao.routers");
const nguoiDungRouters = require("./routers/nguoidung.routers");
const heThongRouters = require("./routers/hethong_routers");
const rutTienRouters = require("./routers/ruttien.routers");
const napTienRouters = require("./routers/naptien.routers");
const bienDongSoDuRouters = require("./routers/biendongsodu.routers");
const gameKeno1PRouters = require("./routers/game.keno.1p.routers");
const gameKeno3PRouters = require("./routers/game.keno.3p.routers");
const gameKeno5PRouters = require("./routers/game.keno.5p.routers");
const lienKetNganHangRouters = require("./routers/lienketnganhang.routers");
const gameXucXac1PRouters = require("./routers/game.xucxac.1p.routers");
const gameXucXac3PRouters = require("./routers/game.xucxac.3p.routers");
const gameXocDia1PRouters = require("./routers/game.xocdia.1p.routers");
const gameXoSo3PRouters = require("./routers/game.xoso.3p.routers");
const gameXoSo5PRouters = require("./routers/game.xoso.5p.routers");
const { clientEndpoint } = require("./configs/endpoint");
const cors = require("cors");
//MIDDLEWARE
app.use(cors());

console.log(clientEndpoint)
app.options(clientEndpoint, cors());
//security http
app.use(helmet());

//development logging
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }

//limit request
const limiter = rateLimit({
  max: 100,
  window: 60 * 60 * 1000,
  message: "Too many requests from this ip, please try again 1 hour later",
});
app.use("/api", limiter);

///// body parser in , reading data from body
app.use(express.json());

//against NoSQL Injection
app.use(mongoSanitize());

//against XSS (HTML, JS)
app.use("/api/v1/admin", adminRouters);
app.use(xss());

//serving static file
app.use(express.static(`${__dirname}/public`));

//test middleware
app.use((req, res, next) => {
  req.timeNow = new Date().toISOString();
  next();
});

//routers
app.get("/", (req, res) => {
  res.status(200).send("Server đang chạy thành công");
});
app.use("/api/v1/hethong", heThongRouters);
app.use("/api/v1/ruttien", rutTienRouters);
app.use("/api/v1/naptien", napTienRouters);
app.use("/api/v1/thongbao", thongBaoRouters);
app.use("/api/v1/nguoidung", nguoiDungRouters);
app.use("/api/v1/biendongsodu", bienDongSoDuRouters);
app.use("/api/v1/lienketnganhang", lienKetNganHangRouters);
app.use("/api/v1/games/keno1p", gameKeno1PRouters);
app.use("/api/v1/games/keno3p", gameKeno3PRouters);
app.use("/api/v1/games/keno5p", gameKeno5PRouters);
app.use("/api/v1/games/xucxac1p", gameXucXac1PRouters);
app.use("/api/v1/games/xucxac3p", gameXucXac3PRouters);
app.use("/api/v1/games/xocdia1p", gameXocDia1PRouters);
app.use("/api/v1/games/xoso3p", gameXoSo3PRouters);
app.use("/api/v1/games/xoso5p", gameXoSo5PRouters);

app.all("*", (req, res, next) => {
  next(new NotFoundError(`No found ${req.originalUrl}`));
});

app.use(errorController);
module.exports = app;
