import { Box } from "@mui/material";
import BackToTop from "../homePage/BackToTop";
import useRegisterUserSocket from "@/hooks/useRegisterUserSocket";
import Navbar from "./Navbar";
import BellAudio from "@/public/assets/audio/ac-bel-105874.mp3";
import SocketContext from "@/context/socket";
import { useContext, useState, useEffect } from "react";
import useGetListWithdrawHistory from "@/hooks/admin/useGetListWithdrawHistory";

let isPlay = false;
const Layout = (props) => {
  const {
    data: dataQuery,
    isLoading,
    refetch,
  } = useGetListWithdrawHistory({ page: 1, pageSize: 1000, userId: undefined });

  const { socket } = useContext(SocketContext);

  useRegisterUserSocket();

  useEffect(() => {
    if (socket) {
      socket.on("update-users-list", () => {
        refetch();
      });
      return () => {
        socket.off("update-users-list");
      };
    }
  }, [socket]);

  return (
    <>
      <Navbar countChuaXem={(dataQuery?.filter((i) => i.daXem === false) || []).length} />
      <Box
        sx={{
          bgcolor: "#f8fafb",
          color: "#000000",
          paddingLeft: {
            xs: "8rem",
            md: "25rem",
          },
          position: "relative",
        }}
        className="box-container"
      >
        {(dataQuery?.filter((i) => i.daXem === false) || []).length !== 0 && (
          <audio src={BellAudio} autoPlay loop></audio>
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            flexDirection: "column",
            bgcolor: "background.default",
            justifyContent: "center",
            color: "text.primary",
            gap: "1rem",
            padding: { xs: "8rem 1rem", md: "8rem 2rem" },
          }}
        >
          {props.children}
        </Box>
      </Box>
      <BackToTop />
    </>
  );
};
export default Layout;
