import { OptionMenu, OptionMenuItem } from "@/custom/optionMenu";
import ListBankService from "@/services/ListBankService";
import { listBank } from "@/utils/listBank";
import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, FormControl, Select, Typography } from "@mui/material";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as Yup from "yup";
import LoadingBox from "../homePage/LoadingBox";
import ErrorMessageLabel from "../input/ErrorMessageLabel";
import OutlinedInput from "../input/OutlinedInput";
import { useTranslation } from 'react-i18next';

const AddBank = () => {
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = useState(false);
  // form validation rules
  const validationSchema = Yup.object().shape({
    chuTaiKhoan: Yup.string()
      .required(t('Invalid bank'))
      .trim(t('Invalid bank'))
      .strict(true),
    soTaiKhoan: Yup.string().required(t('Invalid bank')).trim(t('Invalid bank')).strict(true),
    tenNganHang: Yup.string().required(t('Invalid bank')),
  });
  const formOptions = { resolver: yupResolver(validationSchema) };

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
    reset,
  } = useForm(formOptions);

  const onSubmit = async (data) => {
    try {
      // check ngân hàng hợp lệ
      const nganHangID = data.tenNganHang;
      const checkNganHangID = listBank.find((item) => item.bin === nganHangID);

      if (!checkNganHangID) {
        toast.error(t('Invalid bank'));
        return;
      }
      setIsLoading(true);
      const result = await ListBankService.addUserBank({
        tenNganHang: checkNganHangID.shortName,
        bankCode: nganHangID,
        tenChuTaiKhoan: data.chuTaiKhoan,
        soTaiKhoan: data.soTaiKhoan,
      });
      toast.success(t('Add bank success'));
      reset();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Có lỗi xảy ra khi thêm ngân hàng");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isLoading && <LoadingBox isLoading={isLoading} />}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(1, minmax(0,1fr))",
          gap: "1rem",
          marginTop: "1rem",
          padding: "0px 2rem",

          color: (theme) => theme.palette.text.primary,
        }}
      >
        <form
          style={{
            paddingTop: "5rem",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "1.5rem",
          }}
          onSubmit={handleSubmit(onSubmit)}
        >
          <FormControl
            variant="standard"
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
            error={errors.tenNganHang ? true : false}
          >
            <Typography
              sx={{
                marginBottom: "1rem",
              }}
            >
              {t('Bank')}
            </Typography>
            <Controller
              name="tenNganHang"
              control={control}
              render={({ field: { ref, ...field } }) => (
                <Select
                  labelId="select-bank"
                  id="select-bank-option"
                  {...register("tenNganHang")}
                  label={t('Bank')}
                  input={<OptionMenu />}
                  inputRef={ref}
                  {...field}
                >
                  <OptionMenuItem value="">
                    <em>None</em>
                  </OptionMenuItem>
                  {listBank.map((item, i) => (
                    <OptionMenuItem key={item.bin} value={item.bin}>
                      {item.shortName}
                    </OptionMenuItem>
                  ))}
                </Select>
              )}
              defaultValue=""
            />
            <ErrorMessageLabel>{errors.tenNganHang ? errors.tenNganHang.message : ""}</ErrorMessageLabel>
          </FormControl>
          <FormControl
            variant="standard"
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Controller
              name="chuTaiKhoan"
              control={control}
              render={({ field: { ref, ...field } }) => (
                <OutlinedInput
                  placeholder={t('Bank Owner')}
                  size="small"
                  fullWidth
                  error={errors.chuTaiKhoan ? true : false}
                  inputRef={ref}
                  {...field}
                />
              )}
              defaultValue=""
            />
            <ErrorMessageLabel>{errors.chuTaiKhoan ? errors.chuTaiKhoan.message : ""}</ErrorMessageLabel>
          </FormControl>
          <FormControl
            variant="standard"
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Controller
              name="soTaiKhoan"
              control={control}
              render={({ field: { ref, ...field } }) => (
                <OutlinedInput
                  placeholder={t('Bank Number')}
                  size="small"
                  fullWidth
                  error={errors.soTaiKhoan ? true : false}
                  inputRef={ref}
                  {...field}
                />
              )}
              defaultValue=""
            />
            <ErrorMessageLabel>{errors.soTaiKhoan ? errors.soTaiKhoan.message : ""}</ErrorMessageLabel>
          </FormControl>

          <Button
            sx={{
              fontSize: "2rem",
              fontWeight: "bold",
            }}
            type="submit"
          >
            {t('Add')}
          </Button>
        </form>
      </Box>
    </>
  );
};
export default AddBank;
