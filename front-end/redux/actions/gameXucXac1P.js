import {
  SET_IS_PLAY_GAME_XUCXAC_1P,
  SET_KET_QUA_PHIEN_TRUOC_XUCXAC_1P,
  SET_KET_QUA_XUCXAC_1P,
  SET_PHIEN_XUCXAC_1P,
  SET_TIMER_XUCXAC_1P,
  SET_TINH_TRANG_XUCXAC_1P,
} from "./constants";
export const setTimer = (value) => (dispatch) => {
  dispatch({
    type: SET_TIMER_XUCXAC_1P,
    data: value,
  });
};
export const setPhien = (value) => (dispatch) => {
  dispatch({
    type: SET_PHIEN_XUCXAC_1P,
    data: value,
  });
};
export const setTinhTrang = (value) => (dispatch) => {
  dispatch({
    type: SET_TINH_TRANG_XUCXAC_1P,
    data: value,
  });
};
export const setKetQuaPhienTruoc = (value) => (dispatch) => {
  dispatch({
    type: SET_KET_QUA_PHIEN_TRUOC_XUCXAC_1P,
    data: value,
  });
};
export const setKetQua = (value) => (dispatch) => {
  dispatch({
    type: SET_KET_QUA_XUCXAC_1P,
    data: value,
  });
};
export const setIsPlayGame = (value) => (dispatch) => {
  dispatch({
    type: SET_IS_PLAY_GAME_XUCXAC_1P,
    data: value,
  });
};
