import useGetListUserRef from "@/hooks/admin/useGetListUserRef";
import { convertDateTime } from "@/utils/convertTime";
import { Box, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { convertJSXMoney } from "@/utils/convertMoney";
import { convertJSXTinhTrangUser, convertTinhTrangUser } from "@/utils/convertTinhTrang";
import InfoIcon from "@mui/icons-material/Info";
import { useRouter } from "next/router";

const ListRefUsers = ({ ID }) => {
  const router = useRouter();
  const { data: dataQuery, isLoading } = useGetListUserRef({ userId: ID });

  const GridRowsProp =
    dataQuery?.map((item, i) => ({
      id: item._id,
      action: item._id,
      stt: i + 1,
      taiKhoan: item.taiKhoan,
      money: item.money,
      status: item.status,
      createdAt: convertDateTime(item.createdAt),
    })) ?? [];
  console.log(111, dataQuery, GridRowsProp)

  const GridColDef = [
    { field: "stt", headerName: "STT", width: 100 },
    { field: "taiKhoan", headerName: "Tài khoản", width: 100 },
    {
      field: "money",
      headerName: "Tổng tiền",
      width: 250,
      renderCell: (params) => {
        return convertJSXMoney(params.value);
      },
    },
    {
      field: "status",
      headerName: "Tình trạng",
      width: 250,

      renderCell: (params) => {
        return convertJSXTinhTrangUser(params.row.status);
      },

      valueGetter: (params) => {
        return convertTinhTrangUser(params.row.status);
      },
    },
    { field: "createdAt", headerName: "Thời gian tạo", width: 250 },
    {
      field: "action",
      headerName: "Thao tác",
      type: "actions",
      width: 150,
      getActions: (params) => [
        <IconButton sx={{ padding: '0px' }} onClick={() => router.push(`/admin/users/${params.id}`)}>
          <InfoIcon />
        </IconButton>,
      ],
    },
  ];

  return (
    <>
      <h2
        className="title admin"
        style={{
          fontSize: "2.5rem",
        }}
      >
        Danh sách người dùng đã mời {dataQuery ? `(${dataQuery.length})` : ""}
      </h2>

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
export default ListRefUsers;
