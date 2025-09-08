import api from "@/configs/axios";
class DepositService {
  static getDetailedDepositHistory = async ({ id }) => {
    const res = await api.get(`/v1/admin/nap-tien/${id}`);
    return res;
  };
  static editDetailedDepositHistory = async ({ id, noiDung, tinhTrang }) => {
    const res = await api.put(`/v1/admin/nap-tien/${id}`, {
      noiDung,
      tinhTrang,
    });
    return res;
  };
  static countAllDepositHistory = async ({ userId }) => {
    const res = await api.get(`/v1/admin/nap-tien/get-all?userId=${userId}`);
    return res;
  };
  static getListDepositHistory = async ({ pageSize, page, userId }) => {
    const res = await api.get(`/v1/admin/nap-tien?results=${pageSize}&page=${page}&userId=${userId}`);
    return res;
  };
  static createDeposit = async ({ userId, soTien, nganHang, noiDung }) => {
    const res = await api.post(`/v1/admin/nap-tien`, {
      userId,
      soTien,
      nganHang,
      noiDung,
    });
    return res;
  };
  static removeDeposit = async (id) => {
    const res = await api.delete(`/v1/admin/nap-tien/${id}`);
    return res;
  };
}

export default DepositService;
