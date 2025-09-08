import Layout from "@/components/Layout";
import LoadingBox from "@/components/homePage/LoadingBox";
import useGetTawkToConfig from "@/hooks/useGetTawkToConfig";
import { Box } from "@mui/material";
import { useSession } from "next-auth/react";
import { NextSeo } from "next-seo";
import { useEffect } from "react";
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation('common');
  const { data: session, status } = useSession();

  const { data, isLoading } = useGetTawkToConfig();

  const propertyId = data?.propertyId ?? "";
  const widgetId = data?.widgetId ?? "";

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/";
    }
  }, [status]);

  return (
    <>
      <NextSeo title="Chăm sóc khách hàng" />
      {isLoading && <LoadingBox isLoading={isLoading} />}

      <Layout>
        <h1 className="title-h1">{t('Customer support')}</h1>
        <Box
          sx={{ 
            paddingTop: "5rem",
            height: "70vh",
          }}
        >
          {data && (
            <iframe
              src={`https://${propertyId}.livechats.sbs/${widgetId}.htm`}
              frameBorder="0"
              width="100%"
              height="100%"
            ></iframe>
          )}
        </Box>
      </Layout>
    </>
  );
};

export default Home;
