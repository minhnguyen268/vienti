import useGetListNotifications from "@/hooks/useGetListNotifications";
import CampaignIcon from "@mui/icons-material/Campaign";
import { Box, Typography } from "@mui/material";
const HomeNotification = () => {
  const { data, isLoading } = useGetListNotifications({ limitItems: 1 });
  return (
    <>
      {data?.map((item) => (
        <Box
          key={item._id}
          sx={{
            marginTop: "1rem",
            display: "flex",
            gap: "1rem",
            padding: "1rem",
            backgroundColor: "#f1e7bd",
            alignItems: "center",
            justifyContent: "center",
            textWrap: "nowrap",

            alignItems: "center",
            background: "#0c192c",
            color: "#ffc200",
            display: "flex",
            fontSize: "1.4rem",
            justifyContent: "left",
            margin: "1rem -1.6rem 1rem",
            overflow: "hidden",
            padding: "5px 15px",
            width: "calc(100% + 3.2rem)",
            marginTop: "1rem",
          }}
        >
          <CampaignIcon
            sx={{
              color: "#ffc200",
            }}
          />
          <Box
            id="scroll-container"
            sx={{
              flex: 1,
            }}
          >
            <marquee scrollamount={5}>{item.tieuDe}</marquee>
            {/* <Typography
              id="scroll-text"
              sx={{
                color: "#ffc200",
              }}
            >
              {item.tieuDe}
            </Typography> */}
          </Box>
        </Box>
      ))}
    </>
  );
};
export default HomeNotification;
