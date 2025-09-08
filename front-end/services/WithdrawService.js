import api from "@/configs/axios";

class WithdrawService {
  static getList = async ({ pageSize, page }) => {
    const res = await api.get(`/v1/ruttien?results=${pageSize}&page=${page}`);
    return res;
  };

  static createWithdraw = async ({ soTien, nganHang, matKhauRutTien }) => {
    const result = await api.post(`/v1/ruttien`, {
      soTien,
      nganHang,
      matKhauRutTien,
    });
    return result;
  };
}
export default WithdrawService;
