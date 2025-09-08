import useGetListUserBank from "@/hooks/admin/useGetListUserBank";
import { convertDateTime } from "@/utils/convertTime";
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, IconButton } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useState } from "react";
import FormBank from "@/components/admin/settings/Bank/FormBank";
import CloseIcon from "@mui/icons-material/Close";
import { listBank } from "@/utils/listBank";
import UserService from "@/services/admin/UserService";
import { toast } from "react-toastify";

const ListUserBank = ({ ID }) => {
  const { data: dataQuery, isLoading, refetch } = useGetListUserBank({ userId: ID });
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [updateForm, setUpdateForm] = useState({
    tenChuTaiKhoan: "",
    soTaiKhoan: "",
    code: "",
    tenNganHang: "",
  });

  const GridRowsProp =
    dataQuery?.map((item, i) => ({
      id: item._id,
      action: item._id,
      stt: i + 1,
      tenNganHang: item.tenNganHang,
      soTaiKhoan: item.soTaiKhoan,
      tenChuTaiKhoan: item.tenChuTaiKhoan,
      bin: item.bankCode,
      createdAt: convertDateTime(item.createdAt),
    })) ?? [];

  const handleUpdateClick = (row) => {
    setSelectedRow(row);
    setUpdateForm({
      tenChuTaiKhoan: row.tenChuTaiKhoan,
      soTaiKhoan: row.soTaiKhoan,
      tenNganHang: row.tenNganHang,
      code: listBank.find((bank) => bank.bin === row.bin)?.code || "",
    });
    setUpdateModalOpen(true);
  };

  const handleDeleteClick = (row) => {
    setSelectedRow(row);
    setDeleteModalOpen(true);
  };

  const handleUpdateConfirm = async (data) => {
    await UserService.updateNganHang({
      id: selectedRow.id,
      tenNganHang: listBank.find((bank) => bank.code === data.code)?.short_name || "",
      bankCode: listBank.find((bank) => bank.code === data.code)?.bin || "",
      tenChuTaiKhoan: data.tenChuTaiKhoan,
      soTaiKhoan: data.soTaiKhoan,
    });
    refetch();
    toast.success("Cập nhật thông tin ngân hàng thành công");
    setUpdateModalOpen(false);
    setSelectedRow(null);
  };

  const handleDeleteConfirm = async () => {
    await UserService.deleteNganHang(selectedRow.id);
    toast.success("Xóa thông tin ngân hàng thành công");
    refetch();
    setDeleteModalOpen(false);
    setSelectedRow(null);
  };

  const handleModalClose = () => {
    setUpdateModalOpen(false);
    setDeleteModalOpen(false);
    setSelectedRow(null);
  };

  const GridColDef = [
    { field: "stt", headerName: "STT", width: 100 },
    { field: "tenNganHang", headerName: "Tên ngân hàng", width: 200 },
    {
      field: "soTaiKhoan",
      headerName: "STK",
      width: 250,
    },
    { field: "tenChuTaiKhoan", headerName: "Chủ tài khoản", width: 250 },

    { field: "createdAt", headerName: "Thời gian tạo", width: 250 },
    {
      field: "action",
      headerName: "Hành động",
      width: 150,
      renderCell: (params) => (
        <div>
          <IconButton color="primary" onClick={() => handleUpdateClick(params.row)} size="small">
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton color="error" onClick={() => handleDeleteClick(params.row)} size="small">
            <DeleteIcon fontSize="small" />
          </IconButton>
        </div>
      ),
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
        Danh sách ngân hàng
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

      {/* Update Modal */}
      <Dialog open={updateModalOpen} onClose={handleModalClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          Cập nhật thông tin ngân hàng
          <IconButton
            aria-label="close"
            onClick={handleModalClose}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <FormBank hideStatus data={updateForm} handleOnSubmit={(data) => handleUpdateConfirm(data)} />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onClose={handleModalClose}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent style={{ fontSize: "16px" }}>
          Bạn có chắc chắn muốn xóa thông tin ngân hàng này không?
          {selectedRow && (
            <div style={{ marginTop: "10px", fontWeight: "bold" }}>
              {selectedRow.tenNganHang} - {selectedRow.soTaiKhoan}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose}>Hủy</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
export default ListUserBank;
