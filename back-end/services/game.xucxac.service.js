"use strict";
const NguoiDung = require("../models/NguoiDung");
const HeThong = require("../models/HeThong");
const RedisService = require("./redis.service");
const getRandomArbitrary = require("../utils/randomRangeNumber");
const { randomXucXacTheoLoai, getKetQua } = require("../utils/game/xucxac");
const numeral = require("numeral");
const {
  STATUS_GAME,
  STATUS_HISTORY_GAME,
  MIN_RANGE_NUMBER,
  MAX_RANGE_NUMBER,
  DEFAULT_SETTING_GAME,
  STATUS_BET_GAME,
} = require("../configs/game.xucxac");
const UserSocketService = require("./user.socket.service");
const { TYPE_BALANCE_FLUCTUATION } = require("../configs/balance.fluctuation.config");
const BienDongSoDuServiceFactory = require("./biendongsodu.service");
const { default: mongoose } = require("mongoose");
const TelegramService = require("./telegram.service");
const { BadRequestError } = require("../utils/app_error");

let CURRENT_GAME = {
  _id: null,
  phien: 0,
  tinhTrang: STATUS_GAME.DANG_CHO,
};
class GameXucXacService {
  constructor({ KEY_GAME, SETTING_GAME }) {
    this.SETTING_GAME = SETTING_GAME;
    this.KEY_GAME = KEY_GAME;
    this.CURRENT_GAME = CURRENT_GAME;
  }

  getDataGame = () => {
    return this.CURRENT_GAME;
  };
  getSettingGame = () => {
    return this.SETTING_GAME;
  };

  setDataGame = (data) => {
    this.CURRENT_GAME = { ...this.CURRENT_GAME, ...data };
  };
  setRemainTime = (time) => {
    this.CURRENT_GAME = { ...this.CURRENT_GAME, timer: time };
  };

  setPhienHoanTatMoiNhat = (data) => {
    this.CURRENT_GAME = { ...this.CURRENT_GAME, phienHoanTatMoiNhat: data };
  };
  setModifiedResult = (data) => {
    this.SETTING_GAME = { ...this.SETTING_GAME, MODIFIED_RESULT: data, IS_MODIFIED_RESULT: true };
  };
  setIsModifiedResult = (data) => {
    this.SETTING_GAME = { ...this.SETTING_GAME, IS_MODIFIED_RESULT: data };
  };
  setIsPlayGame = (data) => {
    if (this.SETTING_GAME.IS_PLAY_GAME === data) return;
    this.SETTING_GAME = { ...this.SETTING_GAME, IS_PLAY_GAME: data };
    if (data) {
      setTimeout(() => {
        this.startGame();
      }, 1000);
    }
  };

  /**
   * Update kết quả vào database
   * @param {[0, 0, 0]} ketQua List kết quả đã được random
   *
   */
  updateDataGame = async ({ ketQua }) => {
    const updateGame = await this.SETTING_GAME.DATABASE_MODEL.GAME.findOneAndUpdate(
      {
        phien: this.CURRENT_GAME.phien,
      },
      {
        tinhTrang: STATUS_GAME.HOAN_TAT,
        ketQua: ketQua,
      },
      {
        new: true,
      }
    );
    this.CURRENT_GAME = updateGame;
    this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XUCXAC({ key: `${this.KEY_GAME.KEY_SOCKET}:ketQuaPhienHienTai`, data: updateGame });
  };

  /**
   * Random kết quả
   * @returns {Promise<[0, 0, 0]>} List kết quả từ 1 -> 6
   */
  randomKetQua = async () => {
    let tempResult = Array.from({ length: 3 }).map((_, i) => getRandomArbitrary(MIN_RANGE_NUMBER, MAX_RANGE_NUMBER));
    // Lấy kết quả đã được admin điều chỉnh
    if (this.SETTING_GAME.IS_MODIFIED_RESULT) {
      tempResult = this.SETTING_GAME.MODIFIED_RESULT;
    }
    // Tự động can thiệp kết quả, bên nhiều hơn sẽ thua
    else if (this.SETTING_GAME.IS_AUTO_RESULT) {
      const { T: tongTaiDat, X: tongXiuDat } = await this.getTongTienCuocGame();
      if (tongTaiDat > tongXiuDat) {
        // Auto ra xỉu
        tempResult = randomXucXacTheoLoai({ loai: "X" });
      } else if (tongTaiDat < tongXiuDat) {
        // Auto ra tài
        tempResult = randomXucXacTheoLoai({ loai: "T" });
      } else {
        // Trường hợp 2 bên bằng nhau
        tempResult = Array.from({ length: 3 }).map((_, i) => getRandomArbitrary(MIN_RANGE_NUMBER, MAX_RANGE_NUMBER));
      }
    }

    return tempResult;
  };
  /**
   * Lấy danh sách tổng tiền cược game
   * @returns {Promise<{ T: 0, X: 0, }>}
   */

  getTongTienCuocGame = async () => {
    const tongTienCuoc = {
      T: 0,
      X: 0,
    };
    const lichSuDatCuoc = await this.SETTING_GAME.DATABASE_MODEL.HISTORY.find({
      phien: this.CURRENT_GAME._id,
      tinhTrang: STATUS_HISTORY_GAME.DANG_CHO,
    }).lean();
    for (const itemDatCuoc of lichSuDatCuoc) {
      const listCuoc = itemDatCuoc.datCuoc;
      for (const itemCuoc of listCuoc) {
        const { tienCuoc, chiTietCuoc, loaiCuoc } = itemCuoc;
        if (loaiCuoc === "CLTX") {
          if (chiTietCuoc === "X") {
            tongTienCuoc["X"] += tienCuoc;
          } else if (chiTietCuoc === "T") {
            tongTienCuoc["T"] += tienCuoc;
          }
        }
      }
    }
    return tongTienCuoc;
  };

  /**
   * Lấy phiên game hiện tại
   * @returns {Promise<number>} Phiên hiện tại
   */
  getCurrentPhien = async () => {
    let currentPhien;
    const findGameUnComplete = await this.SETTING_GAME.DATABASE_MODEL.GAME.findOne({
      tinhTrang: STATUS_GAME.DANG_CHO,
    }).lean();
    /**
     * Nếu tìm thấy phiên game chưa hoàn thành
     * thì tiếp tục set phiên đó cho Redis,
     * Ngược lại, set phiên mới cho Redis
     
     */
    if (findGameUnComplete) {
      await (await RedisService).set(this.KEY_GAME.PHIEN, findGameUnComplete.phien);
      currentPhien = findGameUnComplete.phien;
    } else {
      currentPhien = await (await RedisService).incr(this.KEY_GAME.PHIEN);
    }
    return currentPhien;
  };

  /**
   * Lấy kết quả phiên trước đó
   * @param {number} currentPhien
   * @returns Object
   */
  getPhienHoanTatMoiNhat = async ({ currentPhien }) => {
    if (currentPhien === 1) {
      this.setPhienHoanTatMoiNhat({});

      return {};
    }
    const getData = await this.SETTING_GAME.DATABASE_MODEL.GAME.findOne({ phien: currentPhien - 1 }).lean();
    this.setPhienHoanTatMoiNhat(getData);

    return getData;
  };
  /**
   * Insert database ván game mới
   * @param {number} currentPhien
   * @returns {object} Trả data game
   */
  createDataGame = async ({ currentPhien }) => {
    const data = await this.SETTING_GAME.DATABASE_MODEL.GAME.findOneAndUpdate(
      {
        phien: currentPhien,
      },
      {
        phien: currentPhien,
      },
      {
        new: true,
        upsert: true,
      }
    );
    return data._doc;
  };
  /**
   * Tạo database và cài đặt cấu hình khởi đầu game
   * @param {number} currentPhien
   * @returns {Promise<number>} Trả về phiên
   */
  createPhien = async ({ currentPhien }) => {
    const dataGame = await this.createDataGame({ currentPhien });
    const findHeThong = await HeThong.findOne({
      systemID: 1,
    });
    this.setDataGame(dataGame);
    this.setRemainTime(this.SETTING_GAME.TIMER);

    this.SETTING_GAME.IS_AUTO_RESULT =
      findHeThong?.gameConfigs?.xucXacConfigs?.[`xucXac${this.KEY_GAME.TYPE_GAME}`]?.autoGame ?? DEFAULT_SETTING_GAME.STATUS_AUTO_GAME;
    this.SETTING_GAME.MODIFIED_RESULT = [0, 0, 0];
    this.SETTING_GAME.IS_MODIFIED_RESULT = false;

    return this.CURRENT_GAME.phien;
  };

  /**
   * Trả thưởng
   */

  traThuong = async () => {
    const lichSuDatCuoc = await this.SETTING_GAME.DATABASE_MODEL.HISTORY.find({
      phien: this.CURRENT_GAME._id,
      tinhTrang: STATUS_HISTORY_GAME.DANG_CHO,
    })
      .populate({
        path: "phien",
      })
      .populate({
        path: "nguoiDung",
      })
      .lean();
    const findHeThong = await HeThong.findOne({
      systemID: 1,
    });

    const tiLe =
      findHeThong?.gameConfigs?.xucXacConfigs?.[`xucXac${this.KEY_GAME.TYPE_GAME}`]?.tiLeCLTX ?? DEFAULT_SETTING_GAME.BET_PAYOUT_PERCENT;

    for (const itemDatCuoc of lichSuDatCuoc) {
      try {
        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
          try {
            let ketQua = itemDatCuoc.phien.ketQua;
            ketQua = getKetQua(ketQua);
            const findUser = itemDatCuoc.nguoiDung;
            const listCuoc = itemDatCuoc.datCuoc;
            let thongBaoBienDongSoDu = "";
            let tongTienThang = 0;
            let indexItemCuoc = 0;
            // listKetQuaCuocUpdate = ["dangCho", "dangCho", ...]
            const listKetQuaCuocUpdate = listCuoc.map((_) => STATUS_BET_GAME.DANG_CHO);
            for (const itemCuoc of listCuoc) {
              const { tienCuoc, chiTietCuoc, loaiCuoc } = itemCuoc;
              if (loaiCuoc === "CLTX") {
                if (ketQua[`${chiTietCuoc}`] === true) {
                  listKetQuaCuocUpdate[indexItemCuoc] = STATUS_BET_GAME.THANG;

                  const tienThang = Math.floor(tienCuoc * tiLe);
                  tongTienThang += tienThang;
                  const tienThangStr = numeral(tienThang).format("0,0");
                  thongBaoBienDongSoDu += `${chiTietCuoc}: +${tienThangStr}đ | `;
                } else {
                  listKetQuaCuocUpdate[indexItemCuoc] = STATUS_BET_GAME.THUA;
                }
                indexItemCuoc++;
              }
            }
            /*
       updateKetQuaCuocQuery = {
        datCuoc.0.trangThai: "thang",
        datCuoc.1.trangThai: "thua",
      }
*/
            const updateKetQuaCuocQuery = listKetQuaCuocUpdate.reduce(
              (prev, curValue, curIndex) => ({ ...prev, [`datCuoc.${curIndex}.trangThai`]: curValue }),
              {}
            );

            // Update tiền người chơi và lịch sử cược
            const [updateItemLichSuCuoc, updateTienNguoiDung] = await Promise.all([
              this.SETTING_GAME.DATABASE_MODEL.HISTORY.findOneAndUpdate(
                {
                  _id: itemDatCuoc._id,
                },
                {
                  $set: {
                    ...updateKetQuaCuocQuery,
                    tinhTrang: STATUS_HISTORY_GAME.HOAN_TAT,
                  },
                },
                {
                  session,
                }
              ),
              NguoiDung.findOneAndUpdate(
                {
                  _id: findUser._id,
                },
                {
                  $inc: { money: tongTienThang, tienThang: tongTienThang },
                },
                {
                  new: false,
                  session,
                }
              ),
            ]);

            if (thongBaoBienDongSoDu) {
              thongBaoBienDongSoDu = thongBaoBienDongSoDu.substr(0, thongBaoBienDongSoDu.length - 2);

              await BienDongSoDuServiceFactory.createBienDong({
                type: TYPE_BALANCE_FLUCTUATION.GAME,
                payload: {
                  nguoiDung: findUser._id,
                  tienTruoc: updateTienNguoiDung.money,
                  tienSau: updateTienNguoiDung.money + tongTienThang,
                  noiDung: `Cược game Xúc Xắc ${this.KEY_GAME.TYPE_GAME} thắng: ${thongBaoBienDongSoDu}`,
                  loaiGame: this.KEY_GAME.KEY_SOCKET,
                },
                options: {
                  session,
                },
              });
            }

            await session.commitTransaction();
            UserSocketService.updateUserBalance({
              user: findUser.taiKhoan,
              updateBalance: tongTienThang,
            });
          } catch (err) {
            await session.abortTransaction();
            throw err;
          }
        });
        await session.endSession();
      } catch (err) {
        console.log(err);
        const errorMessage = `Trả thưởng lỗi game ${this.KEY_GAME.KEY_SOCKET}: ${JSON.stringify(err)}`;

        TelegramService.sendNotification({
          content: errorMessage,
        });
        continue;
      }
    }

    this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XUCXAC({
      key: `${this.KEY_GAME.KEY_SOCKET}:update-lich-su-cuoc-ca-nhan`,
    });

    this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XUCXAC({
      key: `${this.KEY_GAME.KEY_SOCKET}:admin:refetch-data-lich-su-cuoc-game`,

      data: { phien: this.CURRENT_GAME._id },
    });
    this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XUCXAC({
      key: `${this.KEY_GAME.KEY_SOCKET}:admin:refetch-data-chi-tiet-phien-game`,
      data: { phien: this.CURRENT_GAME._id },
    });

    ////
  };

  startGame = async () => {
    try {
      while (this.SETTING_GAME.IS_PLAY_GAME) {
        const currentPhien = await this.getCurrentPhien();
        let phienHoanTatMoiNhat = await this.getPhienHoanTatMoiNhat({ currentPhien });
        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XUCXAC({
          key: `${this.KEY_GAME.KEY_SOCKET}:phienHoanTatMoiNhat`,
          data: { phienHoanTatMoiNhat },
        });
        let phien = await this.createPhien({ currentPhien });
        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XUCXAC({ key: `${this.KEY_GAME.KEY_SOCKET}:batDauGame` });
        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XUCXAC({
          key: `${this.KEY_GAME.KEY_SOCKET}:admin:batDauGame`,
          data: {
            phien,
          },
        });

        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XUCXAC({ key: `${this.KEY_GAME.KEY_SOCKET}:admin:refetch-data-game` });

        let currentTime = await (await RedisService).get(this.KEY_GAME.TIME_COUNTDOWN);
        if (!currentTime) {
          currentTime = await (
            await RedisService
          ).set(this.KEY_GAME.TIME_COUNTDOWN, this.SETTING_GAME.TIMER, {
            EX: this.SETTING_GAME.TIMER,
          });
        }
        const remainTime = await (await RedisService).ttl(this.KEY_GAME.TIME_COUNTDOWN);

        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XUCXAC({
          key: `${this.KEY_GAME.KEY_SOCKET}:timer`,
          data: { current_time: remainTime },
        });
        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XUCXAC({ key: `${this.KEY_GAME.KEY_SOCKET}:hienThiPhien`, data: { phien } });
        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XUCXAC({
          key: `${this.KEY_GAME.KEY_SOCKET}:admin:timer`,
          data: { current_time: remainTime, phien: phien },
        });
        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XUCXAC({
          key: `${this.KEY_GAME.KEY_SOCKET}:admin:hienThiPhien`,
          data: { phien },
        });
        let isCompleteGame = false;
        let handleCountdownTime;
        // Hết thời gian chờ
        if (remainTime === -2) {
          console.log(`Hết thời gian chờ. Đang start lại game sau 3 giây...`);
          await new Promise((resolve) => {
            setTimeout(() => {
              console.log("Đợi xong");
              resolve();
            }, 3000);
          });
          console.log("Tiếp tục lặp");
          continue;
        }
        if (remainTime < 0) {
          throw new Error(`Lỗi game phiên ${phien}, thời gian còn lại là: ${remainTime}`);
        }

        let currentRemainTime = remainTime;
        handleCountdownTime = setInterval(async () => {
          if (!this.SETTING_GAME.IS_PLAY_GAME) {
            clearInterval(handleCountdownTime);
            return;
          }
          --currentRemainTime;
          this.setRemainTime(currentRemainTime);

          this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XUCXAC({
            key: `${this.KEY_GAME.KEY_SOCKET}:timer`,
            data: { current_time: currentRemainTime },
          });
          this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XUCXAC({
            key: `${this.KEY_GAME.KEY_SOCKET}:admin:timer`,
            data: { current_time: currentRemainTime, phien: phien },
          });

          if (this.SETTING_GAME.IS_MODIFIED_RESULT) {
            this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XUCXAC({
              key: `${this.KEY_GAME.KEY_SOCKET}:admin:hien-thi-ket-qua-dieu-chinh`,
              data: { ketQua: this.SETTING_GAME.MODIFIED_RESULT, phienHienTai: phien },
            });
          }

          // Stop
          if (currentRemainTime <= 0) {
            clearInterval(handleCountdownTime);
            // Bắt đầu quay
            this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XUCXAC({ key: `${this.KEY_GAME.KEY_SOCKET}:batDauQuay` });
            this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XUCXAC({
              key: `${this.KEY_GAME.KEY_SOCKET}:admin:batDauQuay`,
              data: { phien },
            });
            setTimeout(async () => {
              // Random và update kết quả
              let ketQuaRandom = await this.randomKetQua();
              await this.updateDataGame({ ketQua: ketQuaRandom });

              this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XUCXAC({
                key: `${this.KEY_GAME.KEY_SOCKET}:ketqua`,
                data: {
                  ketQuaRandom,
                },
              });
              this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XUCXAC({
                key: `${this.KEY_GAME.KEY_SOCKET}:admin:ketqua`,
                data: { ketQuaRandom, phien },
              });
              setTimeout(async () => {
                // Dừng quay
                this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XUCXAC({ key: `${this.KEY_GAME.KEY_SOCKET}:dungQuay` });
                this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XUCXAC({
                  key: `${this.KEY_GAME.KEY_SOCKET}:admin:dungQuay`,
                  data: { phien },
                });
                // Trả thưởng
                this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XUCXAC({ key: `${this.KEY_GAME.KEY_SOCKET}:batDauTraThuong` });
                this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XUCXAC({
                  key: `${this.KEY_GAME.KEY_SOCKET}:admin:batDauTraThuong`,
                  data: { phien },
                });
                await this.traThuong();
                this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XUCXAC({ key: `${this.KEY_GAME.KEY_SOCKET}:hoanTatGame` });
                this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XUCXAC({
                  key: `${this.KEY_GAME.KEY_SOCKET}:admin:hoanTatGame`,
                  data: { phien },
                });
                isCompleteGame = true;
              }, 0);
            }, 3000);
          }
        }, 1000);

        await new Promise((resolve) => {
          setTimeout(() => {
            const retryInterval = setInterval(() => {
              if (isCompleteGame) {
                clearInterval(retryInterval);
                resolve();
              }
            }, 1000);
          }, remainTime * 1000);
        });
      }
    } catch (err) {
      this.SETTING_GAME.IS_PLAY_GAME = false;
      console.log(err);
    }
  };
}

module.exports = GameXucXacService;
