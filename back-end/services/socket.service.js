"use strict";
const AdminSocketService = require("./admin.socket.service");
const GameKeno1PSocketService = require("./game.socket.service/game.keno1p.socket.service");
const GameKeno3PSocketService = require("./game.socket.service/game.keno3p.socket.service");
const GameKeno5PSocketService = require("./game.socket.service/game.keno5p.socket.service");
const GameXucXac1PSocketService = require("./game.socket.service/game.xucxac1p.socket.service");
const GameXucXac3PSocketService = require("./game.socket.service/game.xucxac3p.socket.service");
const GameXocDia1PSocketService = require("./game.socket.service/game.xocdia1p.socket.service");

const GameXoSo3PSocketService = require("./game.socket.service/game.xoso3p.socket.service");
const GameXoSo5PSocketService = require("./game.socket.service/game.xoso5p.socket.service");

const UserSocketService = require("./user.socket.service");

const WithdrawSocketService = require("./withdraw.socket.service");

class SocketService {
  connection(socket) {
    if (socket.recovered) {
      console.log("SOCKER recovery", global._io.sockets.adapter.rooms);
    }
    console.log("New client connected " + socket.id);
    socket.on("disconnect", () => {
      console.log("client disconnected " + socket.id);
    });
    new GameKeno1PSocketService(socket);
    new GameKeno3PSocketService(socket);
    new GameKeno5PSocketService(socket);

    new GameXucXac1PSocketService(socket);
    new GameXucXac3PSocketService(socket);

    new GameXocDia1PSocketService(socket);
    new GameXoSo3PSocketService(socket);
    new GameXoSo5PSocketService(socket);
    new UserSocketService(socket);
    new AdminSocketService(socket);

    new WithdrawSocketService(socket);
  }
}
module.exports = SocketService;
