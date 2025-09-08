import OutlinedInput from "@/components/input/OutlinedInput";
import { LOAI_BI, LOAI_CUOC } from "@/configs/game.keno.config";
import { OptionMenu, OptionMenuItem } from "@/custom/optionMenu";
import useGetBetPayoutPercentage from "@/hooks/admin/useGetBetPayoutPercentage";
import GameKenoService from "@/services/admin/GameService";
import { Backdrop, Box, Button, CircularProgress, FormControl, Select, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
const LOAI_BI_OPTIONS = LOAI_BI.map((bi) => ({
  title: `Bi ${bi}`,
  key: `bi_${bi}`,
}));
const LOAI_CUA_OPTIONS = LOAI_CUOC.map((item) => ({
  title: item.tenCuoc,
  key: item.loaiCuoc,
}));
const DieuChinhTiLe = ({ TYPE_GAME = "keno1p" }) => {
  const { data: dataQuery, isLoading, refetch } = useGetBetPayoutPercentage({ typeGame: TYPE_GAME });
  const [tiLe, setTiLe] = useState(dataQuery ?? null);
  const [isLoadingState, setIsLoadingState] = useState(false);
  const [loaiBiSelected, setLoaiBiSelected] = useState(LOAI_BI_OPTIONS[0].key);
  const [loaiCuaSelected, setLoaiCuaSelected] = useState(LOAI_CUA_OPTIONS[0].key);

  useEffect(() => {
    setTiLe(dataQuery ?? null);
  }, [dataQuery]);

  const handleClickDieuChinh = async () => {
    try {
      let convertNumObj = {};
      let isValidBetPayoutPercent = true;

      Object.keys(tiLe).forEach((loaiBi) => {
        const objectLoaiBi = tiLe[loaiBi];
        Object.keys(objectLoaiBi).forEach((item) => {
          const checkIsNaN = isNaN(tiLe[loaiBi][item]);
          if (checkIsNaN) {
            isValidBetPayoutPercent = false;
          }
          // convertNumObj = { ...convertNumObj, [loaiBi]: { ...tiLe[loaiBi], [item]: parseFloat(tiLe[loaiBi][item]) } };
        });
      });

      if (!isValidBetPayoutPercent) {
        toast.error("Vui lòng chọn tỉ lệ hợp lệ");
        return;
      }
      setIsLoadingState(true);
      console.log({ tiLe });

      const res = await GameKenoService.setTiLeGame({ tiLe: tiLe, typeGame: TYPE_GAME });
      refetch();
      toast.success("Chỉnh sửa thành công");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Có lỗi xảy ra khi thực hiện");
    } finally {
      setIsLoadingState(false);
    }
  };
  const handleChangeTiLe = (e) => {
    // const tiLeMoi = { ...tiLe };

    // for (let key in tiLeMoi) {
    //   let obj = tiLeMoi[key];
    //   for (let prop in obj) {
    //     obj[prop] = parseFloat(e.target.value);
    //   }
    // }

    // setTiLe(tiLeMoi);

    setTiLe((prev) => ({
      ...prev,
      [loaiBiSelected]: { ...tiLe[loaiBiSelected], [loaiCuaSelected]: parseFloat(e.target.value) },
    }));
  };
  return (
    <>
      <h2
        className="title admin"
        style={{
          fontSize: "2.5rem",
        }}
      >
        Điều chỉnh tỉ lệ trả thưởng
      </h2>

      <Box
        sx={{
          textAlign: "center",
          color: "text.secondary",

          width: "100%",
          maxWidth: "600px",
        }}
      >
        {isLoadingState && (
          <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoadingState}>
            <CircularProgress color="inherit" />
          </Backdrop>
        )}
        {isLoading && <CircularProgress color="inherit" />}

        {!isLoading && (
          <>
            <FormControl fullWidth>
              <Typography>Chọn loại bi</Typography>
              <Select
                labelId="select-status"
                id="select-status-option"
                label="Status"
                input={<OptionMenu />}
                value={loaiBiSelected}
                onChange={(e) => setLoaiBiSelected(e.target.value)}
              >
                {LOAI_BI_OPTIONS.map((item, i) => (
                  <OptionMenuItem key={item.key} value={item.key}>
                    {item.title}
                  </OptionMenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <Typography>Chọn loại cửa</Typography>
              <Select
                labelId="select-status"
                id="select-status-option"
                label="Status"
                input={<OptionMenu />}
                value={loaiCuaSelected}
                onChange={(e) => setLoaiCuaSelected(e.target.value)}
              >
                {LOAI_CUA_OPTIONS.map((item, i) => (
                  <OptionMenuItem key={item.key} value={item.key}>
                    {item.title}
                  </OptionMenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <Typography>Tỉ lệ</Typography>
              <OutlinedInput
                placeholder="Tỉ lệ"
                size="small"
                type="number"
                fullWidth
                onChange={handleChangeTiLe}
                value={tiLe?.[loaiBiSelected]?.[loaiCuaSelected] ?? 0}
                onWheel={(e) => e.target.blur()}
              />
            </FormControl>

            <Button
              sx={{
                marginTop: "10px",
              }}
              onClick={handleClickDieuChinh}
            >
              Điều chỉnh
            </Button>
          </>
        )}
      </Box>
    </>
  );
};
export default DieuChinhTiLe;
