import dynamic from "next/dynamic";

const Header = dynamic(() => import("./homePage/Header"), { ssr: false });

import useCatchRefreshTokenError from "@/hooks/useCatchRefreshTokenError";
import useRegisterUserSocket from "@/hooks/useRegisterUserSocket";
import { Box } from "@mui/material";
import Footer from "./homePage/Footer";
import { Suspense } from "react";
// import Header from "./homePage/Header";

const Layout = ({ children }) => {
  useCatchRefreshTokenError();
  useRegisterUserSocket();

  return (
    <>
      <Box
        className="App"
        sx={{
          boxShadow: "0 0 6rem 0 hsla(0,0%,49%,.3)",
          margin: "0 auto",
          // maxWidth: "540px",
          minHeight: "100vh",
        }}
      >
        <Box
          className="main"
          sx={{
            background: "#0c192c",
            minHeight: "100vh",
            padding: "0 0.32rem 2rem",
          }}
        >
          <Header />
          <Box
            sx={{
              padding: "1rem",
              paddingBottom: "10rem",
              position: "relative",
            }}
          >
            <Suspense fallback={null}>{children}</Suspense>
          </Box>
          <Footer />
        </Box>
      </Box>
    </>
  );
};
export default Layout;
