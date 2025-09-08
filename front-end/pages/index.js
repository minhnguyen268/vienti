import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import Link from "next/link";
import Layout from "../components/Layout";
import HomeNotification from "../components/homePage/HomeNotification";
// Import Swiper styles
import HomeSlide from "@/components/homePage/HomeSlide";
import Banner1 from "@/public/assets/images/banner1.jpg";
import Banner2 from "@/public/assets/images/banner2.jpg";
import Keno1P from "@/public/assets/images-new/keno-1.png";
import Keno3P from "@/public/assets/images-new/keno-3.png";
import Keno5P from "@/public/assets/images-new/keno-5.png";
import XocDia1P from "@/public/assets/images-new/dish-1.png";
import XoSo3P from "@/public/assets/images-new/xoso3p.png";
import XoSo5P from "@/public/assets/images-new/xoso5p.png";
import XucXac1P from "@/public/assets/images-new/dice-1m.png";
import XucXac3P from "@/public/assets/images-new/dice-3m.png";
import Image from "next/image";
import "swiper/css";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import SettingService from "@/services/admin/SettingService";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import RutTien from "@/public/assets/images-new/rut.png";
import NapTien from "@/public/assets/images-new/nap.png";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useSelector } from "react-redux";
import useGetInformationUser from "@/hooks/useGetInformationUser";
import { convertJSXMoney } from "@/utils/convertMoney";
import { useSession } from "next-auth/react";
import BotGames from "@/components/homePage/BotGames";

const LIST_SWIPER = [
  {
    desc: "Megalott",
    img: Banner1,
  },
  {
    desc: "Megalott",
    img: Banner2,
  },
];

const GameItem = styled(Box)(({ theme }) => ({
  marginTop: "10px",
  background: "linear-gradient(124.32deg,#102d47 12.08%,#12304d 85.02%)",
  borderRadius: "10px",
  padding: "10px",
  display: "flex",
  justifyContent: "space-between",
  cursor: "pointer",
  "& .desc": {
    display: "flex",
    flexDirection: "column",

    "& .title-game": {
      color: theme.palette.text.primary,
      fontSize: "2rem",
      fontWeight: "bold",
      textTransform: "uppercase",
    },
    "& .desc-game": {
      color: theme.palette.text.primary,
      fontSize: "1.5rem",
    },
    "& .maintain": {
      color: "red",
      fontSize: "1.5rem",
    },
  },
  "& img": {
    height: "100%",
    width: "100%",
    maxWidth: "100px",
  },
}));

const UserInfo = () => {
  const { t } = useTranslation("common");
  const { data, isLoading } = useGetInformationUser();
  const { balance } = useSelector((state) => state.balance);

  if (isLoading || !data) {
    return null;
  }

  return (
    <GameItem style={{ cursor: "default" }}>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "16px",
          alignItems: "center",
          color: "rgb(171 171 171)",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "5px" }}>
          <div>
            {t("Chào mừng bạn")}, {data?.taiKhoan}!
          </div>
          <div>
            ID: {data?.publicId}
            <ContentCopyIcon
              sx={{
                fontSize: "1.5rem",
                marginLeft: "1.2rem",
                cursor: "pointer",
              }}
              onClick={() => {
                navigator.clipboard.writeText(data?.publicId);
                toast.success(t("Copied to clipboard"));
              }}
            />
          </div>
          <div style={{ color: "white", fontSize: "18px" }}>$ {convertJSXMoney(balance)}</div>
        </div>
        <div style={{ display: "flex", gap: "30px", cursor: "pointer" }}>
          <Link href="/deposit">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
              <Image src={NapTien} alt="nap" width={36} height={24} />
              {t("Deposit")}
            </div>
          </Link>
          <Link href="/withdraw">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", alignItems: "center" }}>
              <Image src={RutTien} alt="rut" width={36} height={24} />
              {t("Withdraw")}
            </div>
          </Link>
        </div>
      </div>
    </GameItem>
  );
};

const Home = () => {
  const { t } = useTranslation("common");
  const [games, setGames] = useState([]);
  const router = useRouter();

  const getData = async () => {
    const res = await SettingService.getClient();
    setGames(res.data.data?.games ?? []);
  };

  useEffect(() => {
    getData();
  }, []);

  const LIST_GAME = [
    {
      title: t("LOTTERY 3M"),
      desc: t("Mo ta xo so 3p"),
      img: XoSo3P,
      link: "/games/xoso3p",
      active: games["xoso3P"] !== "inactive",
    },
    {
      title: t("LOTTERY 5M"),
      desc: t("Mo ta xo so 5p"),
      img: XoSo5P,
      link: "/games/xoso5p",
      active: games["xoso5P"] !== "inactive",
    },
    {
      title: t("KENO 1M"),
      desc: t("Mo ta keno 1p"),
      img: Keno1P,
      link: "/games/keno1p",
      active: games["keno1P"] !== "inactive",
    },
    {
      title: t("KENO 3M"),
      desc: t("Mo ta keno 3p"),
      img: Keno3P,
      link: "/games/keno3p",
      active: games["keno3P"] !== "inactive",
    },
    {
      title: t("KENO 5M"),
      desc: t("Mo ta keno 5p"),
      img: Keno5P,
      link: "/games/keno5p",
      active: games["keno5P"] !== "inactive",
    },
    {
      title: t("DICE 1M"),
      desc: t("Mo ta dice 1p"),
      img: XucXac1P,
      link: "/games/xucxac1p",
      active: games["xucxac1P"] !== "inactive",
    },

    {
      title: t("DICE 3M"),
      desc: t("Mo ta dice 3p"),
      img: XucXac3P,
      link: "/games/xucxac3p",
      active: games["xucxac3P"] !== "inactive",
    },
    {
      title: t("DISH SHAKING 1M"),
      desc: t("Mo ta xuc sac 1p"),
      img: XocDia1P,
      link: "/games/xocdia1p",
      active: games["xocdia1P"] !== "inactive",
    },
  ];

  const { status } = useSession();

  return (
    <>
      <Layout>
        <HomeSlide />

        <Box sx={{}}>
          <HomeNotification />
          {status === "authenticated" && <UserInfo />}
          <h2 className="title">Games</h2>
          <div className="game-grid">
            {LIST_GAME.map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  if (!item.active) {
                    toast.info(t("Game đang bảo trì"));
                    return;
                  }
                  router.push(item.link);
                }}
              >
                <GameItem className="game-item">
                  <Box className="desc">
                    <Typography className="title-game">{item.title}</Typography>
                    <Typography className="desc-game">{item.desc}</Typography>
                  </Box>
                  <div
                    style={{
                      position: "relative",
                      maxWidth: "10rem",
                      minHeight: "9rem",
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Image
                      src={item.img}
                      alt={item.title}
                      fill={true}
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  </div>
                </GameItem>
              </div>
            ))}
          </div>
        </Box>

        {status === "authenticated" && <BotGames />}
      </Layout>
    </>
  );
};

export default Home;
