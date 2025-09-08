"use strict";
const NguoiDung = require("../models/NguoiDung");
const HeThong = require("../models/HeThong");
const RedisService = require("./redis.service");
const { getKetQua, convertKeyTiLe, getTiLeDefault } = require("../utils/game/xoso");
const { generateRandomNumberString } = require("../utils/game/xoso");
const numeral = require("numeral");
const {
  STATUS_GAME,
  STATUS_HISTORY_GAME,

  DEFAULT_SETTING_GAME,
  STATUS_BET_GAME,
} = require("../configs/game.xoso");
const UserSocketService = require("./user.socket.service");
const { TYPE_BALANCE_FLUCTUATION } = require("../configs/balance.fluctuation.config");
const BienDongSoDuServiceFactory = require("./biendongsodu.service");
const { default: mongoose } = require("mongoose");
const TelegramService = require("./telegram.service");
const { LOAI_CUOC_GAME } = require("../configs/game.xoso");

let CURRENT_GAME = {
  _id: null,
  phien: 0,
  tinhTrang: STATUS_GAME.DANG_CHO,
};
class GameXoSoService {
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
    this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XOSO({ key: `${this.KEY_GAME.KEY_SOCKET}:ketQuaPhienHienTai`, data: updateGame });
  };

  /**
   * Random kết quả

   */
  randomKetQua = async () => {
    let tempResult = [
      {
        type: "DB",
        data: Array.from({ length: 1 }).map((_, index) => generateRandomNumberString(5)),
      },
      {
        type: "1",
        data: Array.from({ length: 1 }).map((_, index) => generateRandomNumberString(5)),
      },
      {
        type: "2",
        data: Array.from({ length: 2 }).map((_, index) => generateRandomNumberString(5)),
      },
      {
        type: "3",
        data: Array.from({ length: 6 }).map((_, index) => generateRandomNumberString(5)),
      },
      {
        type: "4",
        data: Array.from({ length: 4 }).map((_, index) => generateRandomNumberString(4)),
      },
      {
        type: "5",
        data: Array.from({ length: 6 }).map((_, index) => generateRandomNumberString(4)),
      },
      {
        type: "6",
        data: Array.from({ length: 3 }).map((_, index) => generateRandomNumberString(3)),
      },
      {
        type: "7",
        data: Array.from({ length: 4 }).map((_, index) => generateRandomNumberString(2)),
      },
    ];

    if (this.SETTING_GAME.IS_MODIFIED_RESULT) {
      tempResult = this.SETTING_GAME.MODIFIED_RESULT;
    }

    return tempResult;
  };
  /**
   * Lấy danh sách tổng tiền cược game

   */

  getTongTienCuocGame = async () => {};

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
      findHeThong?.gameConfigs?.xoSoConfigs?.[`xoSo${this.KEY_GAME.TYPE_GAME}`]?.autoGame ?? DEFAULT_SETTING_GAME.STATUS_AUTO_GAME;
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

    const bangTiLe = Object.fromEntries(
      Object.values(LOAI_CUOC_GAME).map((loaiCuoc) => [
        loaiCuoc,
        findHeThong?.gameConfigs?.xoSoConfigs?.[`xoSo${this.KEY_GAME.TYPE_GAME}`]?.[`${convertKeyTiLe(loaiCuoc)}`] ??
          getTiLeDefault(loaiCuoc),
      ])
    );

    for (const itemDatCuoc of lichSuDatCuoc) {
      try {
        const session = await mongoose.startSession();
        await session.withTransaction(async () => {
          try {
            let ketQua = itemDatCuoc.phien.ketQua;
            const bangKetQua = getKetQua(ketQua);
            const findUser = itemDatCuoc.nguoiDung;
            const listCuoc = itemDatCuoc.datCuoc;
            let thongBaoBienDongSoDu = "";
            let tongTienThang = 0;
            let indexItemCuoc = 0;
            // listKetQuaCuocUpdate = ["dangCho", "dangCho", ...]
            const listKetQuaCuocUpdate = listCuoc.map((_) => STATUS_BET_GAME.DANG_CHO);
            for (const itemCuoc of listCuoc) {
              const { chiTietCuoc, loaiCuoc } = itemCuoc;

              // Game lô
              if (loaiCuoc === LOAI_CUOC_GAME.LO) {
                /// LOOP Chi tiet cuoc
                for (const { so, tienCuoc } of chiTietCuoc) {
                  // Thắng
                  if (bangKetQua[LOAI_CUOC_GAME.LO].includes(so)) {
                    listKetQuaCuocUpdate[indexItemCuoc] = STATUS_BET_GAME.THANG;
                    const tienThang = Math.floor(tienCuoc * bangTiLe[LOAI_CUOC_GAME.LO]);
                    tongTienThang += tienThang;
                    const tienThangStr = numeral(tienThang).format("0,0");
                    thongBaoBienDongSoDu += `Lô: số ${so}: +${tienThangStr}đ | `;
                  }
                }
              } else if (loaiCuoc === LOAI_CUOC_GAME.DE) {
                /// LOOP Chi tiet cuoc
                for (const { so, tienCuoc } of chiTietCuoc) {
                  // Thắng
                  if (bangKetQua[LOAI_CUOC_GAME.DE].includes(so)) {
                    listKetQuaCuocUpdate[indexItemCuoc] = STATUS_BET_GAME.THANG;
                    const tienThang = Math.floor(tienCuoc * bangTiLe[LOAI_CUOC_GAME.DE]);
                    tongTienThang += tienThang;
                    const tienThangStr = numeral(tienThang).format("0,0");
                    thongBaoBienDongSoDu += `Đề: số ${so}: +${tienThangStr}đ | `;
                  }
                }
              } else if (loaiCuoc === LOAI_CUOC_GAME.BA_CANG) {
                /// LOOP Chi tiet cuoc
                for (const { so, tienCuoc } of chiTietCuoc) {
                  // Thắng
                  if (bangKetQua[LOAI_CUOC_GAME.BA_CANG].includes(so)) {
                    listKetQuaCuocUpdate[indexItemCuoc] = STATUS_BET_GAME.THANG;
                    const tienThang = Math.floor(tienCuoc * bangTiLe[LOAI_CUOC_GAME.BA_CANG]);
                    tongTienThang += tienThang;
                    const tienThangStr = numeral(tienThang).format("0,0");
                    thongBaoBienDongSoDu += `Ba càng: số ${so}: +${tienThangStr}đ | `;
                  }
                }
              } else if (loaiCuoc === LOAI_CUOC_GAME.LO_XIEN_2) {
                const { so: so1, tienCuoc: tienCuoc1 } = chiTietCuoc[0];
                const { so: so2, tienCuoc: tienCuoc2 } = chiTietCuoc[1];
                if (bangKetQua[LOAI_CUOC_GAME.LO].includes(so1) && bangKetQua[LOAI_CUOC_GAME.LO].includes(so2)) {
                  listKetQuaCuocUpdate[indexItemCuoc] = STATUS_BET_GAME.THANG;
                  const tienThang = Math.floor((tienCuoc1 + tienCuoc2) * bangTiLe[LOAI_CUOC_GAME.LO_XIEN_2]);
                  tongTienThang += tienThang;
                  const tienThangStr = numeral(tienThang).format("0,0");
                  thongBaoBienDongSoDu += `Lô xiên 2: số ${so1} - số ${so2}: +${tienThangStr}đ | `;
                }
              } else if (loaiCuoc === LOAI_CUOC_GAME.LO_XIEN_3) {
                const { so: so1, tienCuoc: tienCuoc1 } = chiTietCuoc[0];
                const { so: so2, tienCuoc: tienCuoc2 } = chiTietCuoc[1];
                const { so: so3, tienCuoc: tienCuoc3 } = chiTietCuoc[2];
                if (
                  bangKetQua[LOAI_CUOC_GAME.LO].includes(so1) &&
                  bangKetQua[LOAI_CUOC_GAME.LO].includes(so2) &&
                  bangKetQua[LOAI_CUOC_GAME.LO].includes(so3)
                ) {
                  listKetQuaCuocUpdate[indexItemCuoc] = STATUS_BET_GAME.THANG;
                  const tienThang = Math.floor((tienCuoc1 + tienCuoc2 + tienCuoc3) * bangTiLe[LOAI_CUOC_GAME.LO_XIEN_3]);
                  tongTienThang += tienThang;
                  const tienThangStr = numeral(tienThang).format("0,0");
                  thongBaoBienDongSoDu += `Lô xiên 3: số ${so1} - số ${so2} - số ${so3}: +${tienThangStr}đ | `;
                }
              } else if (loaiCuoc === LOAI_CUOC_GAME.LO_XIEN_4) {
                const { so: so1, tienCuoc: tienCuoc1 } = chiTietCuoc[0];
                const { so: so2, tienCuoc: tienCuoc2 } = chiTietCuoc[1];
                const { so: so3, tienCuoc: tienCuoc3 } = chiTietCuoc[2];
                const { so: so4, tienCuoc: tienCuoc4 } = chiTietCuoc[3];
                if (
                  bangKetQua[LOAI_CUOC_GAME.LO].includes(so1) &&
                  bangKetQua[LOAI_CUOC_GAME.LO].includes(so2) &&
                  bangKetQua[LOAI_CUOC_GAME.LO].includes(so3) &&
                  bangKetQua[LOAI_CUOC_GAME.LO].includes(so4)
                ) {
                  listKetQuaCuocUpdate[indexItemCuoc] = STATUS_BET_GAME.THANG;
                  const tienThang = Math.floor((tienCuoc1 + tienCuoc2 + tienCuoc3 + tienCuoc4) * bangTiLe[LOAI_CUOC_GAME.LO_XIEN_4]);
                  tongTienThang += tienThang;
                  const tienThangStr = numeral(tienThang).format("0,0");
                  thongBaoBienDongSoDu += `Lô xiên 4: số ${so1} - số ${so2} - số ${so3} - số ${so4}: +${tienThangStr}đ | `;
                }
              }
            }
            // Các trường hợp còn lại thì update trạng thái thua
            if (listKetQuaCuocUpdate[indexItemCuoc] === STATUS_BET_GAME.DANG_CHO) {
              listKetQuaCuocUpdate[indexItemCuoc] = STATUS_BET_GAME.THUA;
            }

            // Update tiền người chơi và lịch sử cược
            const [updateItemLichSuCuoc, updateTienNguoiDung] = await Promise.all([
              this.SETTING_GAME.DATABASE_MODEL.HISTORY.findOneAndUpdate(
                {
                  _id: itemDatCuoc._id,
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
                  noiDung: `Cược game Xổ số ${this.KEY_GAME.TYPE_GAME} thắng: ${thongBaoBienDongSoDu}`,
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

    this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XOSO({
      key: `${this.KEY_GAME.KEY_SOCKET}:update-lich-su-cuoc-ca-nhan`,
    });

    this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XOSO({
      key: `${this.KEY_GAME.KEY_SOCKET}:admin:refetch-data-lich-su-cuoc-game`,

      data: { phien: this.CURRENT_GAME._id },
    });
    this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XOSO({
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
        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XOSO({
          key: `${this.KEY_GAME.KEY_SOCKET}:phienHoanTatMoiNhat`,
          data: { phienHoanTatMoiNhat },
        });
        let phien = await this.createPhien({ currentPhien });
        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XOSO({ key: `${this.KEY_GAME.KEY_SOCKET}:batDauGame` });
        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XOSO({
          key: `${this.KEY_GAME.KEY_SOCKET}:admin:batDauGame`,
          data: {
            phien,
          },
        });

        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XOSO({ key: `${this.KEY_GAME.KEY_SOCKET}:admin:refetch-data-game` });

        let currentTime = await (await RedisService).get(this.KEY_GAME.TIME_COUNTDOWN);
        if (!currentTime) {
          currentTime = await (
            await RedisService
          ).set(this.KEY_GAME.TIME_COUNTDOWN, this.SETTING_GAME.TIMER, {
            EX: this.SETTING_GAME.TIMER,
          });
        }
        const remainTime = await (await RedisService).ttl(this.KEY_GAME.TIME_COUNTDOWN);

        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XOSO({
          key: `${this.KEY_GAME.KEY_SOCKET}:timer`,
          data: { current_time: remainTime },
        });
        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XOSO({ key: `${this.KEY_GAME.KEY_SOCKET}:hienThiPhien`, data: { phien } });
        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XOSO({
          key: `${this.KEY_GAME.KEY_SOCKET}:admin:timer`,
          data: { current_time: remainTime, phien: phien },
        });
        this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XOSO({
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

          this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XOSO({
            key: `${this.KEY_GAME.KEY_SOCKET}:timer`,
            data: { current_time: currentRemainTime },
          });
          this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XOSO({
            key: `${this.KEY_GAME.KEY_SOCKET}:admin:timer`,
            data: { current_time: currentRemainTime, phien: phien },
          });

          if (this.SETTING_GAME.IS_MODIFIED_RESULT) {
            this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XOSO({
              key: `${this.KEY_GAME.KEY_SOCKET}:admin:hien-thi-ket-qua-dieu-chinh`,
              data: { ketQua: this.SETTING_GAME.MODIFIED_RESULT, phienHienTai: phien },
            });
          }

          // Stop
          if (currentRemainTime <= 0) {
            clearInterval(handleCountdownTime);
            // Bắt đầu quay
            this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XOSO({ key: `${this.KEY_GAME.KEY_SOCKET}:batDauQuay` });
            this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XOSO({
              key: `${this.KEY_GAME.KEY_SOCKET}:admin:batDauQuay`,
              data: { phien },
            });
            setTimeout(async () => {
              // Random và update kết quả
              let ketQuaRandom = await this.randomKetQua();
              await this.updateDataGame({ ketQua: ketQuaRandom });

              this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XOSO({
                key: `${this.KEY_GAME.KEY_SOCKET}:ketqua`,
                data: {
                  ketQuaRandom,
                },
              });
              this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XOSO({
                key: `${this.KEY_GAME.KEY_SOCKET}:admin:ketqua`,
                data: { ketQuaRandom, phien },
              });
              setTimeout(async () => {
                // Dừng quay
                this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XOSO({ key: `${this.KEY_GAME.KEY_SOCKET}:dungQuay` });
                this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XOSO({
                  key: `${this.KEY_GAME.KEY_SOCKET}:admin:dungQuay`,
                  data: { phien },
                });
                // Trả thưởng
                this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XOSO({ key: `${this.KEY_GAME.KEY_SOCKET}:batDauTraThuong` });
                this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XOSO({
                  key: `${this.KEY_GAME.KEY_SOCKET}:admin:batDauTraThuong`,
                  data: { phien },
                });
                await this.traThuong();
                this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_XOSO({ key: `${this.KEY_GAME.KEY_SOCKET}:hoanTatGame` });
                this.SETTING_GAME.SOCKET_SERVICE_METHOD.SEND_ROOM_ADMIN_XOSO({
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

module.exports = GameXoSoService;
