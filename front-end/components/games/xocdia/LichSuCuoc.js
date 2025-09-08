import { USER_BET_GAME_HISTORY_PAGE_SIZE, convertChiTietCuoc } from "@/configs/game.xocdia.config";
import SocketContext from "@/context/socket";
import useGetUserBetHistory from "@/hooks/useGetUserBetHistory";
import { convertJSXMoney } from "@/utils/convertMoney";
import { convertDateTime } from "@/utils/convertTime";
import {
  convertMaMauTinhTrangKetQuaBetGameXocDia,
  convertTinhTrangKetQuaBetGameXocDia,
} from "@/utils/convertTinhTrang";
import { Box, Button, Typography, useTheme } from "@mui/material";
import { useContext, useEffect } from "react";
import { Bars } from "react-loading-icons";
import { useTranslation } from 'react-i18next';

const LichSuCuoc = ({ TYPE_GAME }) => {
  const { t } = useTranslation('common');
  const { socket } = useContext(SocketContext);
  const {
    data: listLichSuGame,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useGetUserBetHistory({ typeGame: TYPE_GAME, pageSize: USER_BET_GAME_HISTORY_PAGE_SIZE });
  const listLichSu = listLichSuGame ?? [];

  useEffect(() => {
    if (socket) {
      socket.emit(`${TYPE_GAME}:join-room`);
      socket.on(`${TYPE_GAME}:update-lich-su-cuoc-ca-nhan`, (data) => {
        refetch();
      });
      return () => {
        socket.off(`${TYPE_GAME}:update-lich-su-cuoc-ca-nhan`);
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
          <Bars fill="#c1e4ff" width={50} height={50} speed={0.75} />
        </Box>
      )}
      {!isLoading && listLichSu && (
        <Box
          className="xocdia"
          sx={{
            borderRadius: "2rem",
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
                <thead style={{ textAlign: "center", color: theme.palette.text.primary }} className="xocdia">
                  <tr>
                    <td>{t('Round')}</td>
                    <td>{t('Content')}</td>
                    <td>{t('Time')}</td>
                  </tr>
                </thead>
                <tbody>
                  {listLichSu.map((item, i) => (
                    <tr key={item.phien.phien}>
                      <td>{item.phien.phien}</td>
                      <td
                        style={{
                          display: "flex",
                          justifyContent: "center",

                          flexDirection: "column",
                        }}
                      >
                        {item.datCuoc.map((item, i) => (
                          <Typography
                            component={"div"}
                            key={i}
                            sx={{
                              fontSize: "1.2rem",
                            }}
                          >
                            {t(convertChiTietCuoc(item.chiTietCuoc))} - {convertJSXMoney(item.tienCuoc)} -{" "}
                            <Typography
                              sx={{
                                color: convertMaMauTinhTrangKetQuaBetGameXocDia(item.trangThai),
                              }}
                            >
                              {t(convertTinhTrangKetQuaBetGameXocDia(item.trangThai))}
                            </Typography>
                          </Typography>
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
              <Bars fill="#c1e4ff" width={50} height={50} speed={0.75} />
            </Box>
          )}
          {hasNextPage && (
            <Button
              onClick={fetchNextPage}
              sx={{
                pointerEvents: isFetchingNextPage ? "none" : "",
                opacity: isFetchingNextPage ? "0.8" : 1,
                background: "linear-gradient(180deg, #3fabff, #0f568d)",
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
export default LichSuCuoc;
