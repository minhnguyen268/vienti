import { MIN_LENGTH_PASSWORD } from "@/configs/user.config";
import { OptionMenu, OptionMenuItem } from "@/custom/optionMenu";
import WithdrawService from "@/services/WithdrawService";
import { yupResolver } from "@hookform/resolvers/yup";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Box, Button, FormControl, Select, Typography } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as Yup from "yup";
import LoadingBox from "../homePage/LoadingBox";
import ErrorMessageLabel from "../input/ErrorMessageLabel";
import OutlinedInput from "../input/OutlinedInput";
import { useTranslation } from 'react-i18next';

const FormWithdraw = ({ listBank }) => {
  const { t } = useTranslation('common');
  const getBalance = useSelector((state) => state.balance.balance);
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswordWithdraw, setShowPasswordWithdraw] = useState(false);

  // form validation rules
  const validationSchema = Yup.object().shape({
    soTien: Yup.number()
      .typeError(t('Please enter a valid amount'))
      .required(t('Please enter a valid amount'))
      .min(1, t('Please enter an amount of at least 1')),
    nganHang: Yup.string().required(t('Please select a bank')),
    matKhauRutTien: Yup.string()
      .required(t('Please enter your withdrawal password'))
      .min(MIN_LENGTH_PASSWORD, `${t('The withdrawal password must be at least')} ${MIN_LENGTH_PASSWORD} ${t('characters')}`)
      .trim(t('The withdrawal password is invalid'))
      .matches(/^\S*$/, t('The withdrawal password is invalid'))
      .strict(true),
  });
  const formOptions = { resolver: yupResolver(validationSchema) };

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
    reset,
  } = useForm(formOptions);
  const onSubmit = async ({ soTien, nganHang, matKhauRutTien }) => {
    try {
      if (getBalance < soTien) {
        toast.error(t("Không đủ tiền để thực hiện hành động này"));
        return;
      }
      setIsLoading(true);
      const result = await WithdrawService.createWithdraw({
        soTien,
        nganHang,
        matKhauRutTien,
      });
      toast.success(t("Tạo yêu cầu rút tiền thành công"));
      reset();
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      toast.error(t(err?.response?.data?.message) ?? "Có lỗi xảy ra khi tạo yêu cầu rút tiền");
    }
  };

  return (
    <>
      <LoadingBox isLoading={isLoading} />
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(1, minmax(0,1fr))",
          gap: "10px",

          padding: "0px 20px",

          color: "text.primary",
        }}
      >
        <form
          style={{
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
            error={errors.tenNganHang}
          >
            <Typography
              sx={{
                marginBottom: "10px",
              }}
            >
              {t("Bank")}
            </Typography>
            <Controller
              name="nganHang"
              control={control}
              render={({ field: { ref, ...field } }) => (
                <Select
                  inputRef={ref}
                  labelId="select-bank"
                  id="select-bank-option"
                  label={t("Bank")}
                  input={<OptionMenu />}
                  {...field}
                >
                  <OptionMenuItem value="">
                    <em>{t('Choose your bank')}</em>
                  </OptionMenuItem>
                  {listBank.map((item, i) => (
                    <OptionMenuItem key={item._id} value={item._id}>
                      {item.tenNganHang} - {item.tenChuTaiKhoan} - {item.soTaiKhoan}
                    </OptionMenuItem>
                  ))}
                </Select>
              )}
              defaultValue=""
            />
            <ErrorMessageLabel>{errors.nganHang ? errors.nganHang.message : ""}</ErrorMessageLabel>
          </FormControl>
          <FormControl
            variant="standard"
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Controller
              name="soTien"
              control={control}
              render={({ field: { ref, ...field } }) => (
                <OutlinedInput
                  inputRef={ref}
                  placeholder={t('Amount to withdraw')}
                  size="small"
                  type="number"
                  fullWidth
                  error={errors.soTien ? true : false}
                  onWheel={(e) => e.target.blur()}
                  {...field}
                />
              )}
              defaultValue=""
            />
            <ErrorMessageLabel>{errors.soTien ? errors.soTien.message : ""}</ErrorMessageLabel>
          </FormControl>

          <FormControl
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Controller
              name="matKhauRutTien"
              control={control}
              render={({ field: { ref, ...field } }) => (
                <OutlinedInput
                  placeholder={t('Withdraw password')}
                  type={showPasswordWithdraw ? "text" : "password"}
                  size="small"
                  fullWidth
                  error={errors.matKhauRutTien ? true : false}
                  endAdornment={
                    <InputAdornment position="start">
                      <IconButton onClick={() => setShowPasswordWithdraw(!showPasswordWithdraw)} edge="end">
                        {showPasswordWithdraw ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  inputRef={ref}
                  {...field}
                />
              )}
              defaultValue=""
            />
            <ErrorMessageLabel>{errors.matKhauRutTien ? errors.matKhauRutTien.message : ""}</ErrorMessageLabel>
          </FormControl>

          <Button
            sx={{
              fontSize: "2rem",
              fontWeight: "bold",
            }}
            type="submit"
          >
            {t("Withdraw")}
          </Button>
        </form>
      </Box>
    </>
  );
};
export default FormWithdraw;
