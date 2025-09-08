import { Box, Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { memo, useEffect, useRef, useState } from "react";

import LoadingBox from "@/components/homePage/LoadingBox";
import OutlinedInput from "@/components/input/OutlinedInput";
import {
  LOAI_CUOC,
  MUC_TIEN_CUOC,
  TINH_TRANG_GAME,
  USER_BET_GAME_HISTORY_PAGE_SIZE,
} from "@/configs/game.xucxac.config";
import useGetBetPayoutPercentage from "@/hooks/useGetBetPayoutPercentage";
import useGetDetailedBetHistory from "@/hooks/useGetDetailedBetHistory";
import useGetUserBetHistory from "@/hooks/useGetUserBetHistory";
import GameService from "@/services/GameService";
import convertMoney from "@/utils/convertMoney";
import _ from "lodash";
import { toast } from "react-toastify";
import { useTranslation } from 'react-i18next';

const BoxContainer = styled(Box)(({ theme }) => ({
  borderRadius: "20px",
  padding: "20px",
  marginTop: "10px",

  backgroundColor: theme.palette.background.default,
  position: "relative",
  display: "flex",
  gap: "10px",
  flexDirection: "column",
  color: theme.palette.text.secondary,
  "& .bet_state": {
    borderBottom: "3px solid red",
    display: "inline-block",
    fontWeight: 700,
    margin: "0.1rem 0 0.3rem",
  },
}));
const ItemCuoc = styled(Box)(({ theme }) => ({
  borderRadius: "10px",
  padding: "10px",
  cursor: "pointer",

  position: "relative",
  display: "flex",
  gap: "10px",
  flexDirection: "column",
  border: "1px solid #e5e5e5",
  alignItems: "center",
  color: theme.palette.text.primary,
  "& .loai_cuoc": {
    fontWeight: 700,
  },
  "& .tien_cuoc": {
    fontWeight: 700,
    color: "#0d8ea7",
    "&.new": {
      color: "blue",
    },
  },
  "&.active-tien_cuoc": {
    backgroundColor: "#0d8ea7",
    border: "1px solid #0d8ea7",
    "& .loai_cuoc": {
      color: "#ffffff",
    },
  },
}));

const BoxDatCuoc = ({ TYPE_GAME, phien, tinhTrang }) => {
  const { t } = useTranslation('common');
  const titleDatCuocRef = useRef(null);
  const { data: detailedBetHistoryData, refetch: refetchDetailedBetHistory } = useGetDetailedBetHistory({
    typeGame: TYPE_GAME,
    phien,
  });
  const { data: betPayoutPercentageData } = useGetBetPayoutPercentage({ typeGame: TYPE_GAME });
  const { refetch: refetchUserBetHistory } = useGetUserBetHistory({
    typeGame: TYPE_GAME,
    pageSize: USER_BET_GAME_HISTORY_PAGE_SIZE,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [tienCuoc, setTienCuoc] = useState(0);
  const tiLe = betPayoutPercentageData ?? 0;
  const chiTietCuocHienTai = detailedBetHistoryData?.datCuoc ?? [];
  const [chiTietCuocTemp, setChiTietCuocTemp] = useState(detailedBetHistoryData?.datCuoc ?? []);

  useEffect(() => {
    // Reset lịch sử cược khi phiên bắt đầu quay
    if (tinhTrang === TINH_TRANG_GAME.DANG_QUAY) {
      handleResetCuoc();
    }
    // Reset lịch sử cược khi phiên đã hoàn tất
    else if (tinhTrang === TINH_TRANG_GAME.DANG_TRA_THUONG) {
      setChiTietCuocTemp([]);
    }
  }, [tinhTrang]);
  // Đồng bộ lịch sử cược khi thay đổi dữ liệu
  useEffect(() => {
    if (detailedBetHistoryData) {
      setChiTietCuocTemp(detailedBetHistoryData.datCuoc);
    } else {
      setChiTietCuocTemp([]);
    }
  }, [detailedBetHistoryData]);

  const handleSubmitCuoc = async () => {
    try {
      if (chiTietCuocTemp.length === 0) {
        toast.error(t("Vui lòng chọn cược"));
        return;
      }
      setIsLoading(true);

      const results = await GameService.createDatCuoc({
        typeGame: TYPE_GAME,
        data: {
          phien,
          chiTietCuoc: chiTietCuocTemp,
        },
      });
      await refetchDetailedBetHistory();
      refetchUserBetHistory();
      toast.success(t('Đặt cược thành công'));
      handleResetCuoc();
    } catch (err) {
      toast.error(t(err?.response?.data?.message) ?? "Lỗi hệ thống: không thể cược");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Chuyển giá trị chuỗi từ input thành số, sau đó set cho tiền cược
   * @param {String} value
   *
   */
  const handleChangeTienCuoc = (value) => {
    let parseValue = parseInt(value);
    if (isNaN(parseValue)) {
      parseValue = 0;
    }
    setTienCuoc(parseValue);
  };
  /**
   *
   * @param {*} loaiCuoc Loại Cược : CLTX
   * @param {*} chiTietCuoc Chi tiết cược: T, X
   * @param {*} tienCuoc Số tiền cược
   * @returns
   */

  const handleClickCuocCLTX = ({ loaiCuoc, chiTietCuoc, tienCuoc }) => {
    if (tinhTrang !== TINH_TRANG_GAME.DANG_CHO) {
      toast.error(t("Vui lòng đợi phiên mới"));
      return;
    }
    if (!tienCuoc || tienCuoc <= 0 || !_.isNumber(tienCuoc)) {
      toast.error(t("Vui lòng chọn tiền cược hợp lệ"));
      titleDatCuocRef?.current?.scrollIntoView({ behavior: "smooth" });
      return;
    }

    const findItemCuoc = chiTietCuocTemp.find((e) => e.chiTietCuoc === chiTietCuoc && e.loaiCuoc === loaiCuoc);
    // Nếu chưa cược lần nào
    if (chiTietCuocTemp.length === 0) {
      // Insert cược mới

      setChiTietCuocTemp((state) => [
        ...state,
        {
          loaiCuoc,
          chiTietCuoc,
          tienCuoc,
        },
      ]);
    } else {
      if (!findItemCuoc) {
        toast.error(t("Bạn chỉ được phép đặt cược 1 bên"));
        return;
      } else {
        // Ghi đè cược cũ
        const newTienCuoc = findItemCuoc.tienCuoc + tienCuoc;
        setChiTietCuocTemp((prevState) => {
          const newState = prevState.map((obj) => {
            if (obj.chiTietCuoc === chiTietCuoc && obj.loaiCuoc === loaiCuoc) {
              return { ...obj, tienCuoc: newTienCuoc };
            }
            return obj;
          });

          return newState;
        });
      }
    }
  };
  /**
   *
   * @param {*} loaiCuoc Loại Cược : CLTX
   * @param {*} chiTietCuoc Chi tiết cược: T, X
   * @returns {Number} Số tiền đang cược
   */

  const convertTienCuocCLTX = ({ loaiCuoc, chiTietCuoc }) => {
    const findItemCuoc = chiTietCuocTemp.find((e) => e.chiTietCuoc === chiTietCuoc && e.loaiCuoc === loaiCuoc);
    if (findItemCuoc) {
      return convertMoney(findItemCuoc.tienCuoc);
    } else {
      return 0;
    }
  };

  /**
   * Reset cược tạm thời về như ban đầu
   */
  const handleResetCuoc = () => {
    setChiTietCuocTemp(chiTietCuocHienTai);
    setTienCuoc(0);
  };
  return (
    <>
      {isLoading && <LoadingBox isLoading={isLoading} />}
      <Box
        sx={{
          borderRadius: "2rem",
          padding: { xs: "1rem", md: "2rem" },
          marginTop: "1rem",

          background: "linear-gradient(124.32deg,#102d47 12.08%,#12304d 85.02%)",
          position: "relative",
          display: "flex",
          gap: "10px",
          flexDirection: "column",
          color: (theme) => theme.palette.text.primary,
          "& .bet_state": {
            borderBottom: "3px solid red",
            display: "inline-block",
            fontWeight: 700,
            margin: "0.1rem 0 0.3rem",
          },
        }}
      >
        <h2 className="title">{t('Place')}</h2>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0,1fr))",
            gap: "10px",
          }}
        >
          {LOAI_CUOC.map((item, i) => (
            <ItemCuoc
              key={item.tenCuoc}
              onClick={() => handleClickCuocCLTX({ loaiCuoc: item.loaiCuoc, chiTietCuoc: item.chiTietCuoc, tienCuoc })}
            >
              <Typography className="loai_cuoc">{t(item.tenCuoc)}</Typography>
              <Typography>x{tiLe}</Typography>
              <Typography className={"tien_cuoc"}>
                {convertTienCuocCLTX({ loaiCuoc: item.loaiCuoc, chiTietCuoc: item.chiTietCuoc })}
              </Typography>
            </ItemCuoc>
          ))}
        </Box>

        <Typography
          sx={{
            fontWeight: "bold",
          }}
          ref={titleDatCuocRef}
        >
          {t('Chọn tiền cược sẵn có')}
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: "10px",
            justifyContent: "flex-end",
            flexWrap: "wrap",
          }}
        >
          {MUC_TIEN_CUOC.map((item, i) => (
            <ItemCuoc
              key={item}
              className={tienCuoc == item ? "active-tien_cuoc" : ""}
              onClick={() => setTienCuoc(item)}
            >
              <Typography className="loai_cuoc">{convertMoney(item)}</Typography>
            </ItemCuoc>
          ))}
        </Box>

        <Typography
          sx={{
            fontWeight: "bold",
          }}
        >
          {t('Hoặc nhập số tiền bất kỳ ở dưới')}
        </Typography>
        <OutlinedInput
          value={tienCuoc}
          onChange={(e) => handleChangeTienCuoc(e.target.value)}
          placeholder={t('Số tiền')}
          size="small"
          type="number"
          fullWidth
          onWheel={(e) => e.target.blur()}
        />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            alignItems: "center",
            "& > button": {
              maxWidth: "20rem",
              width: "100%",
            },
          }}
        >
          <Button disabled={tinhTrang === TINH_TRANG_GAME.DANG_QUAY} onClick={handleSubmitCuoc}>
            {tinhTrang === TINH_TRANG_GAME.DANG_QUAY ? t('Chờ phiên mới') : t("Confirm")}
          </Button>

          <Button onClick={handleResetCuoc}>{t('Đặt lại')}</Button>
        </Box>
      </Box>
    </>
  );
};
export default memo(BoxDatCuoc);
