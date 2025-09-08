import useGetListSlides from "@/hooks/useGetListSlides";
import { Autoplay } from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";

const HomeSlide = () => {
  const { data, isLoading } = useGetListSlides();
  const bannerVideo = data?.metadata?.bannerVideo || "";

  return (
    <>
      {bannerVideo ? (
        <>
          <video
            autoPlay
            loop
            muted
            style={{
              width: "100%",
              borderRadius: "10px",
              marginBottom: "5px",
              maxHeight: "500px",
              objectFit: "cover",
            }}
          >
            <source src={bannerVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </>
      ) : (
        <Swiper
          autoplay={{
            delay: 2500,
            disableOnInteraction: false,
          }}
          modules={[Autoplay]}
          spaceBetween={50}
          slidesPerView={1}
          style={{
            borderRadius: "10px",
            zIndex: 0,
          }}
        >
          {data?.data?.map((item, i) => (
            <SwiperSlide key={i}>
              <img
                src={item.hinhAnh}
                alt={""}
                style={{
                  width: "100%",
                  objectFit: "cover",
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </>
  );
};
export default HomeSlide;
