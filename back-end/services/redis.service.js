"use strict";
const { createClient } = require("redis");
const { redisConnectionString } = require("../configs/database");

class RedisService {
  constructor() {
    this.instance = null;
  }
  static async connect() {
    const client = await createClient({
      url: redisConnectionString,
    })
      .on("error", (err) => console.log("Redis Client Error", err))

      .connect();
    console.log("Redis connected");

    return client;
  }
  static async getInstance() {
    if (!this.instance) {
      this.instance = await this.connect();
    }
    return this.instance;
  }
}
module.exports = RedisService.getInstance();
