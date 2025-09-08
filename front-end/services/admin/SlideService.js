import api from "@/configs/axios";
class SlideService {
  static getDetailedSlide = async ({ id }) => {
    const res = await api.get(`/v1/admin/slide/${id}`);
    return res;
  };
  static countAllSlide = async () => {
    const res = await api.get(`/v1/admin/slide/get-all`);
    return res;
  };
  static getListSlides = async () => {
    const res = await api.get(`/v1/admin/slide`);
    return res;
  };
  static editSlide = async ({ id, hinhAnh }) => {
    const res = await api.put(`/v1/admin/slide/${id}`, {
      hinhAnh,
    });
    return res;
  };
  static createSlide = async ({ hinhAnh }) => {
    const res = await api.post(`/v1/admin/slide`, {
      hinhAnh,
    });
    return res;
  };
  static deleteSlide = async ({ id }) => {
    const res = await api.delete(`/v1/admin/slide/${id}`);
    return res;
  };
  static updateVideo = async ({ bannerVideo }) => {
    const res = await api.put(`/v1/admin/slide/video`, {
      bannerVideo,
    });
    return res;
  };
}

export default SlideService;
