const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
dotenv.config({ path: "./docker.config.env" });

console.log("DATABASE", process.env.DATABASE);

const http = require("http");
const HeThong = require("./models/HeThong");
const NguoiDung = require("./models/NguoiDung");
const Setting = require("./models/Setting");
const BotGame = require("./models/BotGame");
const TelegramService = require("./services/telegram.service");
const app = require("./app");
const jwt = require("jsonwebtoken");
const { clientEndpoint } = require("./configs/endpoint");
const GameXocDia1PService = require("./services/game.xocdia1p.service");
const GameKeno1PService = require("./services/game.keno1p.service");
const GameKeno3PService = require("./services/game.keno3p.service");
const GameKeno5PService = require("./services/game.keno5p.service");
const GameXucXac1PService = require("./services/game.xucxac1p.service");
const GameXucXac3PService = require("./services/game.xucxac3p.service");
const GameXoSo3PService = require("./services/game.xoso3p.service");
const GameXoSo5PService = require("./services/game.xoso5p.service");
const server = http.createServer(app);

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT EXCEPTION! 💥 Shutting down...");
  console.log("Error: ", err);
  console.log(err.name, err.message);
  process.exit(1);
});

// Database connection
require("./services/mongodb.service");

// Redis connection
const RedisClient = require("./services/redis.service");

const { verifyToken } = require("./utils/verifyToken");

const port = process.env.PORT || 8082;

// Socket IO connection
const io = require("socket.io")(server, {
  cors: {
    origin: clientEndpoint,
  },
  connectionStateRecovery: {
    // the backup duration of the sessions and the packets
    maxDisconnectionDuration: 10 * 60 * 1000,
    // whether to skip middlewares upon successful recovery
    skipMiddlewares: false,
  },
});
global._io = io;

// Socket IO middleware handle authentication
global._io.use(async (socket, next) => {
  const authToken = socket.handshake.auth.token;
  let token;
  try {
    if (authToken && authToken.startsWith("Bearer")) {
      token = authToken.split(" ")[1];
      if (!token) {
        throw new Error("Đăng nhập để tiếp tục");
      }

      const decode = await verifyToken(token);
      socket.join(`${decode.taiKhoan}`);
      global._io.role = decode.role;
      // console.log("ROOM:", global._io.sockets.adapter.rooms);
      next();
    } else {
      throw new Error("Login to continute");
    }
  } catch (err) {
    if (err.message) {
      return next(new Error(err.message));
    }
  }
});
global._io.on("connection", (socket) => {
  global._socket = socket;
  const SocketService = require("./services/socket.service");
  new SocketService().connection(socket);
});

const LOAI_GAME = {
  KENO1P: "keno1p",
  KENO3P: "keno3p",
  KENO5P: "keno5p",
  XUCXAC1P: "xucxac1p",
  XUCXAC3P: "xucxac3p",
  XOCDIA1P: "xocdia1p",
  XOSO3P: "xoso3p",
  XOSO5P: "xoso5p",
};

const POPULAR_AMOUNTS = [
  100000, 150000, 250000, 350000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000, 2000000, 3000000, 4000000,
  5000000,
];

const VALID_AMOUNTS = (() => {
  const arr = [];
  const min = 100000;
  const max = 10000000;

  for (let i = min; i <= max; i += 10000) {
    if (i % 20000 === 0 || i % 50000 === 0) {
      arr.push(i);
    }
  }
  return arr;
})();

const randomSoTien = () => {
  // 60% cơ hội chọn từ POPULAR_AMOUNTS
  if (Math.random() < 0.6) {
    return POPULAR_AMOUNTS[Math.floor(Math.random() * POPULAR_AMOUNTS.length)];
  }

  // 40% cơ hội random số ngẫu nhiên nhưng chia hết cho 20000 hoặc 50000
  return VALID_AMOUNTS[Math.floor(Math.random() * VALID_AMOUNTS.length)];
};

const randomGame = async () => {
  const settingData = await Setting.findOne({}).lean();
  const games = settingData?.games;

  const activeGames = [];

  if (games?.keno1P !== "inactive") {
    activeGames.push(LOAI_GAME.KENO1P);
  }
  if (games?.keno3P !== "inactive") {
    activeGames.push(LOAI_GAME.KENO3P);
  }
  if (games?.keno5P !== "inactive") {
    activeGames.push(LOAI_GAME.KENO5P);
  }
  if (games?.xoso3P !== "inactive") {
    activeGames.push(LOAI_GAME.XOSO3P);
  }
  if (games?.xoso5P !== "inactive") {
    activeGames.push(LOAI_GAME.XOSO5P);
  }
  if (games?.xucxac1P !== "inactive") {
    activeGames.push(LOAI_GAME.XUCXAC1P);
  }
  if (games?.xucxac3P !== "inactive") {
    activeGames.push(LOAI_GAME.XUCXAC3P);
  }
  if (games?.xocdia1P !== "inactive") {
    activeGames.push(LOAI_GAME.XOCDIA1P);
  }

  const randomIndex = Math.floor(Math.random() * activeGames.length);
  return activeGames[randomIndex];
};

const randomBotPlayGame = () => {
  let isRunning = false;

  const intervalId = setInterval(() => {
    if (isRunning) return;

    isRunning = true;
    const randomDelay = Math.floor(Math.random() * 8000) + 2000; // 2-10s

    setTimeout(async () => {
      try {
        const heThong = await HeThong.findOne({ systemID: 1 });

        const bots = heThong?.bots || [];
        if (bots.length === 0) return;

        const randomBot = bots[Math.floor(Math.random() * bots.length)];
        const soTien = randomSoTien();
        const game = await randomGame();

        const playGame = await BotGame.create({
          taiKhoan: randomBot.taiKhoan,
          soTien,
          game,
        });

        // just keep last 1000 records
        const count = await BotGame.countDocuments();
        if (count > 1000) {
          const excess = count - 1000;
          const oldestRecords = await BotGame.find().sort({ createdAt: 1 }).limit(excess);
          const oldestIds = oldestRecords.map((record) => record._id);
          await BotGame.deleteMany({ _id: { $in: oldestIds } });
        }

        // emit socket to all users
        global._io.emit("bot-play-game", playGame);
      } catch (error) {
        console.error("Lỗi khi bot chơi game:", error);
      } finally {
        isRunning = false;
      }
    }, randomDelay);
  }, 1000);

  return () => clearInterval(intervalId);
};

setTimeout(async () => {
  const settingData = await Setting.findOne({}).lean();
  const games = settingData?.games;

  if (games?.keno1P !== "inactive") {
    GameKeno1PService.startGame();
  }
  if (games?.keno3P !== "inactive") {
    GameKeno3PService.startGame();
  }
  if (games?.keno5P !== "inactive") {
    GameKeno5PService.startGame();
  }
  if (games?.xoso3P !== "inactive") {
    GameXoSo3PService.startGame();
  }
  if (games?.xoso5P !== "inactive") {
    GameXoSo5PService.startGame();
  }
  if (games?.xucxac1P !== "inactive") {
    GameXucXac1PService.startGame();
  }
  if (games?.xucxac3P !== "inactive") {
    GameXucXac3PService.startGame();
  }
  if (games?.xocdia1P !== "inactive") {
    GameXocDia1PService.startGame();
  }

  randomBotPlayGame();

  // // Game Xóc Đĩa
  // GameXocDia1PService.startGame();

  // // Game Keno
  // GameKeno1PService.startGame();
  // GameKeno3PService.startGame();
  // GameKeno5PService.startGame();

  // // Game Tài Xỉu
  // GameXucXac1PService.startGame();
  // GameXucXac3PService.startGame();

  // // Game Xổ Số
  // GameXoSo3PService.startGame();
  // GameXoSo5PService.startGame();
}, 1000);

// Init Bot Telegram
TelegramService.initBot().then(() => {
  console.log(`Init Successful telegram bot`);
});

const khoiTaoHeThongDB = async () => {
  try {
    const system = await HeThong.findOneAndUpdate(
      {
        systemID: 1,
      },
      {},
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );

    if (!system.currentId) {
      let currentId = 61268;

      const users = await NguoiDung.find({});

      for (const user of users) {
        if (!user.publicId) {
          user.publicId = currentId;
          await NguoiDung.findOneAndUpdate(
            {
              _id: user._id,
            },
            {
              publicId: currentId,
            }
          );
          currentId++;
        }
      }

      await HeThong.findOneAndUpdate(
        {
          systemID: 1,
        },
        {
          currentId,
        }
      );
    }
  } catch (err) {
    console.log("Lỗi tạo hệ thống", err);
  }
};
khoiTaoHeThongDB();

server.listen(port, () => {
  console.log("Server đang chay tren cong", port);
});
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.log("Error: ", err);
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
