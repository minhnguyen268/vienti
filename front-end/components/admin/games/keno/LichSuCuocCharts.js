import SocketContext from "@/context/socket";
import { Box, CircularProgress } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Tooltip, XAxis, YAxis } from "recharts";

import { LOAI_CUOC_GAME } from "@/configs/game.keno.config";
import useGetDetailedBetGameHistory from "@/hooks/admin/useGetDetailedBetGameHistory";

const transformDataChart = (dataQuery) => {
  const tempDataChart = [];
  const Cuoc1C = { name: "1C", value: 0 };
  const Cuoc1L = { name: "1L", value: 0 };
  const Cuoc1T = { name: "1LO", value: 0 };
  const Cuoc1X = { name: "1NH", value: 0 };

  const Cuoc2C = { name: "2C", value: 0 };
  const Cuoc2L = { name: "2L", value: 0 };
  const Cuoc2T = { name: "2LO", value: 0 };
  const Cuoc2X = { name: "2NH", value: 0 };

  const Cuoc3C = { name: "3C", value: 0 };
  const Cuoc3L = { name: "3L", value: 0 };
  const Cuoc3T = { name: "3LO", value: 0 };
  const Cuoc3X = { name: "3NH", value: 0 };

  const Cuoc4C = { name: "4C", value: 0 };
  const Cuoc4L = { name: "4L", value: 0 };
  const Cuoc4T = { name: "4LO", value: 0 };
  const Cuoc4X = { name: "4NH", value: 0 };

  const Cuoc5C = { name: "5C", value: 0 };
  const Cuoc5L = { name: "5L", value: 0 };
  const Cuoc5T = { name: "5LO", value: 0 };
  const Cuoc5X = { name: "5NH", value: 0 };

  dataQuery?.map((item) => {
    item.datCuoc.map((itemCuoc) => {
      const { loaiBi } = itemCuoc;
      const { loaiCuoc, tienCuoc } = itemCuoc.chiTietCuoc[0];

      if (loaiBi === "1" && loaiCuoc === LOAI_CUOC_GAME.CHAN) {
        Cuoc1C.value += tienCuoc;
      } else if (loaiBi === "1" && loaiCuoc === LOAI_CUOC_GAME.LE) {
        Cuoc1L.value += tienCuoc;
      } else if (loaiBi === "1" && loaiCuoc === LOAI_CUOC_GAME.LON) {
        Cuoc1T.value += tienCuoc;
      } else if (loaiBi === "1" && loaiCuoc === LOAI_CUOC_GAME.NHO) {
        Cuoc1X.value += tienCuoc;
      } else if (loaiBi === "2" && loaiCuoc === LOAI_CUOC_GAME.CHAN) {
        Cuoc2C.value += tienCuoc;
      } else if (loaiBi === "2" && loaiCuoc === LOAI_CUOC_GAME.LE) {
        Cuoc2L.value += tienCuoc;
      } else if (loaiBi === "2" && loaiCuoc === LOAI_CUOC_GAME.LON) {
        Cuoc2T.value += tienCuoc;
      } else if (loaiBi === "2" && loaiCuoc === LOAI_CUOC_GAME.NHO) {
        Cuoc2X.value += tienCuoc;
      } else if (loaiBi === "3" && loaiCuoc === LOAI_CUOC_GAME.CHAN) {
        Cuoc3C.value += tienCuoc;
      } else if (loaiBi === "3" && loaiCuoc === LOAI_CUOC_GAME.LE) {
        Cuoc3L.value += tienCuoc;
      } else if (loaiBi === "3" && loaiCuoc === LOAI_CUOC_GAME.LON) {
        Cuoc3T.value += tienCuoc;
      } else if (loaiBi === "3" && loaiCuoc === LOAI_CUOC_GAME.NHO) {
        Cuoc3X.value += tienCuoc;
      } else if (loaiBi === "4" && loaiCuoc === LOAI_CUOC_GAME.CHAN) {
        Cuoc4C.value += tienCuoc;
      } else if (loaiBi === "4" && loaiCuoc === LOAI_CUOC_GAME.LE) {
        Cuoc4L.value += tienCuoc;
      } else if (loaiBi === "4" && loaiCuoc === LOAI_CUOC_GAME.LON) {
        Cuoc4T.value += tienCuoc;
      } else if (loaiBi === "4" && loaiCuoc === LOAI_CUOC_GAME.NHO) {
        Cuoc4X.value += tienCuoc;
      } else if (loaiBi === "5" && loaiCuoc === LOAI_CUOC_GAME.CHAN) {
        Cuoc5C.value += tienCuoc;
      } else if (loaiBi === "5" && loaiCuoc === LOAI_CUOC_GAME.LE) {
        Cuoc5L.value += tienCuoc;
      } else if (loaiBi === "5" && loaiCuoc === LOAI_CUOC_GAME.LON) {
        Cuoc5T.value += tienCuoc;
      } else if (loaiBi === "5" && loaiCuoc === LOAI_CUOC_GAME.NHO) {
        Cuoc5X.value += tienCuoc;
      }
    });
  });
  tempDataChart.push(
    Cuoc1C,
    Cuoc1L,
    Cuoc1T,
    Cuoc1X,

    Cuoc2C,
    Cuoc2L,
    Cuoc2T,
    Cuoc2X,

    Cuoc3C,
    Cuoc3L,
    Cuoc3T,
    Cuoc3X,

    Cuoc4C,
    Cuoc4L,
    Cuoc4T,
    Cuoc4X,

    Cuoc5C,
    Cuoc5L,
    Cuoc5T,
    Cuoc5X
  );

  return tempDataChart;
};
const LichSuCuocCharts = ({ ID, TYPE_GAME }) => {
  const { socket } = useContext(SocketContext);
  const {
    data: dataQuery,
    isLoading,
    refetch,
  } = useGetDetailedBetGameHistory({
    typeGame: TYPE_GAME,
    id: ID,
  });
  const [dataChart, setDataChart] = useState(transformDataChart(dataQuery));

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
      setDataChart(transformDataChart(dataQuery));
    }
  }, [dataQuery]);

  return (
    <>
      <Box
        sx={{
          textAlign: "center",
          color: "text.secondary",
          width: "100%",
        }}
      >
        <h1
          className="title admin"
          style={{
            justifyContent: "center",
            fontSize: "2.5rem",
          }}
        >
          Thống kê tiền cược
        </h1>
        {isLoading && <CircularProgress color="inherit" />}

        {!isLoading && (
          <>
            <BarChart
              style={{
                fontSize: "1.5rem",
                maxWidth: "900px",
                width: "100%",
                overflow: "auto",
                margin: "0 auto",
              }}
              width={900}
              height={500}
              data={dataChart}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
              barSize={20}
            >
              <XAxis dataKey="name" scale="point" padding={{ left: 10, right: 10 }} />
              <YAxis />
              <Tooltip />
              <Legend />
              <CartesianGrid strokeDasharray="3 3" />
              <Bar dataKey="value" fill="#8884d8" background={{ fill: "#eee" }} />
            </BarChart>
          </>
        )}
      </Box>
    </>
  );
};
export default LichSuCuocCharts;
