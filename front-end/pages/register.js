import Layout from "@/components/Layout";
import Button from "@/components/button/Button";
import LoadingBox from "@/components/homePage/LoadingBox";
import ErrorMessageLabel from "@/components/input/ErrorMessageLabel";
import OutlinedInput from "@/components/input/OutlinedInput";
import { MIN_LENGTH_ACCOUNT, MIN_LENGTH_PASSWORD } from "@/configs/user.config";
import AuthService from "@/services/AuthService";
import { yupResolver } from "@hookform/resolvers/yup";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { Box, FormControl } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import { signIn, useSession } from "next-auth/react";
import { NextSeo } from "next-seo";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as Yup from "yup";
import { useTranslation } from "react-i18next";
const DangKy = () => {
  const { t } = useTranslation("common");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [signupStatus, setSignupStatus] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    confirmPassword: Yup.string()
      .required(t("Vui lòng nhập mật khẩu hợp lệ (từ 6 ký tự)"))
      .min(MIN_LENGTH_PASSWORD, t("Vui lòng nhập mật khẩu hợp lệ (từ 6 ký tự)"))
      .trim(t("Vui lòng nhập mật khẩu hợp lệ (từ 6 ký tự)"))
      .matches(/^\S*$/, t("Vui lòng nhập mật khẩu hợp lệ (từ 6 ký tự)"))
      .oneOf([Yup.ref("password"), null], t("Mật khẩu không khớp với nhau"))
      .strict(true),
    phone: Yup.string()
      .required(t("Vui lòng nhấp số điện thoại hợp lệ"))
      .trim(t("Vui lòng nhấp số điện thoại hợp lệ"))
      .matches(/^0\d{9,10}$/, t("Vui lòng nhấp số điện thoại hợp lệ"))
      .strict(true),
    // maGioiThieu: Yup.string()
    //   .required(t("Mã giới thiệu không được để trống"))
    //   .trim(t("Mã giới thiệu không được để trống"))
    //   .strict(true),
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
      router.push("/");
    }
  }, [status]);

  const onSubmit = async (data) => {
    try {
      setSignupStatus("loading");
      const { account, password, confirmPassword, phone, maGioiThieu } = data;
      const result = await AuthService.signUp({
        taiKhoan: account,
        matKhau: password,
        nhapLaiMatKhau: confirmPassword,
        soDienThoai: phone,
        maGioiThieu: maGioiThieu,
      });

      toast.success(t("Đăng ký tài khoản thành công"));

      setSignupStatus("success");
      reset();
      // Đăng nhập tự động
      await signIn("login", {
        taiKhoan: account,
        matKhau: password,
        redirect: false,
        callbackUrl: "/",
      });
    } catch (err) {
      setSignupStatus("error");
      toast.error(t(err?.response?.data?.message) ?? "Có lỗi khi đăng ký tài khoản");
    } finally {
      setSignupStatus(null);
    }
  };

  return (
    <>
      <NextSeo title="Tạo tài khoản" />
      <LoadingBox isSuccess={signupStatus === "success"} isLoading={signupStatus === "loading"} />
      <Layout>
        <h1 className="title-h1">{t("Đăng ký")}</h1>

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
                  placeholder={t("Tài khoản")}
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
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            ></Box>
            <Controller
              name="password"
              control={control}
              render={({ field: { ref, ...field } }) => (
                <OutlinedInput
                  placeholder={t("Mật khẩu")}
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
          <FormControl
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
              }}
            ></Box>
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field: { ref, ...field } }) => (
                <OutlinedInput
                  placeholder={t("Nhập lại mật khẩu")}
                  type={showConfirmPassword ? "text" : "password"}
                  size="small"
                  fullWidth
                  error={errors.confirmPassword ? true : false}
                  endAdornment={
                    <InputAdornment position="start">
                      <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  inputRef={ref}
                  {...field}
                />
              )}
              defaultValue=""
            />
            <ErrorMessageLabel>{errors.confirmPassword ? errors.confirmPassword.message : ""}</ErrorMessageLabel>
          </FormControl>

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
                  placeholder={t("Số điện thoại")}
                  type={"text"}
                  size="small"
                  fullWidth
                  error={errors.phone ? true : false}
                  inputRef={ref}
                  {...field}
                />
              )}
              defaultValue=""
            />
            <ErrorMessageLabel>{errors.phone ? errors.phone.message : ""}</ErrorMessageLabel>
          </FormControl>

          {/* <FormControl
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Controller
              name="maGioiThieu"
              control={control}
              render={({ field: { ref, ...field } }) => (
                <OutlinedInput
                  placeholder={t("Mã giới thiệu")}
                  type={"text"}
                  size="small"
                  fullWidth
                  inputRef={ref}
                  {...field}
                />
              )}
              defaultValue=""
            />
          </FormControl> */}

          <Button type="submit" onClick={handleSubmit(onSubmit)} variant="contained">
            {t("Đăng ký")}
          </Button>
        </form>
      </Layout>
    </>
  );
};

export default DangKy;
