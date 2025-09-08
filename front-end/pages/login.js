import { MIN_LENGTH_ACCOUNT, MIN_LENGTH_PASSWORD } from "@/configs/user.config";
import { yupResolver } from "@hookform/resolvers/yup";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { FormControl, IconButton, InputAdornment } from "@mui/material";
import { signIn, useSession } from "next-auth/react";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as Yup from "yup";
import Layout from "../components/Layout";
import Button from "../components/button/Button";
import LoadingBox from "../components/homePage/LoadingBox";
import ErrorMessageLabel from "../components/input/ErrorMessageLabel";
import OutlinedInput from "../components/input/OutlinedInput";
import { useTranslation } from 'react-i18next';

const Login = ({ callbackUrl }) => {
  const { t } = useTranslation('common');
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loginStatus, setLoginStatus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // form validation rules
  const validationSchema = Yup.object().shape({
    account: Yup.string()
      .required(t("Vui lòng nhập tài khoản hợp lệ (từ 6 ký tự)"))
      .min(MIN_LENGTH_ACCOUNT, t("Vui lòng nhập tài khoản hợp lệ (từ 6 ký tự)"))
      .trim(t("Vui lòng nhập tài khoản hợp lệ (từ 6 ký tự)"))
      .matches(/^\S*$/, t("Vui lòng nhập tài khoản hợp lệ (từ 6 ký tự)"))
      .strict(true),
    password: Yup.string()
      .required(t("Vui lòng nhập mật khẩu hợp lệ (từ 6 ký tự)"))
      .min(MIN_LENGTH_PASSWORD, t("Vui lòng nhập mật khẩu hợp lệ (từ 6 ký tự)"))
      .trim(t("Vui lòng nhập mật khẩu hợp lệ (từ 6 ký tự)"))
      .matches(/^\S*$/, t("Vui lòng nhập mật khẩu hợp lệ (từ 6 ký tự)"))
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
    if (status === "authenticated") {
      router.push(callbackUrl);
    }
  }, [status]);

  const onSubmit = async (data) => {
    try {
      setLoginStatus("loading");
      const { account, password } = data;
      const result = await signIn("login", {
        taiKhoan: account,
        matKhau: password,
        redirect: false,
        callbackUrl: "/",
      });

      if (result.error) {
        throw new Error(result?.error ?? "Có lỗi xảy ra khi đăng nhập");
      }
      setLoginStatus("success");
    } catch (err) {
      toast.error(err?.message);
      console.log(err);
    } finally {
      setLoginStatus(null);
    }
  };

  return (
    <>
      <NextSeo title="Đăng nhập tài khoản" />
      <LoadingBox isSuccess={loginStatus === "success"} isLoading={loginStatus === "loading"} />
      <Layout>
        <h1 className="title-h1">{t('Login')}</h1>

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
          >
            <Controller
              name="account"
              control={control}
              render={({ field: { ref, ...field } }) => (
                <OutlinedInput
                  placeholder={t('Account')}
                  size="small"
                  fullWidth
                  error={errors.account ? true : false}
                  inputRef={ref}
                  {...field}
                />
              )}
              defaultValue=""
            />
            <ErrorMessageLabel>{errors.account ? errors.account.message : ""}</ErrorMessageLabel>
          </FormControl>
          <FormControl
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Controller
              name="password"
              control={control}
              render={({ field: { ref, ...field } }) => (
                <OutlinedInput
                  placeholder={t('Password')}
                  type={showPassword ? "text" : "password"}
                  size="small"
                  fullWidth
                  error={errors.password ? true : false}
                  endAdornment={
                    <InputAdornment position="start">
                      <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  inputRef={ref}
                  {...field}
                />
              )}
              defaultValue=""
            />
            <ErrorMessageLabel>{errors.password ? errors.password.message : ""}</ErrorMessageLabel>
          </FormControl>
          <Button type="submit" onClick={handleSubmit(onSubmit)} variant="contained">
            {t('Login')}
          </Button>
        </form>
      </Layout>
    </>
  );
};

export default Login;

export const getServerSideProps = async (context) => {
  const { req, res, query } = context;
  const { callbackUrl } = query;
  return {
    props: {
      callbackUrl: callbackUrl ?? "/",
    },
  };
};
