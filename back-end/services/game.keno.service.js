"use strict";
const NguoiDung = require("../models/NguoiDung");
const HeThong = require("../models/HeThong");
const RedisService = require("./redis.service");
const { randomBiTheoLoai, getKetQua, convertLoaiCuocGame } = require("../utils/game/keno");
const getRandomArbitrary = require("../utils/randomRangeNumber");
const numeral = require("numeral");
const {
  STATUS_HISTORY_GAME,
  STATUS_GAME,
  MIN_RANGE_NUMBER,
  MAX_RANGE_NUMBER,
  STATUS_BET_GAME,
  DEFAULT_SETTING_GAME,
  LOAI_CUOC_GAME,
} = require("../configs/game.keno");
const UserSocketService = require("./user.socket.service");
const { TYPE_BALANCE_FLUCTUATION } = require("../configs/balance.fluctuation.config");
const BienDongSoDuServiceFactory = require("./biendongsodu.service");
const { default: mongoose } = require("mongoose");
const TelegramService = require("./telegram.service");
const { BadRequestError } = require("../utils/app_error");
const _ = require("lodash");
let CURRENT_GAME = {
  _id: null,
  phien: 0,
  tinhTrang: STATUS_GAME.DANG_CHO,
};
class GameKenoService {
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
  setIsAutoGame = (data) => {
    this.SETTING_GAME = { ...this.SETTING_GAME, IS_AUTO_RESULT: data };
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
   * @param {[0, 0, 0, 0, 0]} ketQua List kết quả đã được random
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
    this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_KENO({ key: `${this.KEY_GAME.KEY_SOCKET}:ketQuaPhienHienTai`, data: updateGame });
  };

  /**
   * Random kết quả
   * @returns {Promise<[0, 0, 0, 0, 0]>} List kết quả từ 0 -> 9
   */
  randomKetQua = async () => {
    let tempResult = Array.from({ length: 5 }).map((_, i) => getRandomArbitrary(MIN_RANGE_NUMBER, MAX_RANGE_NUMBER));
    // Lấy kết quả đã được admin điều chỉnh
    if (this.SETTING_GAME.IS_MODIFIED_RESULT) {
      tempResult = this.SETTING_GAME.MODIFIED_RESULT;
    }
    // Tự động can thiệp kết quả, bên nhiều hơn sẽ thua
    else if (this.SETTING_GAME.IS_AUTO_RESULT) {
      const tongTienCuocGame = await this.getTongTienCuocGame();
      for (let i = 1; i <= 5; i++) {
        if (
          tongTienCuocGame[i][LOAI_CUOC_GAME.CHAN] === tongTienCuocGame[i][LOAI_CUOC_GAME.LE] &&
          tongTienCuocGame[i][LOAI_CUOC_GAME.LE] === tongTienCuocGame[i][LOAI_CUOC_GAME.LON] &&
          tongTienCuocGame[i][LOAI_CUOC_GAME.LON] === tongTienCuocGame[i][LOAI_CUOC_GAME.NHO]
        ) {
          const randomNumber = getRandomArbitrary(0, 3);
          if (randomNumber === 0) {
            tempResult[i - 1] = randomBiTheoLoai({ loai: LOAI_CUOC_GAME.CHAN });
          } else if (randomNumber === 1) {
            tempResult[i - 1] = randomBiTheoLoai({ loai: LOAI_CUOC_GAME.LE });
          } else if (randomNumber === 2) {
            tempResult[i - 1] = randomBiTheoLoai({ loai: LOAI_CUOC_GAME.LON });
          } else if (randomNumber === 3) {
            tempResult[i - 1] = randomBiTheoLoai({ loai: LOAI_CUOC_GAME.NHO });
          }
          continue;
        }
        // Tìm min
        const findMin = _.minBy(
          Object.keys(tongTienCuocGame[i]).map((key) => ({
            key: key,
            value: tongTienCuocGame[i][key],
          })),
          "value"
        );
        tempResult[i - 1] = randomBiTheoLoai({ loai: findMin.key });
      }
    }

    return tempResult;
  };
  /**
   * Lấy danh sách tổng tiền cược game
   * @returns {Promise<{  1: {
        C: 0,
        L: 0,
      },
      2: {
        C: 0,
        L: 0,
      },
      3: {
        C: 0,
        L: 0,
      },
      4: {
        C: 0,
        L: 0,
      },
      5: {
        C: 0,
        L: 0,
      },}>}
   */

  getTongTienCuocGame = async () => {
    const listTongTienCuoc = {};
    for (let i = 0; i < 5; i++) {
      listTongTienCuoc[`${i + 1}`] = {
        [`${LOAI_CUOC_GAME.CHAN}`]: 0,
        [`${LOAI_CUOC_GAME.LE}`]: 0,
        [`${LOAI_CUOC_GAME.LON}`]: 0,
        [`${LOAI_CUOC_GAME.NHO}`]: 0,
      };
    }

    const lichSuDatCuoc = await this.SETTING_GAME.DATABASE_MODEL.HISTORY.find({
      phien: this.CURRENT_GAME._id,
      tinhTrang: STATUS_HISTORY_GAME.DANG_CHO,
    }).lean();
    for (const itemLichSuDatCuoc of lichSuDatCuoc) {
      const listCuoc = itemLichSuDatCuoc.datCuoc;
      const { loaiBi, chiTietCuoc } = listCuoc[0];
      const loaiCuoc = chiTietCuoc[0].loaiCuoc;
      const tienCuoc = chiTietCuoc[0].tienCuoc;
      listTongTienCuoc[`${loaiBi}`][loaiCuoc] += tienCuoc;
    }
    return listTongTienCuoc;
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
      findHeThong?.gameConfigs?.kenoConfigs?.[`keno${this.KEY_GAME.TYPE_GAME}`]?.autoGame ?? DEFAULT_SETTING_GAME.STATUS_AUTO_GAME;
    this.SETTING_GAME.MODIFIED_RESULT = [0, 0, 0, 0, 0];
    this.SETTING_GAME.IS_MODIFIED_RESULT = false;

    return this.CURRENT_GAME.phien;
  };

  /**
   * Trả thưởng
   */

  traThuong = async () => {
    // const session = await mongoose.startSession()
    const findHeThong = await HeThong.findOne({
      systemID: 1,
    });

    // Lấy tỉ lệ trả thưởng khi thắng

    const bangTiLe = {};

    for (let i = 1; i <= 5; i++) {
      const keyBi = `bi_${i}`;
      bangTiLe[keyBi] = {
        [LOAI_CUOC_GAME.CHAN]:
          findHeThong.gameConfigs.kenoConfigs[`keno${this.KEY_GAME.TYPE_GAME}`]?.tiLeTraThuong?.[keyBi]?.[LOAI_CUOC_GAME.CHAN] ??
          DEFAULT_SETTING_GAME[`BI_${i}_CHAN_BET_PAYOUT_PERCENT`],
        [LOAI_CUOC_GAME.LE]:
          findHeThong.gameConfigs.kenoConfigs[`keno${this.KEY_GAME.TYPE_GAME}`]?.tiLeTraThuong?.[keyBi]?.[LOAI_CUOC_GAME.LE] ??
          DEFAULT_SETTING_GAME[`BI_${i}_LE_BET_PAYOUT_PERCENT`],
        [LOAI_CUOC_GAME.LON]:
          findHeThong.gameConfigs.kenoConfigs[`keno${this.KEY_GAME.TYPE_GAME}`]?.tiLeTraThuong?.[keyBi]?.[LOAI_CUOC_GAME.LON] ??
          DEFAULT_SETTING_GAME[`BI_${i}_LON_BET_PAYOUT_PERCENT`],
        [LOAI_CUOC_GAME.NHO]:
          findHeThong.gameConfigs.kenoConfigs[`keno${this.KEY_GAME.TYPE_GAME}`]?.tiLeTraThuong?.[keyBi]?.[LOAI_CUOC_GAME.NHO] ??
          DEFAULT_SETTING_GAME[`BI_${i}_NHO_BET_PAYOUT_PERCENT`],
      };
    }

    // Tìm lịch sử đặt cược của phiên game
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

    console.log("---------------");
    console.log("Tra thuong game keno" + this.KEY_GAME.TYPE_GAME);
    console.log(this.CURRENT_GAME._id);
    console.log(lichSuDatCuoc);
    console.log(lichSuDatCuoc.datCuoc);

    // Loop từng item lịch sử đặt cược: mỗi item là một người cược khác nhau

    for (const itemLichSuDatCuoc of lichSuDatCuoc) {
      try {
        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
          try {
            const findUser = itemLichSuDatCuoc.nguoiDung;
            const ketQua = itemLichSuDatCuoc.phien.ketQua;
            // Tạo bảng tra kết quả từ kết quả
            const bangTraKetQua = getKetQua(ketQua);

            // Lấy cược chi tiết từ item lịch sử đặt cược
            const listCuoc = itemLichSuDatCuoc.datCuoc;
            let thongBaoBienDongSoDu = "";
            let tongTienThang = 0;
            let indexItemCuoc = 0;
            // listKetQuaCuocUpdate = ["dangCho", "dangCho", ...]
            const listKetQuaCuocUpdate = listCuoc.map((_) => STATUS_BET_GAME.DANG_CHO);
            for (const itemCuoc of listCuoc) {
              const { loaiBi, chiTietCuoc } = itemCuoc;
              const { tienCuoc, loaiCuoc } = chiTietCuoc[0];

              // Nếu thắng
              if (bangTraKetQua[`${loaiBi}`][loaiCuoc] === true) {
                listKetQuaCuocUpdate[indexItemCuoc] = STATUS_BET_GAME.THANG;
                const tienThang = Math.floor(tienCuoc * bangTiLe[`bi_${loaiBi}`][loaiCuoc]);
                tongTienThang += tienThang;
                thongBaoBienDongSoDu += `bi ${loaiBi} - ${convertLoaiCuocGame(loaiCuoc)}: +${numeral(tienThang).format("0,0")}đ | `;
              } else {
                listKetQuaCuocUpdate[indexItemCuoc] = STATUS_BET_GAME.THUA;
              }
            }
            // Cập nhật database của item đặt cược

            const updateLichSuCuocItem = this.SETTING_GAME.DATABASE_MODEL.HISTORY.findOneAndUpdate(
              {
                _id: itemLichSuDatCuoc._id,
              },
              {
                $set: {
                  "datCuoc.0.trangThai": listKetQuaCuocUpdate[indexItemCuoc],
                  tinhTrang: STATUS_HISTORY_GAME.HOAN_TAT,
                  "datCuoc.0.tongThang": tongTienThang,
                },
              },
              {
                session,
              }
            );

            // Update tiền người chơi
            const updateTienNguoiDung = NguoiDung.findOneAndUpdate(
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
            );

            const [ketQuaUpdateLichSuCuocItem, ketQuaUpdateTienNguoiDung] = await Promise.all([updateLichSuCuocItem, updateTienNguoiDung]);

            // Nếu thắng thì cập nhật biến động số dư
            if (thongBaoBienDongSoDu) {
              thongBaoBienDongSoDu = thongBaoBienDongSoDu.substr(0, thongBaoBienDongSoDu.length - 2);
              await BienDongSoDuServiceFactory.createBienDong({
                type: TYPE_BALANCE_FLUCTUATION.GAME,
                payload: {
                  nguoiDung: findUser._id,
                  tienTruoc: ketQuaUpdateTienNguoiDung.money,
                  tienSau: ketQuaUpdateTienNguoiDung.money + tongTienThang,
                  noiDung: `Cược game Keno${this.KEY_GAME.TYPE_GAME} thắng: ${thongBaoBienDongSoDu}`,
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
        const errorMessage = `Trả thưởng lỗi game ${this.KEY_GAME.KEY_SOCKET}: ${JSON.stringify(err)}`;
        console.log(errorMessage);
        TelegramService.sendNotification({
          content: errorMessage,
        });
        continue;
      }
    }

    // update kết quả cược của user realtime
    this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_KENO({ key: `${this.KEY_GAME.KEY_SOCKET}:update-lich-su-cuoc-ca-nhan` });

    this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_KENO({
      key: `${this.KEY_GAME.KEY_SOCKET}:admin:refetch-data-lich-su-cuoc-game`,
      data: { phien: this.CURRENT_GAME._id },
    });
    this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_KENO({
      key: `${this.KEY_GAME.KEY_SOCKET}:admin:refetch-data-chi-tiet-phien-game`,
      data: { phien: this.CURRENT_GAME._id },
    });
  };

  startGame = async () => {
    try {
      while (this.SETTING_GAME.IS_PLAY_GAME) {
        const currentPhien = await this.getCurrentPhien();
        let phienHoanTatMoiNhat = await this.getPhienHoanTatMoiNhat({ currentPhien });
        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_KENO({
          key: `${this.KEY_GAME.KEY_SOCKET}:phienHoanTatMoiNhat`,
          data: { phienHoanTatMoiNhat },
        });
        let phien = await this.createPhien({ currentPhien });
        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_KENO({ key: `${this.KEY_GAME.KEY_SOCKET}:batDauGame` });
        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_KENO({
          key: `${this.KEY_GAME.KEY_SOCKET}:admin:batDauGame`,
          data: {
            phien,
          },
        });

        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_KENO({ key: `${this.KEY_GAME.KEY_SOCKET}:admin:refetch-data-game` });

        let currentTime = await (await RedisService).get(this.KEY_GAME.TIME_COUNTDOWN);
        if (!currentTime) {
          currentTime = await (
            await RedisService
          ).set(this.KEY_GAME.TIME_COUNTDOWN, this.SETTING_GAME.TIMER, {
            EX: this.SETTING_GAME.TIMER,
          });
        }
        const remainTime = await (await RedisService).ttl(this.KEY_GAME.TIME_COUNTDOWN);

        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_KENO({
          key: `${this.KEY_GAME.KEY_SOCKET}:timer`,
          data: { current_time: remainTime },
        });
        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_KENO({
          key: `${this.KEY_GAME.KEY_SOCKET}:admin:timer`,
          data: { current_time: remainTime, phien },
        });
        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_KENO({ key: `${this.KEY_GAME.KEY_SOCKET}:hienThiPhien`, data: { phien } });
        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_KENO({
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
          throw new Error(`Lỗi game Keno${this.KEY_GAME.TYPE_GAME} phiên ${phien}, thời gian còn lại là: ${remainTime}`);
        }

        let currentRemainTime = remainTime;
        handleCountdownTime = setInterval(async () => {
          if (!this.SETTING_GAME.IS_PLAY_GAME) {
            clearInterval(handleCountdownTime);
            return;
          }
          --currentRemainTime;

          this.setRemainTime(currentRemainTime);

          this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_KENO({
            key: `${this.KEY_GAME.KEY_SOCKET}:timer`,
            data: { current_time: currentRemainTime },
          });
          this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_KENO({
            key: `${this.KEY_GAME.KEY_SOCKET}:admin:timer`,
            data: { current_time: currentRemainTime, phien: phien },
          });
          if (this.SETTING_GAME.IS_MODIFIED_RESULT) {
            this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_KENO({
              key: `${this.KEY_GAME.KEY_SOCKET}:admin:hien-thi-ket-qua-dieu-chinh`,
              data: { ketQua: this.SETTING_GAME.MODIFIED_RESULT, phienHienTai: phien },
            });
          }

          // Stop
          if (currentRemainTime <= 0) {
            clearInterval(handleCountdownTime);

            // Bắt đầu quay
            this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_KENO({ key: `${this.KEY_GAME.KEY_SOCKET}:batDauQuay` });
            this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_KENO({
              key: `${this.KEY_GAME.KEY_SOCKET}:admin:batDauQuay`,
              data: { phien },
            });
            setTimeout(async () => {
              // Random và update kết quả
              let ketQuaRandom = await this.randomKetQua();
              await this.updateDataGame({ ketQua: ketQuaRandom });

              this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_KENO({
                key: `${this.KEY_GAME.KEY_SOCKET}:ketqua`,
                data: {
                  ketQuaRandom,
                },
              });

              this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_KENO({
                key: `${this.KEY_GAME.KEY_SOCKET}:admin:ketqua`,
                data: { ketQuaRandom, phien },
              });

              setTimeout(async () => {
                // Dừng quay
                this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_KENO({ key: `${this.KEY_GAME.KEY_SOCKET}:dungQuay` });
                this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_KENO({
                  key: `${this.KEY_GAME.KEY_SOCKET}:admin:dungQuay`,
                  data: { phien },
                });

                // Trả thưởng
                this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_KENO({ key: `${this.KEY_GAME.KEY_SOCKET}:batDauTraThuong` });
                this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_KENO({
                  key: `${this.KEY_GAME.KEY_SOCKET}:admin:batDauTraThuong`,
                  data: { phien },
                });

                await this.traThuong();
                this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_KENO({ key: `${this.KEY_GAME.KEY_SOCKET}:hoanTatGame` });
                this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_KENO({
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

module.exports = GameKenoService;
