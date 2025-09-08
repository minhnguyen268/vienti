"use strict";

const HeThong = require("../models/HeThong");

class AdminSocketService {
  constructor(socket) {
    const { role } = global._io;

    this.socket = socket;
  }
}

module.exports = AdminSocketService;
