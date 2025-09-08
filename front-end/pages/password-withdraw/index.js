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

const ChangePassword = () => {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [gameStatus, setStatus] = useState(null);
  const [showPassword, setShowPassword] = useState({
    withdrawPassword: false,
  });

  // form validation rules
  const validationSchema = Yup.object().shape({
    withdrawPassword: Yup.string()
      .required("Vui lòng nhập mật khẩu rút tiền")
      .min(MIN_LENGTH_PASSWORD, `Mật khẩu rút tiền phải từ ${MIN_LENGTH_PASSWORD} kí tự trở lên`)
      .trim("Mật khẩu rút tiền không hợp lệ")
      .matches(/^\S*$/, "Mật khẩu rút tiền không hợp lệ")
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

  const checkUserHasWithdrawPassword = async () => {
    try {
      setIsLoading(true);
      const res = await UserService.checkHasPasswordWithdraw();
      const isHasPassword = res.data?.data ?? false;
      if (isHasPassword) {
        window.location.href = "/";
        return;
      }
    } catch (err) {
      console.log(err);
      window.location.href = "/";
      return;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/";
    } else {
      checkUserHasWithdrawPassword();
    }
  }, [status]);

  const onSubmit = async (data) => {
    try {
      setStatus("loading");
      const { withdrawPassword } = data;
      const result = await UserService.updatePasswordRutTien({
        matKhauRutTien: withdrawPassword,
      });
      toast.success(result?.data?.message ?? "Cập nhật mật khẩu rút tiền thành công");
      setStatus("success");
      reset();
      window.location.href = "/";
    } catch (err) {
      toast.error(err?.response?.data?.message);
      console.log(err);
    } finally {
      setStatus(null);
    }
  };

  return (
    <>
      <NextSeo title="Cập nhật mật khẩu rút tiền" />
      <LoadingBox isSuccess={gameStatus === "success"} isLoading={gameStatus === "loading" || isLoading} />
      <Layout>
        <h1 className="title-h1">Cập nhật mật khẩu rút tiền</h1>

        {!isLoading && (
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
                name="withdrawPassword"
                control={control}
                render={({ field: { ref, ...field } }) => (
                  <OutlinedInput
                    placeholder="Mật khẩu rút tiền"
                    type={showPassword.withdrawPassword ? "text" : "password"}
                    size="small"
                    fullWidth
                    error={errors.withdrawPassword ? true : false}
                    endAdornment={
                      <InputAdornment position="start">
                        <IconButton
                          onClick={() =>
                            setShowPassword((prev) => ({ ...prev, withdrawPassword: !showPassword.withdrawPassword }))
                          }
                          edge="end"
                        >
                          {showPassword.withdrawPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    }
                    inputRef={ref}
                    {...field}
                  />
                )}
                defaultValue=""
              />
              <ErrorMessageLabel>{errors.withdrawPassword ? errors.withdrawPassword.message : ""}</ErrorMessageLabel>
            </FormControl>

            <Button type="submit" onClick={handleSubmit(onSubmit)} variant="contained">
              Xác nhận
            </Button>
          </form>
        )}
      </Layout>
    </>
  );
};

export default ChangePassword;
