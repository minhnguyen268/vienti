import Layout from "@/components/Layout";
import AddBank from "@/components/list-bank/AddBank";
import { Box } from "@mui/material";
import { useSession } from "next-auth/react";
import { NextSeo } from "next-seo";
import { useEffect } from "react";
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation('common');
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/";
    }
  }, [status]);

  return (
    <>
      <NextSeo title="Thêm liên kết ngân hàng" />

      <Layout>
        <h1 className="title-h1">{t('Add bank account')}</h1>

        <Box
          sx={{
            paddingTop: "50px",
            color: (theme) => theme.palette.text.primary,
          }}
        >
          <AddBank />
        </Box>
      </Layout>
    </>
  );
};

export default Home;
