import Layout from "@/components/admin/Layout";
import List from "@/components/admin/settings/Slide/ListSlide";
import { NextSeo } from "next-seo";
const Home = () => {
  return (
    <>
      <NextSeo title="Quản lý slide" />
      <Layout>
        <List />
      </Layout>
    </>
  );
};
export default Home;
