import { SET_BALANCE, SET_DISPLAY_BALANCE, UPDATE_BALANCE } from "../actions/constants";
const initialState = {
  isDialogOpen: true,
  logoUrl: "",
  noiDungPopup: "",
};
const settingReducer = (state = initialState, payload) => {
  switch (payload.type) {
    case "closeDialog":
      return {
        ...state,
        isDialogOpen: false,
      };
    case "setLogo":
      return {
        ...state,
        logoUrl: payload.data,
      };
    case "setNoiDungPopup":
      return {
        ...state,
        noiDungPopup: payload.data,
      };
    default:
      return state;
  }
};
export default settingReducer;
