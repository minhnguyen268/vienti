import Layout from "@/components/admin/Layout";
import DetailedUser from "@/components/admin/users/DetailedUser";
import ListBalanceFluctuations from "@/components/admin/users/ListBalanceFluctuations";
import ListUserBank from "@/components/admin/users/ListUserBank";
import ListRefUsers from "@/components/admin/users/ListRefUsers";
import { NextSeo } from "next-seo";
const ChiTiet = ({ ID }) => {
  return (
    <>
      <NextSeo title="Chi tiết người dùng" />
      <Layout>
        <DetailedUser ID={ID} />
        <ListUserBank ID={ID} />
        <ListBalanceFluctuations ID={ID} />
        <ListRefUsers ID={ID} />
      </Layout>
    </>
  );
};
export default ChiTiet;
export const getServerSideProps = async (context) => {
  const { params } = context;
  const ID = params.id;

  return {
    props: {
      ID: ID,
    },
  };
};
