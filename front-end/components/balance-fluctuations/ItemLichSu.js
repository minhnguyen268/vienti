import { convertJSXMoney } from "@/utils/convertMoney";
import { convertDateTime } from "@/utils/convertTime";
import { Box, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';

const ItemLichSu = ({ item }) => {
  const { t } = useTranslation('common');

  const convertNoiDung = (noiDung) => {
    let result = noiDung;
    result = result.replaceAll('Cược game', t('Cược game'));
    result = result.replaceAll('Keno1P', t('Keno1P'));
    result = result.replaceAll('Keno3P', t('Keno3P'));
    result = result.replaceAll('Keno5P', t('Keno5P'));
    result = result.replaceAll('Xúc Xắc 1P', t('Xúc Xắc 1P'));
    result = result.replaceAll('Xúc Xắc 3P', t('Xúc Xắc 3P'));
    result = result.replaceAll('Xóc Đĩa 1P', t('Xóc Đĩa 1P'));
    result = result.replaceAll('Xổ Số 3P', t('Xổ Số 3P'));
    result = result.replaceAll('Xổ số 5P', t('Xổ số 5P'));
    result = result.replaceAll('thắng', t('thắng'));
    result = result.replaceAll('bi', t('bi'));
    result = result.replaceAll('Gửi yêu cầu rút tiền về', t('Gửi yêu cầu rút tiền về'));
    result = result.replaceAll('với số tiền', t('với số tiền'));
    result = result.replaceAll('Hoàn lại tiền do đơn rút tiền tiền về', t('Hoàn lại tiền do đơn rút tiền tiền về'));
    result = result.replaceAll('bị hủy', t('bị hủy'));
    result = result.replaceAll('Cược Lô xiên', t('Cược Lô xiên'));
    result = result.replaceAll('Chọn số', t('Chọn số'));
    result = result.replaceAll('Cược Ba càng', t('Cược Ba càng'));
    result = result.replaceAll('Cược Đề', t('Cược Đề'));
    result = result.replaceAll('Cược Lô', t('Cược Lô'));
    result = result.replaceAll('Nhỏ', t('Nhỏ'));
    result = result.replaceAll('Chẵn', t('Chẵn'));
    result = result.replaceAll('Lẻ', t('Lẻ'));
    result = result.replaceAll('Lớn', t('Lớn'));
    result = result.replaceAll('Cược thêm', t('Cược thêm'));
    result = result.replaceAll('Cược', t('Cược'));
    result = result.replaceAll('Toàn trắng', t('Toàn trắng'));
    result = result.replaceAll('Toàn đỏ', t('Toàn đỏ'));
    result = result.replaceAll('Ba đỏ một trắng', t('Ba đỏ một trắng'));
    result = result.replaceAll('Ba trắng một đỏ', t('Ba trắng một đỏ'));
    result = result.replaceAll('Hai trắng hai đỏ', t('Hai trắng hai đỏ'));
    return result;
  }

  return (
    <>
      <Box
        sx={{
          padding: "10px",
          borderBottom: "1px solid #e5e5e5",
          display: "flex",
          flexDirection: "column",
          color: "text.primary",
          gap: "10px",
        }}
        className="item-lich-su"
      >
        <Typography
          sx={{
            fontSize: "1.3rem",
          }}
        >
          {t("Advance deposit")}: {convertJSXMoney(item.tienTruoc)}
        </Typography>
        <Typography
          sx={{
            fontSize: "1.3rem",
          }}
        >
          {t("After deposit")}: {convertJSXMoney(item.tienSau)}
        </Typography>
        <Typography
          sx={{
            fontSize: "1.3rem",
          }}
        >
          {t("Change amount")}: {item.tienSau - item.tienTruoc > 0 ? "+" : ""}
          {convertJSXMoney(item.tienSau - item.tienTruoc)}
        </Typography>
        <Typography
          sx={{
            fontSize: "1.3rem",
          }}
        >
          {t("Content")}: {convertNoiDung(item.noiDung)}
        </Typography>

        <Typography
          sx={{
            fontSize: "1.3rem",
          }}
        >
          {t("Time")}: {convertDateTime(item.createdAt)}
        </Typography>
      </Box>
    </>
  );
};
export default ItemLichSu;
