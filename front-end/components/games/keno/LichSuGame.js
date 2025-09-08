import SocketContext from "@/context/socket";
import { convertDateTime } from "@/utils/convertTime";
import { Box, Button, useTheme } from "@mui/material";
import { useContext, useEffect } from "react";

import { GAME_HISTORY_PAGE_SIZE } from "@/configs/game.keno.config";
import useGetGameHistory from "@/hooks/useGetGameHistory";
import { Bars } from "react-loading-icons";
import { useTranslation } from 'react-i18next';

const LichSuGame = ({ TYPE_GAME }) => {
  const { t } = useTranslation('common');
  const { socket } = useContext(SocketContext);

  const {
    data: listLichSuGame,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useGetGameHistory({ typeGame: TYPE_GAME, pageSize: GAME_HISTORY_PAGE_SIZE });

  const listLichSu = listLichSuGame ?? [];

  useEffect(() => {
    if (socket) {
      socket.emit(`${TYPE_GAME}:join-room`);
      socket.on(`${TYPE_GAME}:ketQuaPhienHienTai`, (data) => {
        refetch();
      });
      return () => {
        socket.off(`${TYPE_GAME}:ketQuaPhienHienTai`);
      };
    }
  }, [socket]);
  const theme = useTheme();
  return (
    <>
      {isLoading && (
        <Box
          sx={{
            textAlign: "center",
          }}
        >
          <Bars fill={theme.palette.color.primary} width={50} height={50} speed={0.75} />
        </Box>
      )}
      {!isLoading && listLichSu && (
        <Box
          sx={{
            padding: { xs: "1rem", md: "2rem" },
            marginTop: "1rem",

            position: "relative",
            display: "flex",
            flexDirection: "column",
            color: (theme) => theme.palette.text.secondary,
          }}
        >
          <div className="tab-content">
            <div className="award_tb">
              <table>
                <thead style={{ textAlign: "center" }}>
                  <tr>
                    <td>{t('Round')}</td>
                    <td>{t('Result')}</td>
                    <td>{t('Time')}</td>
                  </tr>
                </thead>
                <tbody>
                  {listLichSu.map((item, i) => (
                    <tr key={item.phien}>
                      <td>{item.phien}</td>
                      <td style={{ display: "flex", justifyContent: "center" }}>
                        {item.ketQua.map((item, i) => (
                          <div className="redball" key={i}>
                            {item}
                          </div>
                        ))}
                      </td>
                      <td>{convertDateTime(item.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {isFetchingNextPage && (
            <Box
              sx={{
                textAlign: "center",
              }}
            >
              <Bars fill={theme.palette.color.primary} width={50} height={50} speed={0.75} />
            </Box>
          )}
          {hasNextPage && (
            <Button
              onClick={fetchNextPage}
              sx={{
                pointerEvents: isFetchingNextPage ? "none" : "",
                opacity: isFetchingNextPage ? "0.8" : 1,
              }}
            >
              {isFetchingNextPage ? t("Đang tải...") : t("Load more")}
            </Button>
          )}
        </Box>
      )}
    </>
  );
};
export default LichSuGame;
