import OutlinedInput from "@/components/input/OutlinedInput";
import { MIN_LENGTH_PASSWORD, ROLE_USER, TINH_TRANG_USER, convertRole } from "@/configs/user.config";
import { OptionMenu, OptionMenuItem } from "@/custom/optionMenu";
import { InputComponent } from "@/custom/textfield";
import useGetDetailedUser from "@/hooks/admin/useGetDetailedUser";
import UserService from "@/services/admin/UserService";
import { convertJSXMoney } from "@/utils/convertMoney";
import { convertDateTime } from "@/utils/convertTime";
import { convertTinhTrangUser } from "@/utils/convertTinhTrang";
import { Backdrop, Box, Button, Card, CircularProgress, FormControl, Select, Typography } from "@mui/material";
import _, { set } from "lodash";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import BreadcrumbBar from "../BreadcrumbBar";
import { useSession } from "next-auth/react";

const listStatus = Object.keys(TINH_TRANG_USER).map((key) => {
  return {
    tenStatus: convertTinhTrangUser(TINH_TRANG_USER[key]),
    value: TINH_TRANG_USER[key],
  };
});

const listRole = Object.keys(ROLE_USER).map((key) => {
  return {
    ten: convertRole(ROLE_USER[key]),
    value: ROLE_USER[key],
  };
});

const VipLevels = [0, 1, 2, 3, 4, 5, 6];

const DetailedUser = ({ ID }) => {
  const { data: session } = useSession();

  const BreadcrumbData = [
    {
      title: "Admin",
      href: "/admin",
    },
    {
      title: "Quản lý người dùng",
      href: "/admin/users",
    },
    {
      title: "Chi tiết",
      href: "/admin/users/" + ID,
    },
  ];
  const { data: dataQuery, isLoading, refetch } = useGetDetailedUser({ id: ID });

  if (dataQuery?.role === ROLE_USER.ADMIN && session?.user?.role !== ROLE_USER.ADMIN) {
    window.location.href = "/admin/users";
  }

  const [isLoadingState, setIsLoadingState] = useState(false);
  const [status, setStatus] = useState(dataQuery?.status ?? true);
  const [role, setRole] = useState(dataQuery?.role ?? ROLE_USER.USER);
  const [money, setMoney] = useState(dataQuery?.money ?? 0);
  const [taiKhoan, setTaiKhoan] = useState(dataQuery?.taiKhoan ?? 0);
  const [soDienThoai, setSoDienThoai] = useState(dataQuery?.soDienThoai ?? 0);
  const [maGioiThieu, setMaGioiThieu] = useState(dataQuery?.maGioiThieu ?? "");
  const [vip, setVip] = useState(dataQuery?.vipLevel ?? 0);
  const [congTien, setCongTien] = useState(0);
  const [truTien, setTruTien] = useState(0);
  const [password, setPassword] = useState("");
  const [passwordWithdraw, setPasswordWithdraw] = useState("");

  useEffect(() => {
    if (dataQuery) {
      console.log(dataQuery);
      setStatus(dataQuery?.status ?? true);
      setRole(dataQuery?.role ?? ROLE_USER.USER);
      setMoney(dataQuery?.money ?? 0);
      setTaiKhoan(dataQuery?.taiKhoan ?? 0);
      setSoDienThoai(dataQuery?.soDienThoai ?? 0);
      setVip(dataQuery?.vipLevel ?? 0);
      setMaGioiThieu(dataQuery?.referralCode ?? "");
    }
  }, [dataQuery]);

  const handleChangeStatus = (e) => {
    setStatus(e.target.value);
  };
  const handleChangeRole = (e) => {
    setRole(e.target.value);
  };
  const handleChangeCongTien = (e) => {
    let parseValue = parseInt(e.target.value);

    if (isNaN(parseValue)) {
      parseValue = 0;
    }
    setCongTien(parseValue);
  };
  const handleChangeTruTien = (e) => {
    let parseValue = parseInt(e.target.value);

    if (isNaN(parseValue)) {
      parseValue = 0;
    }
    setTruTien(parseValue);
  };
  const handleChangePassword = (e) => {
    setPassword(e.target.value);
  };
  const handleChangePasswordWithdraw = (e) => {
    setPasswordWithdraw(e.target.value);
  };
  const handleClickCongTruTien = async (type = 1) => {
    try {
      let moneyUpdate = type === 1 ? congTien : truTien;
      if (!_.isNumber(moneyUpdate) || moneyUpdate <= 0) {
        toast.error("Vui lòng nhập tiền hợp lệ");
        return;
      }
      setIsLoadingState(true);
      const res = await UserService.updateMoneyUser({
        userId: ID,
        moneyUpdate: type === 1 ? moneyUpdate : -moneyUpdate,
      });
      toast.success(res?.data?.message);
      if (type === 1) {
        setCongTien(0);
      } else {
        setTruTien(0);
      }
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Có lỗi khi cập nhật tiền");
    } finally {
      setIsLoadingState(false);
    }
  };

  const handleClickChangeInfo = async () => {
    try {
      if (!role) {
        toast.error("Vui lòng nhập đầy đủ thông tin");
        return;
      }
      if (!Object.values(ROLE_USER).includes(role)) {
        toast.error(`Vui lòng nhập đầy đủ thông tin`);
        return;
      }
      setIsLoadingState(true);
      const res = await UserService.updateInformationUser({
        userId: ID,
        status,
        role,
        money: money,
        soDienThoai: soDienThoai,
        taiKhoan: taiKhoan,
        referralCode: maGioiThieu,
        vipLevel: vip,
      });
      toast.success(res?.data?.message ?? "Cập nhật thông tin thành công");
      refetch();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Có lỗi khi cập nhật thông tin");
    } finally {
      setIsLoadingState(false);
    }
  };

  const handleClickChangePassword = async () => {
    try {
      if (!password) {
        toast.error("Vui lòng nhập mật khẩu hợp lệ");
        return;
      }
      if (password.trim().length < MIN_LENGTH_PASSWORD) {
        toast.error(`Vui lòng nhập mật khẩu từ ${MIN_LENGTH_PASSWORD} kí tự trở lên`);
        return;
      }
      setIsLoadingState(true);
      const res = await UserService.updatePasswordUser({
        userId: ID,
        newPassword: password.trim(),
      });
      toast.success(res?.data?.message ?? "Cập nhật mật khẩu thành công");
      setPassword("");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Có lỗi khi cập nhật mật khẩu");
    } finally {
      setIsLoadingState(false);
    }
  };
  const handleClickChangePasswordWithdraw = async () => {
    try {
      if (!passwordWithdraw) {
        toast.error("Vui lòng nhập mật khẩu rút tiền hợp lệ");
        return;
      }
      if (passwordWithdraw.trim().length < MIN_LENGTH_PASSWORD) {
        toast.error(`Vui lòng nhập mật khẩu từ ${MIN_LENGTH_PASSWORD} kí tự trở lên`);
        return;
      }
      setIsLoadingState(true);
      const res = await UserService.updatePasswordWithdrawUser({
        userId: ID,
        newPassword: passwordWithdraw.trim(),
      });
      toast.success(res?.data?.message ?? "Cập nhật mật khẩu rút tiền thành công");
      setPassword("");
    } catch (err) {
      toast.error(err?.response?.data?.message ?? "Có lỗi khi cập nhật mật khẩu rút tiền");
    } finally {
      setIsLoadingState(false);
    }
  };

  return (
    <>
      <BreadcrumbBar data={BreadcrumbData} />
      <h1
        className="title admin"
        style={{
          fontSize: "2.5rem",
        }}
      >
        Chi Tiết Người Dùng
      </h1>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          width: "100%",
          maxWidth: "60rem",
          gap: "1rem",
          color: (theme) => theme.palette.text.secondary,
        }}
      >
        {isLoadingState && (
          <Backdrop sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isLoadingState}>
            <CircularProgress color="inherit" />
          </Backdrop>
        )}
        {isLoading && <CircularProgress color="inherit" />}
        {dataQuery && (
          <>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(1, minmax(0,1fr))",
                  sm: "repeat(2, minmax(0,1fr))",
                },
                gap: "2rem",
              }}
            >
              <Card
                sx={{
                  backgroundColor: "#ffffff",
                  color: "#201c58",
                  height: "22rem",

                  display: "flex",

                  padding: "2rem",

                  minWidth: "20rem",

                  boxShadow: "-1px 2px 14px 5px #edf0f8",
                  borderRadius: "3rem",
                }}
              >
                <Box
                  sx={{
                    display: "flex",

                    width: "100%",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{
                      width: "4rem",
                      height: "4rem",
                      position: "relative",
                    }}
                  >
                    <Image src="https://i.imgur.com/EYUoMLa.png" layout="fill" />
                  </Box>

                  <Typography
                    component="span"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "2rem",
                    }}
                  >
                    {convertJSXMoney(dataQuery.tienCuoc)}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "1.5rem",
                    }}
                  >
                    Tổng tiền cược
                  </Typography>
                </Box>
              </Card>
              <Card
                sx={{
                  backgroundColor: "#ffffff",
                  color: "#201c58",
                  height: "22rem",

                  display: "flex",

                  padding: "2rem",

                  minWidth: "20rem",

                  boxShadow: "-1px 2px 14px 5px #edf0f8",
                  borderRadius: "3rem",
                }}
              >
                <Box
                  sx={{
                    display: "flex",

                    width: "100%",
                    flexDirection: "column",
                  }}
                >
                  <Box
                    sx={{
                      width: "4rem",
                      height: "4rem",
                      position: "relative",
                    }}
                  >
                    <Image src="https://i.imgur.com/QD9tfI3.png" layout="fill" />
                  </Box>

                  <Typography
                    component="span"
                    sx={{
                      fontWeight: "bold",
                      fontSize: "2rem",
                    }}
                  >
                    {convertJSXMoney(dataQuery.tienThang)}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "1.5rem",
                    }}
                  >
                    Tổng tiền thắng
                  </Typography>
                </Box>
              </Card>
            </Box>
            <FormControl fullWidth>
              <Typography>Tài khoản</Typography>
              <OutlinedInput
                placeholder="Tài khoản"
                size="small"
                type="text"
                fullWidth
                value={taiKhoan}
                onChange={(e) => setTaiKhoan(e.target.value)}
              />
            </FormControl>
            <FormControl fullWidth>
              <Typography>Số điện thoại</Typography>
              <OutlinedInput
                placeholder="Số điện thoại"
                size="small"
                type="text"
                fullWidth
                value={soDienThoai}
                onChange={(e) => setSoDienThoai(e.target.value)}
              />
            </FormControl>
            <FormControl fullWidth>
              <Typography>Số tiền</Typography>
              <InputComponent
                placeholder="Số tiền"
                size="small"
                fullWidth
                value={money}
                type="number"
                onChange={(e) => {
                  let parseValue = parseInt(e.target.value);

                  if (isNaN(parseValue)) {
                    parseValue = 0;
                  }
                  setMoney(parseValue);
                }}
                // disabled
              />
            </FormControl>
            <FormControl fullWidth>
              <Typography>Thời gian tạo</Typography>
              <InputComponent
                placeholder="Thời gian tạo"
                size="small"
                type=""
                fullWidth
                value={convertDateTime(dataQuery?.createdAt)}
                disabled
              />
            </FormControl>
            <FormControl fullWidth>
              <Typography>Tình trạng</Typography>

              <Select
                labelId="select-status"
                id="select-status-option"
                label="Status"
                input={<OptionMenu />}
                value={status}
                onChange={handleChangeStatus}
              >
                {listStatus.map((item, i) => (
                  <OptionMenuItem key={item.value} value={item.value}>
                    {item.tenStatus}
                  </OptionMenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <Typography>Phân quyền</Typography>

              <Select
                labelId="select-role"
                id="select-role-option"
                label="Role"
                input={<OptionMenu />}
                value={role}
                onChange={handleChangeRole}
              >
                {listRole.map((item, i) => (
                  <OptionMenuItem key={item.value} value={item.value}>
                    {item.ten}
                  </OptionMenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <Typography>Mã giới thiệu</Typography>
              <OutlinedInput
                placeholder="Mã giới thiệu"
                size="small"
                type="text"
                fullWidth
                value={maGioiThieu}
                onChange={(e) => setMaGioiThieu(e.target.value)}
              />
            </FormControl>

            <FormControl fullWidth>
              <Typography>Vip</Typography>

              <Select
                labelId="select-vip"
                id="select-vip-option"
                label="Vip"
                input={<OptionMenu />}
                value={vip}
                onChange={(e) => setVip(e.target.value)}
              >
                {VipLevels.map((level) => (
                  <OptionMenuItem key={level} value={level}>
                    {level}
                  </OptionMenuItem>
                ))}
              </Select>
            </FormControl>

            <Button onClick={handleClickChangeInfo}>Chỉnh sửa</Button>

            <FormControl fullWidth>
              <Typography>Cộng tiền</Typography>
              <InputComponent
                placeholder="Số tiền"
                size="small"
                type="number"
                fullWidth
                onWheel={(e) => e.target.blur()}
                value={congTien}
                onChange={handleChangeCongTien}
              />
            </FormControl>
            <Button onClick={() => handleClickCongTruTien(1)}>Cộng</Button>
            <FormControl fullWidth>
              <Typography>Trừ tiền</Typography>
              <InputComponent
                placeholder="Số tiền"
                size="small"
                type="number"
                fullWidth
                onWheel={(e) => e.target.blur()}
                value={truTien}
                onChange={handleChangeTruTien}
              />
            </FormControl>
            <Button onClick={() => handleClickCongTruTien(2)}>Trừ</Button>
            <FormControl fullWidth>
              <Typography>Đổi mật khẩu</Typography>
              <InputComponent
                placeholder="Mật khẩu"
                size="small"
                type="text"
                fullWidth
                value={password}
                onChange={handleChangePassword}
              />
            </FormControl>
            <Button onClick={handleClickChangePassword}>Đổi</Button>
            <FormControl fullWidth>
              <Typography>Đổi mật khẩu rút tiền</Typography>
              <InputComponent
                placeholder="Mật khẩu rút tiền"
                size="small"
                type="text"
                fullWidth
                value={passwordWithdraw}
                onChange={handleChangePasswordWithdraw}
              />
            </FormControl>
            <Button onClick={handleClickChangePasswordWithdraw}>Đổi</Button>
          </>
        )}
      </Box>
    </>
  );
};
export default DetailedUser;
