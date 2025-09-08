import LoadingBox from "@/components/homePage/LoadingBox";
import OutlinedInput from "@/components/input/OutlinedInput";
import { LOAI_BI, LOAI_CUOC, TINH_TRANG_GAME, USER_BET_GAME_HISTORY_PAGE_SIZE } from "@/configs/game.keno.config";
import useGetBetPayoutPercentage from "@/hooks/useGetBetPayoutPercentage";
import useGetDetailedBetHistory from "@/hooks/useGetDetailedBetHistory";
import useGetUserBetHistory from "@/hooks/useGetUserBetHistory";
import GameService from "@/services/GameService";
import { convertJSXMoney } from "@/utils/convertMoney";
import { isNumberKey } from "@/utils/input";
import { Box, Button, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import clsx from "clsx";
import _ from "lodash";
import { memo, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

const BoxContainer = styled(Box)(({ theme }) => ({
  borderRadius: "2rem",
  padding: "2rem",
  marginTop: "1rem",

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
    fontWeight: 500,
  },
  "& .tien_cuoc": {
    fontWeight: 700,
    color: "#0d8ea7",
  },
  "&.active-tien_cuoc": {
    backgroundColor: "#0d8ea7",
    border: "1px solid #0d8ea7",
    "& .loai_cuoc": {
      color: "#ffffff",
    },
  },
}));

const BoxDatCuoc = ({ TYPE_GAME = "keno1p", phien, tinhTrang }) => {
  const { t } = useTranslation("common");
  const titleDatCuocRef = useRef(null);
  const inputDatCuocRef = useRef(null);
  const { data: detailedBetHistoryData, refetch: refetchDetailedBetHistory } = useGetDetailedBetHistory({
    typeGame: TYPE_GAME,
    phien,
  });

  const { data: betPayoutPercentageData } = useGetBetPayoutPercentage({ typeGame: TYPE_GAME });

  const { refetch: refetchUserBetHistory } = useGetUserBetHistory({
    typeGame: TYPE_GAME,
    pageSize: USER_BET_GAME_HISTORY_PAGE_SIZE,
  });
  const [listDatCuoc, setListDatCuoc] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpenPopupBet, setIsOpenPopupBet] = useState(false);
  const [tienCuoc, setTienCuoc] = useState(0);
  const tiLe = betPayoutPercentageData ?? null;

  useEffect(() => {
    if (listDatCuoc.length === 0) {
      setIsOpenPopupBet(false);
    } else {
      setIsOpenPopupBet(true);
    }
  }, [listDatCuoc]);

  const handleSubmitCuoc = async () => {
    try {
      if (tienCuoc <= 0) {
        toast.error(t("Vui lòng chọn tiền cược hợp lệ"));
        inputDatCuocRef?.current?.focus();
        return;
      }
      if (listDatCuoc.length === 0) {
        toast.error(t("Vui lòng chọn cược"));
        titleChonSoRef?.current?.scrollIntoView({ behavior: "smooth" });
        return;
      }

      setIsLoading(true);
      const results = await GameService.createDatCuoc({
        typeGame: TYPE_GAME,
        data: {
          phien,
          listDatCuoc,
          tienCuoc,
        },
      });
      await refetchDetailedBetHistory();
      refetchUserBetHistory();
      toast.success(t("Đặt cược thành công"));
      handleResetCuoc();
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message ?? "Lỗi hệ thống: không thể cược");
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
   * Reset cược tạm thời về như ban đầu
   */
  const handleResetCuoc = () => {
    setTienCuoc(0);
    setListDatCuoc([]);
  };

  /**
   * Xử lý chọn cược
   */
  const handleChonCuoc = (data) => {
    const { loaiBi, loaiCuoc } = data;

    const findLoaiCuoc = LOAI_CUOC.find((item) => item.loaiCuoc === loaiCuoc);
    if (!findLoaiCuoc) {
      toast.error("Loại cược không hợp lệ");
      return;
    }

    const checkIsSelected = listDatCuoc.find((datCuoc) => datCuoc.loaiCuoc === loaiCuoc && datCuoc.loaiBi === loaiBi);
    // Nếu tồn tại thì xóa

    if (checkIsSelected) {
      setListDatCuoc((prev) => {
        const copyPrev = [...prev];
        _.remove(copyPrev, (datCuoc) => datCuoc.loaiCuoc === loaiCuoc && datCuoc.loaiBi === loaiBi);
        return copyPrev;
      });
    } else {
      setListDatCuoc((prev) => [
        ...prev,
        {
          loaiBi,
          loaiCuoc,
        },
      ]);
    }
  };

  const convertMarbleName = (number) => {
    switch (number) {
      case "1":
        return "đầu tiên";
      case "2":
        return "thứ hai";
      case "3":
        return "thứ ba";
      case "4":
        return "thứ tư";
      case "5":
        return "thứ năm";
      default:
        return "Không xác định";
    }
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
        <h2 className="title">{t("Place")}</h2>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "repeat(1, minmax(0,1fr))", md: "repeat(1, minmax(0,1fr))" },
            gap: "2rem",
          }}
        >
          {LOAI_BI.map((item, i) => (
            <Box key={i}>
              <Typography
                sx={{
                  fontWeight: "bold",
                  textAlign: "center",
                  paddingBottom: "5px",
                }}
              >
                {t(`Quả bóng ${convertMarbleName(item)}`)}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0,1fr))",
                  gap: "10px",
                }}
              >
                {LOAI_CUOC.map((itemLoaiCuoc) => {
                  const isDatCuoc = listDatCuoc.find(
                    (datCuoc) => datCuoc.loaiCuoc === itemLoaiCuoc.loaiCuoc && datCuoc.loaiBi === item
                  );
                  return (
                    <ItemCuoc
                      className={clsx({
                        "active-tien_cuoc": isDatCuoc,
                      })}
                      key={itemLoaiCuoc.tenCuoc}
                      onClick={() => handleChonCuoc({ loaiCuoc: itemLoaiCuoc.loaiCuoc, loaiBi: item })}
                    >
                      <Typography className={clsx("loai_cuoc ")}>
                        {t(itemLoaiCuoc.tenCuoc.replace("Chẵn", "Đôi").replace("Lẻ", "Đơn"))}
                      </Typography>
                      <Typography>x{tiLe && tiLe[`bi_${item}`][itemLoaiCuoc.loaiCuoc]}</Typography>
                    </ItemCuoc>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
        {isOpenPopupBet && (
          <Box className="popup-bet">
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
              }}
            >
              <Typography sx={{}} ref={titleDatCuocRef}>
                {t("Bet amount")}
              </Typography>

              <OutlinedInput
                inputRef={inputDatCuocRef}
                value={tienCuoc}
                onChange={(e) => {
                  if (isNumberKey(e)) {
                    handleChangeTienCuoc(e.target.value);
                  } else {
                    e.preventDefault();
                  }
                }}
                placeholder="Số tiền"
                size="small"
                type="text"
                fullWidth
                onWheel={(e) => e.target.blur()}
              />
              <Typography component={"div"} sx={{}}>
                {t("Chosen")}{" "}
                <Typography
                  component={"span"}
                  sx={{
                    color: "rgb(255, 194, 0)",
                  }}
                >
                  {listDatCuoc.length}
                </Typography>
                , {t("Total bet")}{" "}
                <Typography
                  component={"span"}
                  sx={{
                    color: "rgb(255, 194, 0)",
                  }}
                >
                  {convertJSXMoney(tienCuoc * listDatCuoc.length)}
                </Typography>
              </Typography>

              <Button
                disabled={tinhTrang === TINH_TRANG_GAME.DANG_QUAY}
                onClick={handleSubmitCuoc}
                sx={{
                  fontSize: "2rem",
                }}
              >
                {tinhTrang === TINH_TRANG_GAME.DANG_QUAY ? t("Wait new round") : t("Place")}
              </Button>
            </Box>
          </Box>
        )}
      </Box>
    </>
  );
};
export default memo(BoxDatCuoc);
