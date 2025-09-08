import { Backdrop, Box, Button, CircularProgress, FormControl, Typography } from "@mui/material";

import ErrorMessageLabel from "@/components/input/ErrorMessageLabel";
import OutlinedInput from "@/components/input/OutlinedInput";
import { yupResolver } from "@hookform/resolvers/yup";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as Yup from "yup";

const FormSlide = ({ data, handleOnSubmit }) => {
  const [isLoading, setIsLoading] = useState(false);

  // form validation rules
  const validationSchema = Yup.object().shape({
    hinhAnh: Yup.string().required("Vui lòng nhập link ảnh").trim("Link ảnh không hợp lệ").strict(true),
  });
  const formOptions = { resolver: yupResolver(validationSchema) };

  const {
    control,
    handleSubmit,
    formState: { errors },
    register,
    reset,
  } = useForm(formOptions);

  const onSubmit = async ({ hinhAnh }) => {
    try {
      setIsLoading(true);
      const results = await handleOnSubmit({
        hinhAnh,
      });

      toast.success(results?.data?.message);
    } catch (err) {
      toast.error(err?.response?.data?.message);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Backdrop sx={{ color: "#fff", zIndex: 99999 }} open={isLoading}>
        <CircularProgress color="inherit" />
      </Backdrop>

      <form
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          gap: "1.5rem",
        }}
        onSubmit={handleSubmit(onSubmit)}
      >
        <Box
          sx={{
            color: (theme) => theme.palette.text.secondary,

            display: "flex",
            flexDirection: "column",
            width: "100%",
            gap: "1.5rem",
          }}
        >
          <FormControl
            variant="standard"
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography>Link ảnh</Typography>
            <Controller
              name="hinhAnh"
              control={control}
              render={({ field: { ref, ...field } }) => (
                <OutlinedInput
                  placeholder="Link hình ảnh"
                  size="small"
                  fullWidth
                  error={errors.hinhAnh ? true : false}
                  inputRef={ref}
                  {...field}
                />
              )}
              defaultValue={data?.hinhAnh ?? ""}
            />
            <ErrorMessageLabel>{errors.hinhAnh ? errors.hinhAnh.message : ""}</ErrorMessageLabel>
          </FormControl>

          <Box
            sx={{
              textAlign: "center",
            }}
          >
            <Button type="submit" onClick={handleSubmit(onSubmit)}>
              Xác nhận
            </Button>
          </Box>
        </Box>
      </form>
    </>
  );
};
export default FormSlide;
