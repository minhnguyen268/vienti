import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";
import { isNaN } from "lodash";
import { useEffect, useState } from "react";

const CountdownBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  "& .notime": {
    background: "transparent",
  },
  "& div": {
    background: "#efeff4",
    border: "1px solid #fff",
    borderRadius: "5px",
    color: "#0d8ea7",
    fontSize: "2rem",
    fontWeight: "bold",
    padding: "0 5px",
    textAlign: "center",
  },
}));
const CountdownTimer = ({ countdownTime }) => {
  const [minutesFirst, setMinutesFirst] = useState(0);
  const [minutesSecond, setMinutesSecond] = useState(0);
  const [secondsFirst, setSecondsFirst] = useState(0);
  const [secondsSecond, setSecondsSecond] = useState(0);

  useEffect(() => {
    if (isNaN(countdownTime) || countdownTime === undefined || countdownTime === null) {
      return;
    }
    let hours = Math.floor((countdownTime % (60 * 60 * 24)) / (60 * 60));
    let minutes = Math.floor((countdownTime % (60 * 60)) / 60);
    let seconds = Math.floor(countdownTime % 60);

    if (minutes < 10) {
      setMinutesFirst(0);
      setMinutesSecond(minutes);
    } else {
      setMinutesFirst(Math.floor(minutes / 10));
      setMinutesSecond(Math.floor(minutes % 10));
    }
    if (seconds < 10) {
      setSecondsFirst(0);
      setSecondsSecond(seconds);
    } else {
      setSecondsFirst(Math.floor(seconds / 10));
      setSecondsSecond(Math.floor(seconds % 10));
    }
  }, [countdownTime]);
  return (
    <>
      <CountdownBox>
        <div>{minutesFirst < 0 ? 0 : minutesFirst}</div>
        <div>{minutesSecond < 0 ? 0 : minutesSecond}</div>
        <div className="notime">:</div>
        <div>{secondsFirst < 0 ? 0 : secondsFirst}</div>
        <div>{secondsSecond < 0 ? 0 : secondsSecond}</div>
      </CountdownBox>
    </>
  );
};
export default CountdownTimer;
