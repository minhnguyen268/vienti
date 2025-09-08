import BreadcrumbBar from "@/components/admin/BreadcrumbBar";
import Layout from "@/components/admin/Layout";
import DieuChinhAuto from "@/components/admin/games/keno/DieuChinhAuto";
import DieuChinhTiLe from "@/components/admin/games/keno/DieuChinhTiLe";
import ListGame from "@/components/admin/games/keno/ListGame";
import { LOAI_GAME } from "@/configs/game.config";
import { NextSeo } from "next-seo";
const Home = () => {
  const TYPE_GAME = LOAI_GAME.KENO3P;
  const BreadcrumbData = [
    {
      title: "Admin",
      href: "/admin",
    },
    {
      title: "Games",
      href: "/admin/games",
    },
    {
      title: TYPE_GAME,
      href: `/admin/games/${TYPE_GAME}`,
    },
  ];
  return (
    <>
      <NextSeo title="Quản lý game Keno 3 phút" />

      <Layout>
        <BreadcrumbBar data={BreadcrumbData} />
        <ListGame TYPE_GAME={TYPE_GAME} />
        <DieuChinhTiLe TYPE_GAME={TYPE_GAME} />
        <DieuChinhAuto TYPE_GAME={TYPE_GAME} />
      </Layout>
    </>
  );
};
export default Home;
