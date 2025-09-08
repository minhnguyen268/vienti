import api from "@/configs/axios";
class SystemService {
  static getTawkToConfig = async () => {
    const res = await api.get(`/v1/hethong/tawk-to`);
    return res;
  };
  static getListBank = async () => {
    const res = await api.get(`/v1/hethong/ngan-hang`);
    return res;
  };
  static getCSKHLink = async () => {
    const res = await api.get(`/v1/hethong/cskh-link`);
    return res.data.data;
  };
}

export default SystemService;
