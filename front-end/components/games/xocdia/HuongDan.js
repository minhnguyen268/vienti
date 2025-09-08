import Modal from "@/components/homePage/Modal";
import { TYPE_CUOC_CHAN, TYPE_CUOC_LE } from "@/configs/game.xocdia.config";
import { Box, Typography } from "@mui/material";
import { uniqueId } from "lodash";
import { memo } from "react";
import { useTranslation } from 'react-i18next';

const HuongDan = ({ isModal, setIsModal }) => {
  const { t } = useTranslation('common');

  return (
    <>
      <Modal isModal={isModal} setIsModal={setIsModal} title={t("How to play")}>
        <Typography>{t('Chiến thắng khi đặt cược khớp với bảng kết quả dưới đây:')}</Typography>
        <Box>
          {t('Bảng tra kết quả chẵn:')}
          {TYPE_CUOC_CHAN.map((item, index) => (
            <td className="history_xucsac" key={uniqueId()} style={{ display: "flex", justifyContent: "center" }}>
              {item.map((bi) => (
                <div key={uniqueId()} className={`a${bi}`}></div>
              ))}
            </td>
          ))}
        </Box>
        <Box>
          {t('Bảng tra kết quả lẻ:')}
          {TYPE_CUOC_LE.map((item, index) => (
            <td className="history_xucsac" key={uniqueId()} style={{ display: "flex", justifyContent: "center" }}>
              {item.map((bi) => (
                <div key={uniqueId()} className={`a${bi}`}></div>
              ))}
            </td>
          ))}
        </Box>
      </Modal>
    </>
  );
};
export default memo(HuongDan);
