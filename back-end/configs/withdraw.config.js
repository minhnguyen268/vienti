const STATUS_WITHDRAW = {
  PENDING: "dangCho",
  SUCCESS: "hoanTat",
  CANCEL: "daHuy",
};
const MIN_MONEY_WITHDRAW = 1;
Object.freeze(STATUS_WITHDRAW);
module.exports = {
  STATUS_WITHDRAW,
  MIN_MONEY_WITHDRAW,
};
