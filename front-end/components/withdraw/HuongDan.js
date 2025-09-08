import { MIN_MONEY_WITHDRAW } from "@/configs/withdraw.config";
import { convertJSXMoney } from "@/utils/convertMoney";
import { Box, Typography } from "@mui/material";
import Link from "next/link";
import { useTranslation } from "react-i18next";

const HuongDan = () => {
  const { t } = useTranslation("common");

  return (
    <>
      <Box
        className="huongdan"
        sx={{
          padding: "10px",
          boxShadow: "0 5px 5px #c5c5da40",
          marginTop: "20px",
          borderRadius: "15px",
          background: "linear-gradient(124.32deg,#102d47 12.08%,#12304d 85.02%)",

          color: "text.primary",
        }}
      >
        <h2 className="title">{t("Withdraw guide")}</h2>
        <Typography component="ul">
          <li>
            {t("Withdraw guide step1-1")} <Link href="/password-withdraw">{t("Withdraw guide step1-2")}</Link>{" "}
            {t("Withdraw guide step1-3")}
          </li>
          <li>{t("Please enter your withdrawal password")}</li>
          <li>{t("Withdraw guide step3")}</li>
          <li>{t("Withdraw guide step4")}</li>
        </Typography>
      </Box>
    </>
  );
};
export default HuongDan;
