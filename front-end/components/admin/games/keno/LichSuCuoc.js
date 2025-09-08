import SocketContext from "@/context/socket";
import { Box, CircularProgress, Input, Select } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useContext, useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";

import { convertLoaiCuocGame } from "@/configs/game.keno.config";
import useGetDetailedBetGameHistory from "@/hooks/admin/useGetDetailedBetGameHistory";
import { convertDateTime } from "@/utils/convertTime";

import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import EditIcon from "@mui/icons-material/Edit";
import GameService from "@/services/admin/GameService";
import { toast } from "react-toastify";

const Bi = [1, 2, 3, 4, 5];
const LoaiCuoc = [
  {
    name: "Chẵn",
    value: "C",
  },
  {
    name: "Lẻ",
    value: "L",
  },
  {
    name: "Lớn",
    value: "LON",
  },
  {
    name: "Nhỏ",
    value: "NHO",
  },
];

const transformDataGrid = (dataQuery) => {
  const newData =
    dataQuery?.map((item, i) => ({
      id: item._id,
      nguoiDung: item.nguoiDung.taiKhoan,
      noiDung: item.datCuoc,

      stt: i + 1,
      ketQua: item.ketQua,
      tinhTrang: item.tinhTrang,

      createdAt: convertDateTime(item.createdAt),
    })) ?? [];
  return newData;
};
const LichSuCuoc = ({ ID, TYPE_GAME = "keno1p" }) => {
  const { socket } = useContext(SocketContext);
  const [open, setOpen] = React.useState(false);

  const {
    data: dataQuery,
    isLoading,
    refetch,
  } = useGetDetailedBetGameHistory({
    typeGame: TYPE_GAME,
    id: ID,
  });
  const [data, setData] = useState(transformDataGrid(dataQuery));
  const [id, setId] = useState();
  const [user, setUser] = useState();
  const [bi, setBi] = useState(1);
  const [loaiCuoc, setLoaiCuoc] = useState();
  const [tienCuoc, setTienCuoc] = useState(1);

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (socket) {
      socket.emit(`${TYPE_GAME}:join-room-admin`);
      socket.on(`${TYPE_GAME}:admin:refetch-data-lich-su-cuoc-game`, ({ phien }) => {
        if (phien == ID) {
          refetch();
        }
      });
      return () => {
        socket.off(`${TYPE_GAME}:admin:refetch-data-lich-su-cuoc-game`);
      };
    }
  }, [socket]);

  useEffect(() => {
    if (dataQuery) {
      setData(transformDataGrid(dataQuery));
    }
  }, [dataQuery]);

  const GridRowsProp = data;

  const GridColDef = [
    { field: "stt", headerName: "STT", width: 100 },
    { field: "nguoiDung", headerName: "Nguời dùng", width: 100 },
    {
      field: "noiDung",
      headerName: "Nội dung",
      width: 250,
      height: 200,
      renderCell: (params) => (
        <Box>
          {params.row.noiDung.map((item, i) => {
            const { loaiCuoc, tienCuoc } = item.chiTietCuoc[0];
            return (
              <Box
                key={i}
                sx={{
                  fontSize: "1.2rem",
                }}
              >
                Bi {item.loaiBi}- {convertLoaiCuocGame(loaiCuoc)} -{" "}
                <NumericFormat value={tienCuoc} displayType="text" allowLeadingZeros thousandSeparator="," />đ
              </Box>
            );
          })}
        </Box>
      ),
    },

    {
      field: "tinhTrang",
      headerName: "Tình trạng",
      width: 250,
      cellClassName: (params) => {
        if (params.value === "đang chờ") {
          return "trangthai_dangcho";
        } else if (params.value === "hoàn tất") {
          return "trangthai_hoantat";
        } else {
          return "";
        }
      },
      valueGetter: (params) => {
        if (params.row.tinhTrang === "dangCho") {
          return "đang chờ";
        } else if (params.row.tinhTrang === "hoanTat") {
          return "hoàn tất";
        } else {
          return "";
        }
      },
    },
    { field: "createdAt", headerName: "Thời gian", width: 250 },
    {
      field: "",
      headerName: "Chỉnh sửa",
      width: 200,
      renderCell: (params) => (
        <Box
          sx={{
            "&:hover": {
              cursor: "pointer",
            },
          }}
          onClick={() => {
            setId(params.row.id);
            setUser(params.row.nguoiDung);
            setBi(Number(params.row.noiDung[0].loaiBi));
            setLoaiCuoc(params.row.noiDung[0].chiTietCuoc[0].loaiCuoc);
            setTienCuoc(params.row.noiDung[0].chiTietCuoc[0].tienCuoc);
            setOpen(true);
          }}
        >
          <EditIcon />
        </Box>
      ),
    },
  ];

  const submit = async () => {
    try {
      if (dataQuery?.[0].tinhTrang === "hoanTat") {
        toast.error("Phiên đã hoàn tất, không thể thay đổi");
        return;
      }
      if (!tienCuoc) {
        toast.error("Cần nhập số tiền cược");
        return;
      }
      console.log(data);
      if (
        data.some(
          (item) =>
            item.noiDung[0].chiTietCuoc[0].loaiCuoc === loaiCuoc &&
            Number(item.noiDung[0].loaiBi) === bi &&
            item.user === user
        )
      ) {
        toast.error("Sửa bị trùng bi và cửa");
        return;
      }

      await GameService.thayDoiCuoc({ typeGame: TYPE_GAME, data: { id, loaiBi: bi, loaiCuoc, tienCuoc } });
      refetch();
      toast.success("Thay đổi thành công");
      setOpen(false);
    } catch (error) {
      console.error("Error occurred while submitting:", error);
      toast.error("An error occurred while submitting. Please try again later.");
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Chỉnh sửa</DialogTitle>
        <DialogContent>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ fontSize: 14, width: "70px" }}>Bi</div>
            <select value={bi} onChange={(e) => setBi(e.target.value)} style={{ width: "50px", height: "30px" }}>
              {Bi.map((item) => (
                <option value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "10px 0px" }}>
            <div style={{ fontSize: 14, width: "70px" }}>Loại cược</div>
            <select
              value={loaiCuoc}
              onChange={(e) => setLoaiCuoc(e.target.value)}
              style={{ width: "100px", height: "30px" }}
            >
              {LoaiCuoc.map((item) => (
                <option value={item.value}>{item.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ fontSize: 14, width: "70px" }}>Số tiền</div>

            <input
              type="number"
              value={tienCuoc}
              onChange={(e) => setTienCuoc(e.target.value)}
              style={{ color: "#000", width: "100px", height: "30px", borderRadius: "3px" }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Quay lại</Button>
          <Button onClick={submit}>Thay đổi</Button>
        </DialogActions>
      </Dialog>
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
        <h1
          className="title admin"
          style={{
            justifyContent: "center",
            fontSize: "2.5rem",
          }}
        >
          Lịch sử cược
        </h1>
        {isLoading && <CircularProgress color="inherit" />}

        {!isLoading && (
          <>
            <DataGrid
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
          </>
        )}
      </Box>
    </>
  );
};
export default LichSuCuoc;
