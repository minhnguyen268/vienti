import { convertJSXMoney } from "@/utils/convertMoney";
import { convertDateTime } from "@/utils/convertTime";
import { convertJSXTinhTrangWithdrawHistory } from "@/utils/convertTinhTrang";
import { Box, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';

const ItemLichSu = ({ item }) => {
  const { t } = useTranslation('common');

  const convertThongTinNganHang =
    `${item?.nganHang?.tenNganHang} - ${item?.nganHang?.tenChuTaiKhoan} - ${item?.nganHang?.soTaiKhoan}` ?? "";
  return (
    <>
      <Box
        sx={{
          padding: "10px",
          borderBottom: "1px solid #e5e5e5",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
          color: "text.primary",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <Typography
              sx={{
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {t("Withdrawal")}
            </Typography>
            {convertJSXTinhTrangWithdrawHistory(item.tinhTrang)}
          </Box>

          <Typography
            sx={{
              color: "#b7b7b7",
              fontSize: "1.3rem",
            }}
          >
            {t('Bank number')}: {convertThongTinNganHang}
          </Typography>
          {item.noiDung && (
            <Typography
              sx={{
                color: "#b7b7b7",
                fontSize: "1.3rem",
              }}
            >
              {t('Detail')}: {item.noiDung}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
            alignItems: "flex-end",
          }}
        >
          <Typography>-{convertJSXMoney(item.soTien)}</Typography>

          <Typography
            sx={{
              color: "#b7b7b7",
              fontSize: "1.3rem",
            }}
          >
            {convertDateTime(item.createdAt)}
          </Typography>
        </Box>
      </Box>
    </>
  );
};
export default ItemLichSu;
