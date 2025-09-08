import Layout from "@/components/Layout";
import Button from "@/components/button/Button";
import LoadingBox from "@/components/homePage/LoadingBox";
import ErrorMessageLabel from "@/components/input/ErrorMessageLabel";
import OutlinedInput from "@/components/input/OutlinedInput";
import { MIN_LENGTH_PASSWORD } from "@/configs/user.config";
import UserService from "@/services/UserService";
import { yupResolver } from "@hookform/resolvers/yup";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { FormControl, IconButton, InputAdornment } from "@mui/material";
import { useSession } from "next-auth/react";
import { NextSeo } from "next-seo";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as Yup from "yup";
import useGetInformationUser from "@/hooks/useGetInformationUser";
import { useTranslation } from 'react-i18next';

const Phone = () => {
  const { t } = useTranslation('common');
  const { data: session, status } = useSession();
  const [loginStatus, setLoginStatus] = useState(null);
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const { data, isLoading } = useGetInformationUser();

  // form validation rules
  const validationSchema = Yup.object().shape({
    phone: Yup.string()
      .required(t('Invalid phone number'))
      .trim(t('Invalid phone number'))
      .matches(/^0\d{9,10}$/, t('Invalid phone number'))
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

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/";
    }
  }, [status]);

  const onSubmit = async (data) => {
    try {
      setLoginStatus("loading");
      const result = await UserService.changePhone(data.phone);
      toast.success(t(result?.data?.message) ?? t('Change phone number success'));
      setLoginStatus("success");
      reset();
    } catch (err) {
      toast.error(err?.response?.data?.message);
      console.log(err);
    }
  };

  if (isLoading) return;

  return (
    <>
      <NextSeo title="Đổi mật khẩu" />
      <LoadingBox isSuccess={loginStatus === "success"} isLoading={loginStatus === "loading"} />
      <Layout>
        <h1 className="title-h1">{t('Change phone number')}</h1>

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
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Controller
              name="phone"
              control={control}
              render={({ field: { ref, ...field } }) => (
                <OutlinedInput
                  placeholder={t("Phone number")}
                  type={"text"}
                  size="small"
                  fullWidth
                  error={errors.phone ? true : false}
                  inputRef={ref}
                  {...field}
                />
              )}
              defaultValue={data.soDienThoai}
            />
            <ErrorMessageLabel>{errors.phone ? errors.phone.message : ""}</ErrorMessageLabel>
          </FormControl>

          <Button type="submit" onClick={handleSubmit(onSubmit)} variant="contained">
            {t('Confirm')}
          </Button>
        </form>
      </Layout>
    </>
  );
};

export default Phone;
