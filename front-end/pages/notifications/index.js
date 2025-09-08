import Layout from "@/components/Layout";
import LoadingBox from "@/components/homePage/LoadingBox";
import Item from "@/components/notification/Item";
import useGetListNotifications from "@/hooks/useGetListNotifications";
import { Box, Button, useTheme } from "@mui/material";
import { useSession } from "next-auth/react";
import { NextSeo } from "next-seo";
import { useEffect } from "react";
import { Bars } from "react-loading-icons";
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation('common');

  const { data: session, status } = useSession();
  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/";
    }
  }, [status]);

  const {
    data,
    isLoading,
    isFetching,
    isError: isErrorQuery,
    error,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetListNotifications({});
  const theme = useTheme();
  return (
    <>
      <NextSeo title="Khuyến mãi" />
      {isLoading && <LoadingBox isLoading={isLoading} />}
      {isFetchingNextPage && <LoadingBox isLoading={isFetchingNextPage} />}

      <Layout>
        <h1 className="title-h1">{t('Promotion')}</h1>

        <Box
          sx={{
            paddingTop: "5rem",
            color: (theme) => theme.palette.text.secondary,
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(1, minmax(0,1fr))",
              gap: "2rem",
              marginTop: "1rem",
              color: (theme) => theme.palette.text.secondary,
            }}
          >
            {data?.map((item) => (
              <Item key={item._id} item={item} />
            ))}
          </Box>

          <Box
            sx={{
              paddingTop: "1rem",
              textAlign: "center",
            }}
          >
            {isFetchingNextPage && <Bars fill={theme.palette.color.primary} width={50} height={50} speed={0.75} />}

            {hasNextPage && !isFetchingNextPage && (
              <Button variant="contained" onClick={() => fetchNextPage()}>
                {t('Load more')}
              </Button>
            )}
          </Box>
        </Box>
      </Layout>
    </>
  );
};

export default Home;
