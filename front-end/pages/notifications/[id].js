import Layout from "@/components/Layout";
import DetailedNotification from "@/components/notification/DetailedNotification";
import { Box } from "@mui/material";
import { useSession } from "next-auth/react";
import { NextSeo } from "next-seo";
import { useEffect } from "react";
import { useTranslation } from 'react-i18next';

const Home = ({ id }) => {
  const { data: session, status } = useSession();
  const { t } = useTranslation('common');
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/";
    }
  }, [status]);

  return (
    <>
      <NextSeo title="Chi tiết khuyến mãi" />

      <Layout>
        <h1 className="title-h1">{t('Promotion Detail')}</h1>

        <Box
          sx={{
            paddingTop: "5rem",
            color: (theme) => theme.palette.text.secondary,
          }}
        >
          <DetailedNotification id={id} />
        </Box>
      </Layout>
    </>
  );
};

export default Home;
export const getServerSideProps = async (context) => {
  const { params } = context;
  const id = params.id;

  return {
    props: {
      id,
    },
  };
};
