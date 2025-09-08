import Modal from "@/components/homePage/Modal";
import { Typography } from "@mui/material";
import { memo } from "react";
import { useTranslation } from 'react-i18next';

const HuongDan = ({ isModal, setIsModal }) => {
  const { t } = useTranslation('common');

  return (
    <>
      <Modal isModal={isModal} setIsModal={setIsModal} title={t("How to play")}>
        <Typography>
          {t('Chiến thắng khi đặt cược bi (lẻ/chẵn/lớn/nhỏ) khớp với kết quả xổ số. Ví dụ tỉ lệ ăn là x1.98 thì khi đánh 100,000đ sẽ thắng được 198,000đ.')}
        </Typography>
        <Typography>
          {t('Chẵn: kết quả là số chia hết cho 2, Lẻ: kết quả là số không chia hết cho 2, Lớn: kết quả lớn hơn hoặc bằng 5, Nhỏ: kết quả nhỏ hơn 5')}
        </Typography>
        <Typography>{t('Ví dụ: Bi 1 ra kết quả là 6 thì sẽ là chẵn.')}</Typography>
        <Typography>{t('Ví dụ: Bi 2 ra kết quả là 1 thì sẽ là lẻ.')}</Typography>
      </Modal>
    </>
  );
};
export default memo(HuongDan);
