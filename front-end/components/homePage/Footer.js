import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import AddBusinessOutlinedIcon from "@mui/icons-material/AddBusinessOutlined";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import RedeemIcon from "@mui/icons-material/Redeem";
import RedeemOutlinedIcon from "@mui/icons-material/RedeemOutlined";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import SystemService from "@/services/SystemService";

const FooterContainer = styled(Box)(({ theme }) => ({
  background: "#132235",
  // maxWidth: "540px",
  position: "fixed",
  bottom: 0,
  left: "50%",
  transform: "translateX(-50%)",
  width: "100%",
  height: "7.8rem",
  zIndex: theme.zIndex.drawer + 1,
  gap: "10px",
  display: "flex",
}));

const FooterItem = styled(Box)(({ theme }) => ({
  cursor: "pointer",
  alignItems: "center",
  color: "#949494",
  display: "flex",
  flex: "1 1",
  flexDirection: "column",
  gap: "0.11707rem",
  justifyContent: "center",

  "&:hover": {},
}));

const FooterContactItem = styled("a")(({ theme }) => ({
  cursor: "pointer",
  alignItems: "center",
  color: "#949494",
  display: "flex",
  flex: "1 1",
  flexDirection: "column",
  gap: "0.11707rem",
  justifyContent: "center",

  "&:hover": {},
}));

const handleConvertPath = (pathname) => {
  if (pathname === "/") {
    return "home";
  } else if (pathname.startsWith("/notifications")) {
    return "notifications";
  } else if (pathname.startsWith("/withdraw")) {
    return "withdraw";
  } else if (pathname.startsWith("/profile")) {
    return "profile";
  } else if (pathname.startsWith("/contact")) {
    return "contact";
  }
  return "";
};
const Footer = () => {
  const { t } = useTranslation("common");
  const router = useRouter();
  const value = handleConvertPath(router.pathname);
  const [cskhLink, setCskhLink] = useState("");

  const getCSKHLink = async () => {
    const data = await SystemService.getCSKHLink();
    setCskhLink(data || "#");
  };

  useEffect(() => {
    getCSKHLink();
  }, []);

  const listItem = [
    {
      key: "notifications",
      icon: <RedeemOutlinedIcon />,
      activeIcon: <RedeemIcon />,
      url: "/notifications",
      title: t("Promotion"),
    },
    {
      key: "withdraw",
      icon: <AddBusinessOutlinedIcon />,
      activeIcon: <AddBusinessIcon />,
      url: "/withdraw",
      title: t("Withdraw"),
    },
    {
      key: "home",
      icon: <HomeOutlinedIcon />,
      activeIcon: <HomeOutlinedIcon />,
      url: "/",
      title: t("Home"),
    },
    {
      key: "profile",
      icon: <AccountCircleOutlinedIcon />,
      activeIcon: <AccountCircleIcon />,
      url: "/profile",
      title: t("Profile"),
    },
    {
      key: "contact",
      icon: <HeadsetMicOutlinedIcon />,
      activeIcon: <HeadsetMicIcon />,
      url: "/contact",
      title: t("Support"),
    },
  ];

  return (
    <>
      <FooterContainer className="footer">
        {listItem.map((item, i) => {
          if (item.key === "contact") {
            return (
              <FooterContactItem
                className={"footer-item"}
                target="_blank"
                rel="noopener noreferrer"
                href={cskhLink}
                key={item.key}
              >
                {item.key === value && <Box className="icon_footer active">{item.activeIcon}</Box>}
                {item.key !== value && <Box className="icon_footer">{item.icon}</Box>}
                <Box
                  className="title_footer"
                  sx={{
                    fontSize: "1.5rem",
                  }}
                >
                  {item.title}
                </Box>
              </FooterContactItem>
            );
          }

          if (item.key !== "home") {
            return (
              <Link href={item.url} key={item.key}>
                <FooterItem className={"footer-item"}>
                  {item.key === value && <Box className="icon_footer active">{item.activeIcon}</Box>}
                  {item.key !== value && <Box className="icon_footer">{item.icon}</Box>}
                  <Box
                    className="title_footer"
                    sx={{
                      fontSize: "1.5rem",
                    }}
                  >
                    {item.title}
                  </Box>
                </FooterItem>
              </Link>
            );
          } else {
            return (
              <Link href={item.url} key={item.key}>
                <FooterItem className={"footer-item"}>
                  {item.key === value && <Box className="icon_footer active">{item.activeIcon}</Box>}
                  {item.key !== value && <Box className="icon_footer">{item.icon}</Box>}

                  <div className="footer-center-bg"></div>
                  <Box
                    className="title_footer"
                    sx={{
                      fontSize: "1.5rem",
                      marginTop: "2rem",
                    }}
                  >
                    {item.title}
                  </Box>
                </FooterItem>
              </Link>
            );
          }
        })}
      </FooterContainer>
    </>
  );
};
export default Footer;
