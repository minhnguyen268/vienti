import api from "@/configs/axios";
import { useState, useEffect, useContext } from "react";
import SocketContext from "@/context/socket";
import { useTranslation } from "react-i18next";
import { convertJSXMoney } from "@/utils/convertMoney";

const GameMapping = {
  keno1p: "LOTTERY 3M",
  keno3p: "LOTTERY 5M",
  keno5p: "KENO 1M",
  xucxac1p: "KENO 3M",
  xucxac3p: "KENO 5M",
  xocdia1p: "DICE 1M",
  xoso3p: "DICE 3M",
  xoso5p: "DISH SHAKING 1M",
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
        marginTop: "20px",
        paddingTop: "0px",
        paddingBottom: "4px",
        maxHeight: "250px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ overflow: "auto", flex: 1, width: "100%" }}>
        <div
          style={{
            padding: "16px",
            fontSize: "18px",
            fontWeight: "bold",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            color: "#fff",
            textAlign: "center",
            position: "sticky",
            top: 0,
            zIndex: 1,
            background: "linear-gradient(124.32deg,#102d47 12.08%,#12304d 85.02%)",
          }}
        >
          {t("Đặt cược gần đây")}
        </div>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            background: "transparent",
            borderRadius: "8px",
          }}
        >
          {/* <thead
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
          </thead> */}
          <tbody style={{ maxHeight: "200px", overflowY: "auto" }}>
            {botGames.map((item, i) => (
              <tr
                key={item._id}
                style={{
                  background: i % 2 === 0 ? "rgba(255, 255, 255, 0.05)" : "transparent",
                  border: "none",
                }}
              >
                <td style={{ padding: "10px", fontSize: "14px" }}>{t(GameMapping[item.game] || item.game)}</td>
                <td style={{ padding: "10px", fontSize: "14px" }}>{item.taiKhoan}***</td>
                <td style={{ padding: "10px", fontSize: "14px" }}>{convertJSXMoney(item.soTien)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default BotGames;
