import api from "@/configs/axios";
class SlideService {
  static getListSlides = async () => {
    const res = await api.get(`/v1/hethong/slide`);
    return res;
  };
}

export default SlideService;
