import { Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import SettingService from "@/services/admin/SettingService";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { toast } from "react-toastify";
import { convertJSXMoney } from "@/utils/convertMoney";
import { useSelector } from "react-redux";

const TitleLeft = styled(Box)(({ theme }) => ({
  backgroundColor: "#dbb579",
  height: "2.3rem",
  position: "absolute",
  top: "-12px",
  transform: "translate(-50%)",
  clipPath: "polygon(50% 0,100% 0,50% 50%,100% 100%,50% 100%,0 50%)",
  left: "calc(50% - 50px)",
  width: "1rem",
}));
const TitleCenter = styled(TitleLeft)(({ theme }) => ({
  backgroundColor: "#dbb579",
  clipPath: "polygon(7% 0,93% 0,100% 50%,93% 100%,7% 100%,0 50%)",
  width: "unset",
  fontSize: "1.5rem",
  left: "50%",
  textAlign: "center",
  padding: "0 10px",
}));
const TitleRight = styled(TitleLeft)(({ theme }) => ({
  clipPath: "polygon(50% 0,100% 0,50% 50%,100% 100%,50% 100%,0 50%)",

  left: "calc(50% + 50px)",
  transform: "translate(-50%) rotate(180deg)",

  textAlign: "center",
}));

const TransactionBox = styled(Box)(({ theme }) => ({
  position: "absolute",
  bottom: "-3.5rem",
  left: "50%",
  transform: "translateX(-50%)",
  display: "flex",

  background: "linear-gradient(180deg,#efdaaf,#dbb579)",

  padding: "1rem",
  borderRadius: "1rem",
  fontSize: "1.5rem",

  "& .item": {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "0 1.5rem",
    gap: "1rem",
    "&:first-of-type": {
      borderRight: "1px solid",
    },
    "& p": {
      textWrap: "nowrap",
    },
  },
}));

const SplitBorder = styled(Box)(({ theme }) => ({
  left: "50%",

  position: "absolute",
  textAlign: "center",
  top: 0,
  transform: "translate(-50%)",
  width: "100%",
  "& span": {
    display: "inline-block",
    position: "relative",
    top: "1rem",
    width: "2.4rem",
  },
}));

const BorderTopStyle = styled(Box)(({ theme }) => ({
  left: "50%",

  position: "absolute",
  top: 0,
  textAlign: "center",
  transform: "translate(-50%)",
  width: "100%",
  "& span": {
    position: "absolute",
    top: 0,
    "&:first-of-type": {
      borderLeft: `3px solid #dbb579`,
      borderTop: `3px solid #dbb579`,
      borderTopLeftRadius: "16px",
      height: "3rem",
      left: "0",
      width: "3rem",
      "&:after": {
        backgroundColor: "#dbb579",
        borderRadius: "50%",
        content: `""`,
        height: "0.5rem",
        left: "1rem",
        position: "absolute",
        top: "1rem",
        width: "0.5rem",
      },
    },
    "&:last-of-type": {
      borderRight: `3px solid #dbb579`,
      borderTop: `3px solid #dbb579`,
      borderTopRightRadius: "16px",
      height: "3rem",
      right: "0",
      width: "3rem",
      "&:after": {
        backgroundColor: "#dbb579",
        borderRadius: "50%",
        content: `""`,
        height: "0.5rem",
        right: "1rem",
        position: "absolute",
        top: "1rem",
        width: "0.5rem",
      },
    },
  },
}));

const AccountId = ({ id }) => {
  const { t } = useTranslation("common");

  return (
    <>
      {id}
      <ContentCopyIcon
        sx={{
          fontSize: "1.5rem",
          marginLeft: "1.2rem",
          cursor: "pointer",
        }}
        onClick={() => {
          navigator.clipboard.writeText(id);
          toast.success(t("Copied to clipboard"));
        }}
      />
    </>
  );
};

const AccountInfo = ({ user }) => {
  const { t } = useTranslation("common");
  const [vipLogos, setVipLogos] = useState([]);
  const { balance } = useSelector((state) => state.balance);

  const getData = async () => {
    const res = await SettingService.getClient();
    setVipLogos(res.data.data?.vips);
  };

  useEffect(() => {
    getData();
  }, []);

  const vipLogo = vipLogos?.find((v) => v.level === (user?.vipLevel ?? 0))?.url;

  return (
    <>
      <Box
        sx={{
          borderRadius: "2rem",
          backgroundColor: "#0c192c",
          border: (theme) => `2px solid #dbb579`,
          position: "relative",
          height: "26rem",
          marginTop: "3rem",
        }}
      >
        <SplitBorder>
          <span></span>
        </SplitBorder>
        <BorderTopStyle>
          <span></span>
          <span></span>
        </BorderTopStyle>
        <TitleLeft />
        <TitleCenter>{t("Member")}</TitleCenter>
        <TitleRight />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            paddingTop: "30px",
            color: (theme) => theme.palette.color.secondary,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box
              sx={{
                "& img": {
                  borderRadius: "50%",
                  objectFit: "cover",
                },
              }}
            >
              <img
                style={{
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
                src={
                  vipLogo ??
                  "https://w7.pngwing.com/pngs/902/825/png-transparent-vip-logo-euclidean-very-important-person-logo-vip-guest-badge-emblem-pin-clothing-accessories.png"
                }
                width={80}
                height={80}
                alt={user.taiKhoan}
              />
            </Box>
            <Typography sx={{ color: (theme) => theme.palette.text.primary }}>{user.taiKhoan}</Typography>
            {/* <Typography
              sx={{
                fontSize: "3rem",
                color: (theme) => theme.palette.text.primary,
              }}
            >
              <small
                style={{
                  color: "#007bff",
                }}
              >
                $
              </small>{" "}
              <Money />
            </Typography> */}
            <Typography
              sx={{
                fontSize: "1.5rem",
                color: (theme) => theme.palette.text.primary,
              }}
            >
              <small
                style={{
                  color: "#007bff",
                }}
              >
                ID:
              </small>{" "}
              <AccountId id={user.publicId} />
            </Typography>
            {user.referralCode && (
              <Typography
                sx={{
                  fontSize: "15px",
                  color: (theme) => theme.palette.text.primary,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <small
                  style={{
                    color: "#007bff",
                  }}
                >
                  {t("Mã giới thiệu")}:
                </small>{" "}
                <div
                  style={{
                    fontSize: "15px",
                    marginLeft: "5px",
                  }}
                >
                  {user.referralCode}
                </div>
              </Typography>
            )}
            <div
              style={{
                fontSize: "18px",
                color: "white",
                padding: "10px",
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                textAlign: "center",
              }}
            >
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                <div style={{ fontSize: "12px", color: "rgb(171 171 171)" }}>{t("Số dư tài khoản")}</div>
                <div>{convertJSXMoney(balance)}</div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                <div style={{ fontSize: "12px", color: "rgb(171 171 171)" }}>{t("Hôm nay cá cược")}</div>
                <div>{convertJSXMoney(user.totalPlay)}</div>
              </div>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "5px" }}>
                <div style={{ fontSize: "12px", color: "rgb(171 171 171)" }}>{t("Hôm nay lợi nhuận")}</div>
                <div>{convertJSXMoney(user.totalChange)}</div>
              </div>
            </div>
          </Box>
        </Box>
        {/* <TransactionBox>
          <Link href="/deposit">
            <Box
              className="item"
              sx={{
                cursor: "pointer",
              }}
            >
              <AddCardOutlinedIcon />
              <Typography>{t("Deposit")}</Typography>
            </Box>
          </Link>
          <Link href="/withdraw">
            <Box
              sx={{
                cursor: "pointer",
              }}
              className="item"
            >
              <PriceChangeOutlinedIcon />
              <Typography>{t("Withdraw")}</Typography>
            </Box>
          </Link>
        </TransactionBox> */}
      </Box>
    </>
  );
};
export default AccountInfo;
