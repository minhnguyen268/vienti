import { MIN_MONEY_DEPOSIT } from "@/configs/deposit.config";
import { convertJSXMoney } from "@/utils/convertMoney";
import { Box, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';

const HuongDan = () => {
  const { t } = useTranslation('common');

  return (
    <>
      <Box
        className="huongdan"
        sx={{
          padding: "1rem",
          boxShadow: "0 5px 5px #c5c5da40",
          marginTop: "2rem",
          borderRadius: "1.5rem",
          background: "linear-gradient(124.32deg,#102d47 12.08%,#12304d 85.02%)",
          color: "text.primary",
        }}
      >
        <h2 className="title">{t('DepositGuide title')}</h2>
        <Typography component="ul">
          <li>{t('DepositGuide step1')}</li>
        </Typography>
      </Box>
    </>
  );
};
export default HuongDan;
