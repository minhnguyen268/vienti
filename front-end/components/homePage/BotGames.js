import api from "@/configs/axios";
import { useState, useEffect, useContext } from "react";
import SocketContext from "@/context/socket";
import { useTranslation } from "react-i18next";

const GameMapping = {
  keno1p: "Keno1P",
  keno3p: "Keno3P",
  keno5p: "Keno5P",
  xucxac1p: "Xúc Xắc 1P",
  xucxac3p: "Xúc Xắc 3P",
  xocdia1p: "Xóc Đĩa 1P",
  xoso3p: "Xổ Số 3P",
  xoso5p: "Xổ số 5P",
};

const BotGames = () => {
  const { t } = useTranslation("common");
  const [botGames, setBotGames] = useState([]);
  const { socket } = useContext(SocketContext);

  const fetchGames = async () => {
    const games = await api.get("/v1/hethong/latest-games");
    setBotGames(games.data.data || []);
  };

  useEffect(() => {
    fetchGames();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("bot-play-game", (data) => {
        setBotGames((prevGames) => [data, ...prevGames].slice(0, 20));
      });
    }
  }, [socket]);

  return (
    <div
      className="game-item"
      style={{
        background: "linear-gradient(124.32deg,#102d47 12.08%,#12304d 85.02%)",
        borderRadius: "10px",
        marginTop: "10px",
        paddingTop: "0px",
        paddingBottom: "4px",
        maxHeight: "250px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ overflow: "auto", flex: 1, width: "100%" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "transparent",
            borderRadius: "8px",
          }}
        >
          <thead
            style={{
              background: "transparent",
              position: "sticky",
              top: 0,
              zIndex: 1,
              background: "linear-gradient(124.32deg,#102d47 12.08%,#12304d 85.02%)",
            }}
          >
            <tr style={{ background: "transparent", borderColor: "rgb(52 87 117)" }}>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  background: "transparent",
                  color: "#fff",
                }}
              >
                {t("Trò chơi")}
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  background: "transparent",
                  color: "#fff",
                }}
              >
                {t("Account")}
              </th>
              <th
                style={{
                  padding: "12px",
                  textAlign: "left",
                  background: "transparent",
                  color: "#fff",
                }}
              >
                {t("Số tiền")}
              </th>
            </tr>
          </thead>
          <tbody style={{ maxHeight: "200px", overflowY: "auto" }}>
            {botGames.map((item) => (
              <tr
                key={item._id}
                style={{
                  background: "transparent",
                  border: "none",
                }}
              >
                <td style={{ padding: "10px", background: "transparent", fontSize: "14px" }}>
                  {t(GameMapping[item.game] || item.game)}
                </td>
                <td style={{ padding: "10px", background: "transparent", fontSize: "14px" }}>{item.taiKhoan}</td>
                <td style={{ padding: "10px", background: "transparent", textAlign: "left", fontSize: "14px" }}>
                  {item.soTien}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default BotGames;
