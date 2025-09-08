import SocketContext from "@/context/socket";
import { Box, CircularProgress, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useContext, useEffect, useState } from "react";
import { NumericFormat } from "react-number-format";

import { convertChiTietCuoc } from "@/configs/game.xocdia.config";
import useGetDetailedBetGameHistory from "@/hooks/admin/useGetDetailedBetGameHistory";
import { convertJSXMoney } from "@/utils/convertMoney";
import { convertDateTime } from "@/utils/convertTime";
import { convertMaMauTinhTrangGameXocDia, convertTinhTrangKetQuaBetGameXocDia } from "@/utils/convertTinhTrang";
import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import EditIcon from "@mui/icons-material/Edit";
import GameService from "@/services/admin/GameService";
import { toast } from "react-toastify";
import { set } from "lodash";

export const LOAI_CUOC_GAME = {
  CHAN_LE: "chan_le",
  TUY_CHON: "tuy_chon",
};
export const CHI_TIET_CUOC_GAME = [
  {
    name: "Chẵn",
    value: "chan",
  },
  {
    name: "Lẻ",
    value: "le",
  },
  {
    name: "4 Trắng",
    value: "full_trang",
  },
  {
    name: "4 Đỏ",
    value: "full_do",
  },
  {
    name: "2 Trắng 2 Đỏ",
    value: "hai_trang_hai_do",
  },
  {
    name: "3 Trắng 1 Đỏ",
    value: "ba_trang_mot_do",
  },
  {
    name: "3 Đỏ 1 Trắng",
    value: "ba_do_mot_trang",
  },
];

const transformDataGrid = (dataQuery) => {
  const newData =
    dataQuery?.map((item, i) => ({
      id: item._id,
      nguoiDung: item.nguoiDung.taiKhoan,
      noiDung: item.datCuoc,
      tongTienCuoc: item.datCuoc.reduce((a, b) => a + b.tienCuoc, 0),

      stt: i + 1,

      ketQua: item.ketQua,
      tinhTrang: item.tinhTrang,

      createdAt: convertDateTime(item.createdAt),
    })) ?? [];
  return newData;
};
const LichSuCuoc = ({ ID, TYPE_GAME = "keno1p" }) => {
  const { socket } = useContext(SocketContext);
  const {
    data: dataQuery,
    isLoading,
    refetch,
  } = useGetDetailedBetGameHistory({
    typeGame: TYPE_GAME,
    id: ID,
  });
  const [data, setData] = useState(transformDataGrid(dataQuery));

  const [id, setId] = React.useState();
  const [datCuoc, setDatCuoc] = React.useState();
  const [open, setOpen] = React.useState(false);

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
          {params.row.noiDung.map((item, i) => (
            <Typography
              key={i}
              sx={{
                fontSize: "1.2rem",
              }}
            >
              {convertChiTietCuoc(item.chiTietCuoc)} - {convertJSXMoney(item.tienCuoc)} -
              <span
                style={{
                  color: convertMaMauTinhTrangGameXocDia(item.trangThai),
                }}
              >
                {convertTinhTrangKetQuaBetGameXocDia(item.trangThai)}
              </span>
            </Typography>
          ))}
        </Box>
      ),
    },
    {
      field: "tongTienCuoc",
      headerName: "Tổng tiền cược",
      width: 200,
      renderCell: (params) => (
        <NumericFormat value={params.value} displayType="text" allowLeadingZeros thousandSeparator="," suffix="đ" />
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
            setDatCuoc(params.row.noiDung);
            console.log(datCuoc);
            setOpen(true);
            setId(params.row.id);
          }}
        >
          <EditIcon />
        </Box>
      ),
    },
  ];

  const handleClose = () => {
    setOpen(false);
  };

  const submit = async () => {
    try {
      if (dataQuery?.[0].tinhTrang === "hoanTat") {
        toast.error("Phiên đã hoàn tất, không thể thay đổi");
        return;
      }

      await GameService.thayDoiCuoc({ typeGame: TYPE_GAME, data: { datCuoc, id } });
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
          <div
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", margin: "10px 0px" }}
          >
            {datCuoc &&
              datCuoc.map((item, i) => (
                <div style={{ display: "flex", alignItems: "center", margin: "10px 0px" }}>
                  <div style={{ fontSize: 14, width: "100px" }}>Loại cược {i + 1}</div>
                  <select
                    value={item.chiTietCuoc}
                    style={{ width: "100px", height: "30px" }}
                    onChange={(e) => {
                      const newDatCuoc = [...datCuoc];
                      newDatCuoc[i].chiTietCuoc = e.target.value;
                      newDatCuoc[i].loaiCuoc =
                        e.target.value === "chan" || e.target.value === "le"
                          ? LOAI_CUOC_GAME.CHAN_LE
                          : LOAI_CUOC_GAME.TUY_CHON;
                      setDatCuoc(newDatCuoc);
                    }}
                  >
                    {CHI_TIET_CUOC_GAME.map((c) => (
                      <option value={c.value}>{c.name}</option>
                    ))}
                  </select>
                </div>
              ))}
          </div>

          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ fontSize: 14, width: "100px" }}>Số tiền</div>

            <input
              type="number"
              value={datCuoc?.[0].tienCuoc}
              onChange={(e) => {
                const newDatCuoc = datCuoc.map((dc) => ({ ...dc, tienCuoc: e.target.value }));
                setDatCuoc(newDatCuoc);
              }}
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
        <h2
          className="title admin"
          style={{
            justifyContent: "center",
            fontSize: "2.5rem",
          }}
        >
          Lịch sử cược
        </h2>
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
