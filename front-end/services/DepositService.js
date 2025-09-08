import api from "@/configs/axios";

class DepositService {
  static getList = async ({ pageSize, page }) => {
    const res = await api.get(`/v1/naptien?results=${pageSize}&page=${page}`);
    return res;
  };

  static createDeposit = async ({ soTien, nganHang }) => {
    const result = await api.post(`/v1/naptien`, {
      soTien,
      nganHang,
    });
    return result;
  };
}
export default DepositService;
