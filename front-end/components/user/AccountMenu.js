import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import CreditScoreOutlinedIcon from "@mui/icons-material/CreditScoreOutlined";
import LocalAtmOutlinedIcon from "@mui/icons-material/LocalAtmOutlined";
import LockPersonOutlinedIcon from "@mui/icons-material/LockPersonOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import PhoneIcon from "@mui/icons-material/Phone";
import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const AccountMenuItem = styled(Box)(({ theme }) => ({
  cursor: "pointer",
  display: "flex",
  gap: "1rem",
  padding: "1rem",
  borderBottom: "1px solid #ccc",
  color: "text.primary",
  "& svg": {
    color: theme.palette.color.primary,
  },
  "& .title-menu": {
    fontSize: "1.7rem",
  },
}));

const AccountMenu = () => {
  const { data: session, status } = useSession();
  const { t } = useTranslation("common");

  const listMenu = [
    {
      icon: <LocalAtmOutlinedIcon />,
      title: t("Balance fluctuations"),
      url: "/balance-fluctuations",
    },

    {
      icon: <CreditScoreOutlinedIcon />,
      title: t("Deposit history"),
      url: "/deposit-history",
    },
    {
      icon: <PaymentsOutlinedIcon />,
      title: t("Withdrawal history"),
      url: "/withdraw-history",
    },
    {
      icon: <AccountBalanceOutlinedIcon />,
      title: t("Linked bank account"),
      url: "/list-bank",
    },
    {
      icon: <LockPersonOutlinedIcon />,
      title: t("Change password"),
      url: "/password",
    },
    {
      icon: <PhoneIcon />,
      title: t("Change phone number"),
      url: "/phone",
    },
    {
      icon: <LogoutOutlinedIcon />,
      title: t("Logout"),
      url: "/sign-out",
    },
  ];

  return (
    <>
      <Box
        sx={{
          padding: "1rem",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {session && session.user && (session.user.role === "admin" || session.user.role === "manager") && (
          <Link href={"/admin"}>
            <AccountMenuItem>
              <ManageAccountsIcon />
              <Typography className="title-menu">{t("Management")}</Typography>
            </AccountMenuItem>
          </Link>
        )}
        {listMenu.map((item, i) => (
          <Link key={i} href={item.url}>
            <AccountMenuItem>
              {item.icon}
              <Typography className="title-menu">{item.title}</Typography>
            </AccountMenuItem>
          </Link>
        ))}
      </Box>
    </>
  );
};
export default AccountMenu;
