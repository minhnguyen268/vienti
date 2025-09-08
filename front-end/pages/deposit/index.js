import Layout from "@/components/Layout";
import HuongDan from "@/components/deposit/HuongDan";
import DanhSachBank from "@/components/deposit/ListBank";
import LoadingBox from "@/components/homePage/LoadingBox";
import useGetListBank from "@/hooks/useGetListBank";
import { Box } from "@mui/material";
import { useSession } from "next-auth/react";
import { NextSeo } from "next-seo";
import { useEffect } from "react";
import { useTranslation } from 'react-i18next';

const Deposit = () => {
  const { t } = useTranslation('common');
  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/";
    }
  }, [status]);

  const { data, isLoading } = useGetListBank();

  return (
    <>
      <NextSeo title="Nạp tiền" />

      {isLoading && <LoadingBox isLoading={isLoading} />}
      <Layout>
        <h1 className="title-h1">{t('Deposit')}</h1>
        {!isLoading && data && (
          <Box
            sx={{
              paddingTop: "5rem",
            }}
          >
            
            <HuongDan />
          </Box>
        )}
      </Layout>
    </>
  );
};

export default Deposit;
