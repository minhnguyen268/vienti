export const setCloseDialog = (value) => (dispatch) => {
  dispatch({
    type: "closeDialog",
    data: value,
  });
};
export const setLogo = (value) => (dispatch) => {
  dispatch({
    type: "setLogo",
    data: value,
  });
};
export const setNoiDungPopup = (value) => (dispatch) => {
  dispatch({
    type: "setNoiDungPopup",
    data: value,
  });
};
