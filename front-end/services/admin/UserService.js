import api from "@/configs/axios";

class UserService {
  static getListUsers = async ({ pageSize, page, searchValue, filter }) => {
    const result = await api.get(
      `/v1/admin/users?results=${pageSize}&page=${page}&query=${searchValue}&filter=${filter}`
    );
    return result;
  };
  static getDepositHistoryUser = async ({ pageSize, page, userId }) => {
    const result = await api.get(`/v1/admin/users/deposit-history?results=${pageSize}&page=${page}&userId=${userId}`);
    return result;
  };
  static getCountAllDepositHistoryUser = async ({ userId }) => {
    const res = await api.get(`/v1/admin/users/deposit-history/get-all?userId=${userId}`);
    return res;
  };
  static getBalanceFluctuationsUser = async ({ pageSize, page, userId }) => {
    const result = await api.get(`/v1/admin/users/bien-dong-so-du?results=${pageSize}&page=${page}&userId=${userId}`);
    return result;
  };
  static getCountAllBalanceFluctuationsUser = async ({ userId }) => {
    const res = await api.get(`/v1/admin/users/bien-dong-so-du/get-all?userId=${userId}`);
    return res;
  };
  static getListUserBank = async ({ userId }) => {
    const result = await api.get(`/v1/admin/users/list-bank?userId=${userId}`);
    return result;
  };
  static getListUserRef = async ({ userId }) => {
    const result = await api.get(`/v1/admin/users/list-ref?userId=${userId}`);
    return result;
  };
  static getCountAllUser = async () => {
    const res = await api.get(`/v1/admin/users/get-so-luong-user`);
    return res;
  };
  static getDetailedUser = async ({ id }) => {
    const res = await api.get(`/v1/admin/users/${id}`);
    return res;
  };
  static updateMoneyUser = async ({ userId, moneyUpdate }) => {
    const res = await api.post(`/v1/admin/users/update-money`, {
      userId,
      moneyUpdate,
    });
    return res;
  };
  static updatePasswordUser = async ({ userId, newPassword }) => {
    const res = await api.post(`/v1/admin/users/update-password`, {
      userId,
      newPassword,
    });
    return res;
  };
  static updatePasswordWithdrawUser = async ({ userId, newPassword }) => {
    const res = await api.post(`/v1/admin/users/update-password-withdraw`, {
      userId,
      newPassword,
    });
    return res;
  };
  static updateInformationUser = async ({
    userId,
    role,
    status,
    money,
    soDienThoai,
    taiKhoan,
    referralCode,
    vipLevel,
  }) => {
    const res = await api.post(`/v1/admin/users/update-information`, {
      userId,
      role,
      status,
      money,
      soDienThoai,
      taiKhoan,
      referralCode,
      vipLevel,
    });
    return res;
  };
  static delete = async (id) => {
    const result = await api.delete(`/v1/admin/users/${id}`);
    return result;
  };
  static createBot = async (data) => {
    const result = await api.post(`/v1/admin/users/bot`, data);
    return result;
  };
  static updateBot = async (id, data) => {
    const result = await api.put(`/v1/admin/users/bot/${id}`, data);
    return result;
  };
  static deleteBot = async (id) => {
    const result = await api.delete(`/v1/admin/users/bot/${id}`);
    return result;
  };
  static getBots = async () => {
    const result = await api.get(`/v1/admin/users/bots`);
    return result.data.data;
  };
  static updateNganHang = async (data) => {
    const result = await api.put(`/v1/admin/users/list-bank`, data);
    return result.data;
  };
  static deleteNganHang = async (id) => {
    const result = await api.delete(`/v1/admin/users/list-bank/${id}`);
    return result.data;
  };
}
export default UserService;
