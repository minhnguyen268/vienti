import api from "@/configs/axios";

class UserService {
  static getDetailedInformation = async () => {
    const result = await api.get(`/v1/nguoidung?date=${new Date().toISOString()}`);
    return result;
  };
  static changePassword = async ({ currentPassword, newPassword }) => {
    const result = await api.post(`/v1/nguoidung/change-password`, {
      currentPassword,
      newPassword,
    });
    return result;
  };
  static updatePasswordRutTien = async ({ matKhauRutTien }) => {
    const result = await api.post(`/v1/nguoidung/update-password-withdraw`, {
      matKhauRutTien,
    });
    return result;
  };
  static checkHasPasswordWithdraw = async () => {
    const result = await api.post(`/v1/nguoidung/check-has-withdraw-password`);
    return result;
  };
  static changePhone = async (phone) => {
    const result = await api.post(`/v1/nguoidung/change-phone`, { phone });
    return result;
  };
}
export default UserService;
