const { MIN_RANGE_NUMBER, MAX_RANGE_NUMBER, LOAI_CUOC_GAME } = require("../../configs/game.keno");
const getRandomArbitrary = require("../randomRangeNumber");

const randomBiTheoLoai = ({ loai = LOAI_CUOC_GAME.CHAN }) => {
  let ketQua = getRandomArbitrary(MIN_RANGE_NUMBER, MAX_RANGE_NUMBER);
  if (loai === LOAI_CUOC_GAME.CHAN) {
    if (ketQua % 2 === 0) {
      return ketQua;
    } else {
      return randomBiTheoLoai({ loai });
    }
  } else if (loai === LOAI_CUOC_GAME.LE) {
    if (ketQua % 2 !== 0) {
      return ketQua;
    } else {
      return randomBiTheoLoai({ loai });
    }
  } else if (loai === LOAI_CUOC_GAME.LON) {
    return getRandomArbitrary(5, 9);
  } else if (loai === LOAI_CUOC_GAME.NHO) {
    return getRandomArbitrary(0, 4);
  } else {
    return ketQua;
  }
};

/**
 *
 * @param {Array<Number>} ketQua Kết quả xổ số: [0,0,0,0,0]
 * @return {{
    1: {
      C: false,
      L: false,
    },
    2: { C: false, L: false },
    3: { C: false, L: false },
    4: { C: false, L: false },
    5: { C: false, L: false },
  }} Bảng tra kết quả
 */
const getKetQua = (ketQua) => {
  const results = {};
  for (let i = 0; i < ketQua.length; i++) {
    results[`${i + 1}`] = {
      [`${LOAI_CUOC_GAME.CHAN}`]: false,
      [`${LOAI_CUOC_GAME.LE}`]: false,
      [`${LOAI_CUOC_GAME.LON}`]: false,
      [`${LOAI_CUOC_GAME.NHO}`]: false,
    };
  }

  for (let i = 0; i < ketQua.length; i++) {
    if (ketQua[i] % 2 === 0) {
      results[`${i + 1}`][LOAI_CUOC_GAME.CHAN] = true;
      results[`${i + 1}`][LOAI_CUOC_GAME.LE] = false;
    } else {
      results[`${i + 1}`][LOAI_CUOC_GAME.CHAN] = false;
      results[`${i + 1}`][LOAI_CUOC_GAME.LE] = true;
    }
    if (ketQua[i] >= 5) {
      results[`${i + 1}`][LOAI_CUOC_GAME.LON] = true;
      results[`${i + 1}`][LOAI_CUOC_GAME.NHO] = false;
    } else {
      results[`${i + 1}`][LOAI_CUOC_GAME.LON] = false;
      results[`${i + 1}`][LOAI_CUOC_GAME.NHO] = true;
    }
  }
  return results;
};

const convertLoaiCuocGame = (loaiCuoc) => {
  switch (loaiCuoc) {
    case LOAI_CUOC_GAME.CHAN:
      return "Chẵn";
    case LOAI_CUOC_GAME.LE:
      return "Lẻ";
    case LOAI_CUOC_GAME.LON:
      return "Lớn";
    case LOAI_CUOC_GAME.NHO:
      return "Nhỏ";
    default:
      return "";
  }
};

module.exports = {
  getKetQua,
  randomBiTheoLoai,
  convertLoaiCuocGame,
};
