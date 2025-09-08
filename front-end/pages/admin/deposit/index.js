"use client";

import BreadcrumbBar from "@/components/admin/BreadcrumbBar";
import Layout from "@/components/admin/Layout";
import ListDeposit from "@/components/admin/deposit/ListDeposit";
import { NextSeo } from "next-seo";
const BreadcrumbData = [
  {
    title: "Admin",
    href: "/admin",
  },
  {
    title: "Quản lý nạp tiền",
    href: "/admin/deposit",
  },
];
const Home = () => {
  return (
    <>
      <NextSeo title="Quản lý yêu cầu nạp tiền" />

      <Layout>
        <BreadcrumbBar data={BreadcrumbData} />
        <h1
          className="title admin"
          style={{
            fontSize: "2.5rem",
          }}
        >
          Yêu cầu nạp tiền
        </h1>

        <ListDeposit />
      </Layout>
    </>
  );
};
export default Home;
