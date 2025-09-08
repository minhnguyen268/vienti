import { MIN_MONEY_DEPOSIT } from "@/configs/deposit.config";
import DepositService from "@/services/DepositService";
import convertMoney from "@/utils/convertMoney";
import { yupResolver } from "@hookform/resolvers/yup";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Box, Button, FormControl, Typography } from "@mui/material";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as Yup from "yup";
import LoadingBox from "../homePage/LoadingBox";
import ErrorMessageLabel from "../input/ErrorMessageLabel";
import OutlinedInput from "../input/OutlinedInput";

const NOI_DUNG_NAP_TIEN = process.env.MEMO_PREFIX_DEPOSIT || "NAPTIEN";
const FormNap = ({ selectedBank }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [srcVietQR, setSrcVietQR] = useState("");
  useEffect(() => {
    setSrcVietQR("");
  }, [selectedBank]);
  // form validation rules
  const validationSchema = Yup.object().shape({
    soTien: Yup.number()
      .typeError("Vui lòng nhập số tiền hợp lệ")
      .required("Vui lòng nhập số tiền hợp lệ")
      .min(MIN_MONEY_DEPOSIT, "Vui lòng nhập số tiền từ " + convertMoney(MIN_MONEY_DEPOSIT)),
  });
  const formOptions = { resolver: yupResolver(validationSchema) };

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
    reset,
    watch,
  } = useForm(formOptions);
  const soTien = watch("soTien");

  const onSubmit = async ({ soTien }) => {
    try {
      if (!selectedBank) {
        return;
      }
      setIsLoading(true);
      await new Promise((resolve) => {
        setTimeout(() => {
          resolve();
        }, 100);
      });
      setSrcVietQR(
        `https://img.vietqr.io/image/${selectedBank.code}-${selectedBank.soTaiKhoan}-compact2.png?amount=${soTien}&addInfo=NAPTIEN%20${session.user.taiKhoan}&accountName=${selectedBank.tenChuTaiKhoan}`
      );
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);

      toast.error(err?.response?.data?.message);
    }
  };
  const handleConfirmDeposit = async () => {
    try {
      if (!srcVietQR) {
        return;
      }
      setIsLoading(true);
      const res = await DepositService.createDeposit({
        soTien: parseInt(soTien),
        nganHang: selectedBank,
      });
      toast.success(res?.data?.message ?? "Tạo yêu cầu nạp tiền thàn công");
      setIsLoading(false);
      setSrcVietQR("");
      reset();
      router.push("/deposit-history");
    } catch (err) {
      setIsLoading(false);

      toast.error(err?.response?.data?.message ?? "Có lỗi khi tạo yêu cầu nạp tiền");
    }
  };

  return (
    <>
      {selectedBank && (
        <>
          {srcVietQR && (
            <Box
              sx={{
                border: (theme) => `1px solid ${theme.palette.color.primary}`,
                padding: "1rem",
                marginTop: "3rem",
                color: (theme) => theme.palette.text.primary,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img
                src={srcVietQR}
                style={{
                  width: "100%",
                  maxWidth: "25rem",
                }}
              />
              <Box>
                <Typography sx={{}}>
                  Ngân hàng: <b>{selectedBank.tenBank}</b>
                </Typography>
                <Typography sx={{}}>
                  Chủ tài khoản: <b>{selectedBank.tenChuTaiKhoan}</b>
                </Typography>

                <Typography sx={{}}>
                  Số tài khoản: <b>{selectedBank.soTaiKhoan}</b>
                  <ContentCopyIcon
                    onClick={() =>
                      navigator.clipboard.writeText(selectedBank.soTaiKhoan).then(() => {
                        toast.success("Copy thành công");
                      })
                    }
                  />
                </Typography>
                <Typography sx={{}}>
                  Nội dung: <b>{NOI_DUNG_NAP_TIEN + " " + session.user.taiKhoan}</b>
                  <ContentCopyIcon
                    onClick={() =>
                      navigator.clipboard.writeText(NOI_DUNG_NAP_TIEN + " " + session.user.taiKhoan).then(() => {
                        toast.success("Copy thành công");
                      })
                    }
                  />
                </Typography>
              </Box>
            </Box>
          )}
          {isLoading && <LoadingBox isLoading={isLoading} />}
          {srcVietQR && (
            <Box
              sx={{
                textAlign: "center",
                paddingTop: "1rem",
              }}
            >
              <Button
                sx={{
                  fontSize: "2rem",
                  fontWeight: "bold",
                }}
                onClick={handleConfirmDeposit}
              >
                Xác nhận đã chuyển
              </Button>
            </Box>
          )}
          {!srcVietQR && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(1, minmax(0,1fr))",
                gap: "1rem",
                marginTop: "1rem",

                color: (theme) => theme.palette.text.secondary,
              }}
            >
              <form
                style={{
                  paddingTop: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  gap: "15px",
                }}
                onSubmit={handleSubmit(onSubmit)}
              >
                <FormControl
                  variant="standard"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Typography
                    sx={{
                      color: "text.primary",
                    }}
                  >
                    Số tiền
                  </Typography>
                  <Controller
                    name="soTien"
                    control={control}
                    render={({ field: { ref, ...field } }) => (
                      <OutlinedInput
                        placeholder="Số tiền"
                        size="small"
                        type="number"
                        fullWidth
                        onWheel={(e) => e.target.blur()}
                        error={errors.soTien ? true : false}
                        inputRef={ref}
                        {...field}
                      />
                    )}
                    defaultValue={""}
                  />
                  <ErrorMessageLabel>{errors.soTien ? errors.soTien.message : ""}</ErrorMessageLabel>
                </FormControl>

                <Button
                  sx={{
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                  type="submit"
                  onClick={handleSubmit(onSubmit)}
                >
                  Xác nhận
                </Button>
              </form>
            </Box>
          )}
        </>
      )}
    </>
  );
};
export default FormNap;
