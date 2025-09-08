import { convertJSXTinhTrangGameXucXac } from "@/utils/convertTinhTrang";
import { Box, Button, Typography } from "@mui/material";
import { memo, useState } from "react";
import CountdownTimer from "./CountdownTimer";
import HuongDan from "./HuongDan";
import { useTranslation } from 'react-i18next';

const BoxInfor = ({ phien, countdownTime, tinhTrang }) => {
  const { t } = useTranslation('common');
  const [isModal, setIsModal] = useState(false);

  return (
    <>
      <HuongDan isModal={isModal} setIsModal={setIsModal} />
      <Box
        sx={{
          display: "flex",

          justifyContent: "center",
          flexDirection: { xs: "column", md: "row" },
          gap: "10px",
        }}
      >
        <Box
          sx={{
            textAlign: "center",

            padding: "0px 20px",
          }}
        >
          <Typography
            sx={{
              color: "#b7b7b7",
              fontSize: "1.8rem",
            }}
          >
            {t('Round')}
          </Typography>
          <Typography
            sx={{
              fontSize: "1.8rem",
              fontWeight: "bold",
            }}
          >
            {phien}
          </Typography>
          <Button
            sx={{
              background: "#fff !important",
              border: "0.1rem solid #13a2ba",
              color: "#0d8ea7",
            }}
            onClick={() => setIsModal(true)}
          >
            {t('How to play')}
          </Button>
        </Box>
        <Box
          sx={{
            textAlign: "center",

            padding: "0px 20px",
          }}
        >
          <Typography
            sx={{
              color: "#b7b7b7",
              fontSize: "1.8rem",
            }}
          >
            {t('Time remaining')}
          </Typography>
          <CountdownTimer countdownTime={countdownTime} />
          <div
            style={{
              paddingTop: "0.5rem",
            }}
          ></div>
          {convertJSXTinhTrangGameXucXac(tinhTrang)}
        </Box>
      </Box>
    </>
  );
};
export default memo(BoxInfor);
