import AuthService from "@/services/AuthService";
import { signOut } from "next-auth/react";

const handleLogout = async (session) => {
  await AuthService.signOut({
    refreshToken: session?.user?.refreshToken,
    taiKhoan: session?.user?.taiKhoan,
  });
  await signOut({
    redirect: true,
    callbackUrl: "/",
  });
};
export default handleLogout;
