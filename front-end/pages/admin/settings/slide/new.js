import BreadcrumbBar from "@/components/admin/BreadcrumbBar";
import Layout from "@/components/admin/Layout";
import FormSlide from "@/components/admin/settings/Slide/FormSlide";
import SlideService from "@/services/admin/SlideService";
import { NextSeo } from "next-seo";

const ThemBank = () => {
  const BreadcrumbData = [
    {
      title: "Admin",
      href: "/admin",
    },
    {
      title: "Quản lý slide",
      href: "/admin/settings/slide",
    },
    {
      title: "Thêm slide",
      href: "/admin/settings/slide/new",
    },
  ];

  const handleOnSubmit = async ({ hinhAnh }) => {
    const results = await SlideService.createSlide({
      hinhAnh,
    });
    return results;
  };

  return (
    <>
      <NextSeo title="Thêm slide" />
      <Layout>
        <BreadcrumbBar data={BreadcrumbData} />
        <h1
          className="title admin"
          style={{
            fontSize: "2.5rem",
          }}
        >
          Thêm slide
        </h1>
        <FormSlide
          data={{
            hinhAnh: "",
          }}
          handleOnSubmit={handleOnSubmit}
        />
      </Layout>
    </>
  );
};
export default ThemBank;
