import Layout from "@/components/Layout";
import RecordBet from "@/components/games/keno/5p/RecordBet";
import BoxLichSu from "@/components/games/keno/BoxLichSu";
import { LOAI_GAME } from "@/configs/game.config";
import { useSession } from "next-auth/react";
import { NextSeo } from "next-seo";
import { useEffect } from "react";
const Home = () => {
  const TYPE_GAME = LOAI_GAME.KENO5P;
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      window.location.href = "/";
    }
  }, [status]);

  return (
    <>
      <NextSeo title="Game Keno 5 phút" />

      <Layout>
        <RecordBet TYPE_GAME={TYPE_GAME} />
        <BoxLichSu TYPE_GAME={TYPE_GAME} />
      </Layout>
    </>
  );
};

export default Home;
