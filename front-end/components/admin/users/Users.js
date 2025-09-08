import { ADMIN_LIST_USER_PAGE_SIZE } from "@/configs/user.config";
import useGetCountAllUser from "@/hooks/admin/useGetCountAllUser";
import useGetListUsers from "@/hooks/admin/useGetListUsers";
import { convertJSXMoney } from "@/utils/convertMoney";
import { convertDateTime } from "@/utils/convertTime";
import { convertJSXTinhTrangUser, convertTinhTrangUser } from "@/utils/convertTinhTrang";
import InfoIcon from "@mui/icons-material/Info";
import { Box, CircularProgress, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useRouter } from "next/router";
import { useState } from "react";
import BreadcrumbBar from "../BreadcrumbBar";
import BoxSearch from "./BoxSearch";
import UserService from "@/services/admin/UserService";
import { toast } from "react-toastify";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import { useSession } from "next-auth/react";
import Bots from "./Bots";

const BreadcrumbData = [
  {
    title: "Admin",
    href: "/admin",
  },
  {
    title: "Quản lý người dùng",
    href: "/admin/users",
  },
];
const Users = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchValue, setSearchValue] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(ADMIN_LIST_USER_PAGE_SIZE);
  const [filter, setFilter] = useState(0); // 0 => all, 1 => only user, 2 => only admin + nhân viên
  const { data: dataQuery, isLoading, refetch } = useGetListUsers({ page: page + 1, pageSize, searchValue, filter });
  const { data: rowCountState } = useGetCountAllUser();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [id, setId] = useState();

  const GridRowsProp = dataQuery?.map((item, i) => ({
    id: item._id,
    publicId: item.publicId,
    action: item._id,
    stt: i + 1,
    taiKhoan: item.taiKhoan,
    money: item.money,
    role: item.role,
    referralCount: item.referralCount,
    referralUser: item.referralUser,
    vipLevel: item.vipLevel,

    status: item.status,

    createdAt: convertDateTime(item.createdAt),
  }));

  const GridColDef = [
    { field: "stt", headerName: "STT", width: 100 },
    { field: "publicId", headerName: "ID", width: 200 },
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
    { field: "role", headerName: "Role", width: 150 },
    { field: "referralUser", headerName: "Giới thiệu bởi", width: 150 },
    { field: "referralCount", headerName: "Số người giới thiệu", width: 150 },
    { field: "vipLevel", headerName: "Vip", width: 150 },
    {
      field: "action",
      headerName: "Thao tác",
      type: "actions",
      width: 150,
      getActions: (params) =>
        params.row.role === "admin" && session.user.role === "manager"
          ? []
          : [
              <IconButton key="info" sx={{ padding: "0px" }} onClick={() => router.push(`/admin/users/${params.id}`)}>
                <InfoIcon />
              </IconButton>,
            ],
    },
    {
      field: "delete",
      headerName: "Xoá tài khoản",
      width: 150,
      renderCell: (params) =>
        params.row.role === "admin" && session.user.role === "manager" ? null : (
          <button
            style={{
              cursor: "pointer",
              color: "white",
              backgroundColor: "red",
              padding: "5px 12px",
              borderRadius: "5px",
              border: "none",
            }}
            onClick={() => {
              setId(params.id);
              setIsDialogOpen(true);
            }}
          >
            Xóa
          </button>
        ),
    },
  ];

  async function deleteAccount() {
    try {
      await UserService.delete(id);
      setIsDialogOpen(false);
      toast.success("Xóa tài khoản thành công");
      refetch();
    } catch (error) {
      console.log(error);
      toast.error("Xóa tài khoản thất bại");
    }
  }

  return (
    <>
      <Dialog PaperProps={{ sx: { borderRadius: "10px" } }} open={isDialogOpen}>
        <DialogTitle style={{ textAlign: "center" }}>Xác nhận xóa người dùng</DialogTitle>
        <DialogActions style={{ display: "flex", justifyContent: "center", paddingBottom: "20px" }}>
          <button
            onClick={() => setIsDialogOpen(false)}
            style={{
              fontSize: "20px",
              borderRadius: "10px",
              border: "none",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            Quay lại
          </button>
          <button
            onClick={() => deleteAccount()}
            style={{
              fontSize: "20px",
              borderRadius: "10px",
              border: "none",
              padding: "5px 10px",
              cursor: "pointer",
            }}
          >
            Xác nhận
          </button>
        </DialogActions>
      </Dialog>
      <BreadcrumbBar data={BreadcrumbData} />
      <h1
        className="title admin"
        style={{
          fontSize: "2.5rem",
        }}
      >
        Danh sách người dùng
      </h1>
      <BoxSearch searchValue={searchValue} setSearchValue={setSearchValue} />
      <select
        style={{ height: "40px", borderRadius: "10px", fontSize: "16px" }}
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
      >
        <option value="0">Tất cả</option>
        <option value="1">Người dùng</option>
        <option value="2">Nhân viên</option>
      </select>

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
        {isLoading && <CircularProgress color="inherit" />}

        {!isLoading && (
          <DataGrid
            rowsPerPageOptions={[10, 50, 100]}
            pagination
            rowCount={rowCountState ?? 0}
            page={page}
            pageSize={pageSize}
            paginationMode="server"
            loading={isLoading}
            onPageChange={(newPage) => setPage(newPage)}
            onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
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
        )}
      </Box>

      <Bots />
    </>
  );
};
export default Users;
