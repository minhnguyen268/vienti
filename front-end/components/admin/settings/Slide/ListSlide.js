import useGetListSlides from "@/hooks/admin/useGetListSlides";
import { convertDateTime } from "@/utils/convertTime";
import InfoIcon from "@mui/icons-material/Info";
import { Box, Button, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Link from "next/link";
import { useRouter } from "next/router";
import BreadcrumbBar from "../../BreadcrumbBar";
import { useEffect, useState } from "react";
import SlideService from "@/services/admin/SlideService";
import { toast } from "react-toastify";

const BreadcrumbData = [
  {
    title: "Admin",
    href: "/admin",
  },
  {
    title: "Quản lý slide",
    href: "/admin/settings/slide",
  },
];
const ListSlide = () => {
  const router = useRouter();

  const { data, isLoading } = useGetListSlides({});
  const dataQuery = data?.data;
  const GridRowsProp =
    dataQuery?.map((item, i) => ({
      id: item._id,
      action: item._id,
      stt: i + 1,
      hinhAnh: item.hinhAnh,
      createdAt: convertDateTime(item.createdAt),
    })) ?? [];
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    if (data?.metadata.bannerVideo) {
      setVideoUrl(data.metadata.bannerVideo);
    }
  }, [data]);

  const GridColDef = [
    { field: "stt", headerName: "STT", width: 100 },
    {
      field: "hinhAnh",
      headerName: "Hình ảnh",
      width: 250,
      renderCell: (params) => {
        return (
          <img
            src={params.value}
            style={{
              width: "100px",
              height: "50px",
              objectFit: "cover",
            }}
          />
        );
      },
    },

    { field: "createdAt", headerName: "Thời gian tạo", width: 250 },

    {
      field: "action",
      headerName: "Thao tác",
      type: "actions",
      width: 150,
      getActions: (params) => [
        <IconButton onClick={() => router.push(`/admin/settings/slide/${params.id}`)}>
          <InfoIcon />
        </IconButton>,
      ],
    },
  ];

  const handleUpdateVideo = async () => {
    await SlideService.updateVideo({ bannerVideo: videoUrl });
    toast.success("Cập nhật video thành công");
  };

  return (
    <>
      <BreadcrumbBar data={BreadcrumbData} />
      <h1
        className="title admin"
        style={{
          fontSize: "2.5rem",
        }}
      >
        Quản lý banner video
      </h1>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <input
          type="text"
          placeholder="Nhập URL video"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          style={{
            width: "500px",
            marginRight: "10px",
            padding: "8px 8px",
            fontSize: "14px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />
        <Button variant="contained" onClick={() => handleUpdateVideo()}>
          Cập nhật video
        </Button>
      </div>

      <h1
        className="title admin"
        style={{
          fontSize: "2.5rem",
        }}
      >
        Danh sách slide
      </h1>
      <Link href="/admin/settings/slide/new">
        <Button>Thêm mới</Button>
      </Link>

      <Box
        sx={{
          textAlign: "center",
          color: "text.secondary",
          height: 500,
          width: "100%",
          "& .trangthai_hoantat": {
            color: "#1fc67c",
          },
          "& .trangthai_dangcho": {
            color: "#1a3e72",
          },

          "& .MuiPaper-root ": {
            color: "#000000",
          },
        }}
      >
        <DataGrid
          loading={isLoading}
          rows={GridRowsProp}
          columns={GridColDef}
          componentsProps={{
            panel: {
              sx: {
                "& .MuiTypography-root": {
                  color: "dodgerblue",
                  fontSize: 20,
                },
                "& .MuiDataGrid-filterForm": {
                  bgcolor: "lightblue",
                },
              },
            },
          }}
          sx={{
            color: "#000000",
            "& .MuiDataGrid-paper": {
              color: "#000000",
            },
            "& .MuiToolbar-root": {
              color: "#000000",
            },
            "& .MuiMenuItem-root": {
              color: "#000000",
            },
          }}
        />
      </Box>
    </>
  );
};
export default ListSlide;
