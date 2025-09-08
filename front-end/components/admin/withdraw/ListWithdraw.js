import { ADMIN_LIST_WITHDRAW_HISTORY_PAGE_SIZE } from "@/configs/withdraw.config";
import useGetCountAllWithdrawHistory from "@/hooks/admin/useGetCountAllWithdrawHistory";
import useGetListWithdrawHistory from "@/hooks/admin/useGetListWithdrawHistory";
import { convertJSXMoney } from "@/utils/convertMoney";
import { convertDateTime } from "@/utils/convertTime";
import { convertJSXTinhTrangWithdrawHistory, convertTinhTrangWithdrawHistory } from "@/utils/convertTinhTrang";
import InfoIcon from "@mui/icons-material/Info";
import { Box, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useRouter } from "next/router";
import { useContext, useState, useEffect } from "react";
import SocketContext from "@/context/socket";

const ListWithdraw = ({ userId = "" }) => {
  const { socket } = useContext(SocketContext);
  const [page, setPage] = useState(0);
  const router = useRouter();
  const [pageSize, setPageSize] = useState(ADMIN_LIST_WITHDRAW_HISTORY_PAGE_SIZE);
  const { data: dataQuery, isLoading, refetch } = useGetListWithdrawHistory({ page: page + 1, pageSize, userId });
  const { data: rowCountState } = useGetCountAllWithdrawHistory({ userId });
  const GridRowsProp =
    dataQuery?.map((item, i) => ({
      id: item._id,
      action: item._id,
      stt: i + 1,
      taiKhoan: item?.nguoiDung?.taiKhoan?  item?.nguoiDung?.taiKhoan : '',
      noiDung: item.noiDung,
      soTien: item.soTien,
      tinhTrang: item.tinhTrang,
      daXem: item.daXem,
      nganHang: `${item.nganHang.tenNganHang} - ${item.nganHang.soTaiKhoan} - ${item.nganHang.tenChuTaiKhoan}`,
      createdAt: convertDateTime(item.createdAt),
    })) ?? [];

  useEffect(() => {
    if (socket) {
      // socket.emit("get-users-withdraw");
      socket.on("update-users-list", () => {
        refetch();
      });
      return () => {
        socket.off("update-users-list");
      };
    }
  }, [socket]);

  const GridColDef = [
    { field: "stt", headerName: "STT", width: 100 },
    { field: "taiKhoan", headerName: "Tài khoản", width: 150 },
    {
      field: "soTien",
      headerName: "Số tiền",
      width: 150,
      renderCell: (params) => {
        return convertJSXMoney(params.value);
      },
    },
    {
      field: "nganHang",
      headerName: "Ngân hàng",
      width: 150,
    },
    {
      field: "noiDung",
      headerName: "Nội dung",
      width: 250,
    },
    {
      field: "tinhTrang",
      headerName: "Tình trạng",
      width: 150,
      renderCell: (params) => {
        return convertJSXTinhTrangWithdrawHistory(params.row.tinhTrang);
      },
      valueGetter: (params) => {
        return convertTinhTrangWithdrawHistory(params.row.tinhTrang);
      },
    },

    { field: "createdAt", headerName: "Thời gian", width: 150 },
    {
      field: "action",
      headerName: "Thao tác",
      type: "actions",
      width: 150,
      getActions: (params) => [
        <IconButton onClick={() => router.push(`/admin/withdraw/${params.id}`)}>
          <InfoIcon />
        </IconButton>,
      ],
    },
  ];

  return (
    <>
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
          getRowClassName={(params) => (params.row.daXem === false ? "custom-row-class" : "")}
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
            ".custom-row-class": {
              backgroundColor: "#EDE8E1",
              ":hover": {
                backgroundColor: "#EDE8E1",
              },
            },
          }}
        />
      </Box>
    </>
  );
};
export default ListWithdraw;
