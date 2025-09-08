import BoxSearch from "./BoxSearch";
import { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Dialog, DialogTitle, DialogContent, DialogActions } from "@mui/material";
import UserService from "@/services/admin/UserService";
import { toast } from "react-toastify";
import { useQuery } from "react-query";

const Bots = () => {
  const [searchValue, setSearchValue] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState();
  const [formData, setFormData] = useState({
    taiKhoan: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const { data: bots = [], refetch } = useQuery({
    queryKey: ["get-bots"],
    queryFn: UserService.getBots,
  });

  const validateForm = () => {
    const errors = {};
    if (!formData.taiKhoan.trim()) {
      errors.taiKhoan = "Tài khoản không được để trống";
    }
    return errors;
  };

  const handleCloseCreateDialog = () => {
    setIsCreateDialogOpen(false);
    setFormData({ taiKhoan: "" });
    setFormErrors({});
  };

  const handleCreateBot = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      await UserService.createBot(formData);
      toast.success("Tạo tài khoản bot thành công");
      refetch();
      handleCloseCreateDialog();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message ?? "Có lỗi xảy ra khi thực hiện");
    }
  };

  const GridColDef = [
    { field: "taiKhoan", headerName: "Tài khoản", flex: 1 },
    { field: "createdAt", headerName: "Thời gian tạo", width: 250 },
    {
      field: "action",
      headerName: "Thao tác",
      type: "actions",
      width: 150,
      getActions: (params) => [
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
            setDeleteId(params.id);
            setIsDeleteDialogOpen(true);
          }}
        >
          Xóa
        </button>,
      ],
    },
  ];

  const handleDeleteBot = async () => {
    await UserService.deleteBot(deleteId);
    toast.success("Xóa bot thành công");
    setIsDeleteDialogOpen(false);
    refetch();
  };

  const filteredBots = (bots || [])
    .filter((bot) => bot.taiKhoan.includes(searchValue))
    .map((b) => ({ ...b, id: b._id }));

  return (
    <>
      <h1
        className="title admin"
        style={{
          fontSize: "2.5rem",
          marginTop: "50px",
        }}
      >
        Danh sách bots
      </h1>
      <BoxSearch searchValue={searchValue} setSearchValue={setSearchValue} />
      <Button variant="contained" onClick={() => setIsCreateDialogOpen(true)} style={{ marginBottom: "20px" }}>
        Tạo bot mới
      </Button>
      <div style={{ width: "100%", height: 500 }}>
        <DataGrid
          rows={filteredBots}
          columns={GridColDef}
          disableSelectionOnClick
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
          hideFooter
          initialState={{
            sorting: {
              sortModel: [{ field: "createdAt", sort: "desc" }],
            },
          }}
        />
      </div>

      <Dialog open={isCreateDialogOpen} onClose={handleCloseCreateDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Tạo bot mới</DialogTitle>
        <DialogContent>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500", fontSize: "15px" }}>
              Tài khoản
            </label>
            <input
              autoFocus
              type="text"
              value={formData.taiKhoan}
              onChange={(e) => {
                setFormData({ ...formData, taiKhoan: e.target.value });
                if (formErrors.taiKhoan) {
                  setFormErrors({ ...formErrors, taiKhoan: "" });
                }
              }}
              style={{
                width: "100%",
                padding: "12px",
                border: formErrors.taiKhoan ? "2px solid #f44336" : "1px solid #ccc",
                borderRadius: "8px",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
              }}
              placeholder="Nhập tài khoản bot"
            />
            {formErrors.taiKhoan && (
              <div style={{ color: "#f44336", fontSize: "12px", marginTop: "4px" }}>{formErrors.taiKhoan}</div>
            )}
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>Hủy</Button>
          <Button onClick={handleCreateBot} variant="contained">
            Tạo bot
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle style={{ textAlign: "center", minWidth: "300px" }}>Xác nhận xóa bot</DialogTitle>
        <DialogActions style={{ display: "flex", justifyContent: "center", paddingBottom: "20px" }}>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Quay lại</Button>
          <Button
            onClick={() => {
              handleDeleteBot();
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Bots;
