import { setDisplayBalance } from "@/redux/actions/balance";
import { convertJSXMoney } from "@/utils/convertMoney";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { Box, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from 'react-i18next';

const AccountBalance = () => {
  const { t } = useTranslation('common');
  const dispatch = useDispatch();
  const { display: isDisplayBalance, balance } = useSelector((state) => state.balance);
  const handleDisplayBalance = (status) => {
    dispatch(setDisplayBalance(status));
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: "10px",
        }}
      >
        <Typography component={"div"}>
          {t("Balance")}:{" "}
          <small
            style={{
              color: "#007bff",
            }}
          >
            $
          </small>{" "}
          {isDisplayBalance ? convertJSXMoney(balance) : "******"}
        </Typography>
        {!isDisplayBalance && (
          <VisibilityIcon
            sx={{
              fontSize: "1.5rem",
              marginTop: "0.3rem",
            }}
            onClick={() => handleDisplayBalance(!isDisplayBalance)}
          />
        )}
        {isDisplayBalance && (
          <VisibilityOffIcon
            sx={{
              fontSize: "1.5rem",
              marginTop: "0.3rem",
            }}
            onClick={() => handleDisplayBalance(!isDisplayBalance)}
          />
        )}
      </Box>
    </>
  );
};
export default AccountBalance;
