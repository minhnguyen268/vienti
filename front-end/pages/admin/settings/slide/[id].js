import { Backdrop, Box, Button, CircularProgress } from "@mui/material";
import { useRouter } from "next/router";

import Layout from "@/components/admin/Layout";
import { toast } from "react-toastify";

import BreadcrumbBar from "@/components/admin/BreadcrumbBar";

import FormSlide from "@/components/admin/settings/Slide/FormSlide";
import useGetDetailedSlide from "@/hooks/admin/useGetDetailedSlide";
import SlideService from "@/services/admin/SlideService";
import { NextSeo } from "next-seo";
import { useState } from "react";

const ChiTiet = ({ ID }) => {
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
      title: "Chi tiết",
      href: "/admin/settings/slide/" + ID,
    },
  ];
  const router = useRouter();
  const { data: dataQuery, isLoading: isLoadingQuery, refetch } = useGetDetailedSlide({ id: ID });
  const [isLoading, setIsLoading] = useState(false);

  const handleClickSubmit = async ({ hinhAnh }) => {
    const results = await SlideService.editSlide({
      id: ID,
      hinhAnh,
    });
    refetch();
    return results;
  };
  const handleClickDelete = async () => {
    try {
      setIsLoading(true);
      const results = await SlideService.deleteSlide({
        id: ID,
      });
      toast.success(results?.data?.message);
      setIsLoading(false);
      router.back();
    } catch (err) {
      setIsLoading(false);
      toast.error(err?.response?.data?.message);
    }
  };

  return (
    <>
      <NextSeo title="Chi tiết slide" />

      <Layout>
        <Backdrop sx={{ color: "#fff", zIndex: 99999 }} open={isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>

        <BreadcrumbBar data={BreadcrumbData} />
        <h1
          className="title admin"
          style={{
            fontSize: "2.5rem",
          }}
        >
          Chi tiết slide
        </h1>

        {isLoadingQuery && (
          <Box
            sx={{
              color: (theme) => theme.palette.text.secondary,
            }}
          >
            <CircularProgress color="inherit" />
          </Box>
        )}

        {dataQuery && (
          <>
            <Button onClick={handleClickDelete}>Xóa slide</Button>

            <FormSlide data={dataQuery} handleOnSubmit={handleClickSubmit} />
          </>
        )}
      </Layout>
    </>
  );
};
export default ChiTiet;
export const getServerSideProps = async (context) => {
  const { params } = context;
  const ID = params.id;

  return {
    props: {
      ID: ID,
    },
  };
};
