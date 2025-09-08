"use strict";

const NguoiDung = require("../models/NguoiDung");

class WithdrawSocketService {
  constructor(socket) {
    this.socket = socket;
    this.socket.on("get-users-withdraw", async (account, callback) => {
      try {
        const getUser = await NguoiDung.findOne({ taiKhoan: account });
        if (!getUser || getUser.role !== "admin") {
          throw new Error("Err");
        }
        callback({
          status: "success",
        });
      } catch (err) {
        // console.log(err);
        callback({
          status: "error",
        });
      }
    });
  }
  static updateUsersWithdrawList = () => {
    global._io.sockets.emit("update-users-list");
  };
}

module.exports = WithdrawSocketService;
