import { Box, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import Money from "../user/Money";
import { useTranslation } from "react-i18next";

const ThongTinSoDu = () => {
  const { t } = useTranslation("common");
  const { data: session, status } = useSession();

  return (
    <>
      <Box
        sx={{
          background: "url(https://i.imgur.com/gh5l9sN.png) no-repeat 50%",
          backgroundSize: "100% 100%",
          padding: "10px",
          minHeight: "200px",
          alignItems: "center",
          gap: "10px",
          color: (theme) => theme.palette.text.primary,
        }}
      >
        <Box
          className="withdraw-box-info"
          sx={{
            display: "flex",
            flexDirection: "column",
            margin: "20px",
          }}
        >
          <Typography
            sx={{
              fontSize: "1.8rem",
            }}
          >
            {t("Current balance")}
          </Typography>
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "2.5rem",
            }}
          >
            <Money />
          </Typography>
        </Box>
        <Box
          className="withdraw-box-info"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: "10px",
            margin: "20px",
            alignItems: "center",
          }}
        >
          <img src="https://i.imgur.com/LKRkPTe.png" />
          <Typography
            sx={{
              fontSize: "2.5rem",
            }}
          >
            {session?.user?.taiKhoan}
          </Typography>
        </Box>
      </Box>
    </>
  );
};
export default ThongTinSoDu;
