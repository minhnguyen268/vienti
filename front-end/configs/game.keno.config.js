export const TINH_TRANG_GAME = {
  DANG_CHO: "dangCho",
  DANG_QUAY: "dangQuay",
  DANG_TRA_THUONG: "dangTraThuong",
  HOAN_TAT: "hoanTat",
};
export const STATUS_BET_GAME = {
  DANG_CHO: "dangCho",
  THANG: "thang",
  THUA: "thua",
};

export const LOAI_CUOC_GAME = {
  CHAN: "C",
  LE: "L",
  LON: "LON",
  NHO: "NHO",
};

export const convertLoaiCuocGame = (loaiCuoc) => {
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

export const LOAI_CUOC = Object.values(LOAI_CUOC_GAME).map((item) => ({
  tenCuoc: convertLoaiCuocGame(item),
  loaiCuoc: item,
}));

export const MUC_TIEN_CUOC = [5000, 10000, 50000, 100000, 500000, 1000000];
export const LOAI_BI = ["1", "2", "3", "4", "5"];

export const GAME_HISTORY_PAGE_SIZE = 20;
export const USER_BET_GAME_HISTORY_PAGE_SIZE = 20;
