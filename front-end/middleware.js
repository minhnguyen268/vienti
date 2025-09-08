import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

const NotAllowManagerRoutes = [
  "/admin/settings/telegram", "/admin/settings/tawk-to", "/admin/settings/slide"
]

export default withAuth(
  function middleware(request) {
    const path = request.nextUrl.pathname;
    if (path.startsWith("/admin")) {
      const role = request?.nextauth?.token?.role ?? "user";
      if (role !== "admin" && role !== "manager") {
        return NextResponse.redirect(new URL("/", request.url));
      }
      if (role === "manager") {
        if (NotAllowManagerRoutes.includes(path)) {
          return NextResponse.redirect(new URL("/admin/settings", request.url))
        }
      }
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        if (!token) {
          return false;
        }
        return true;
      },
    },
  }
);
export const config = {
  matcher: [
    "/admin/:path*",
    "/games/:path*",
    "/deposit/:path*",
    "/profile/:path*",
    "/balance-fluctuations/:path*",
    "/list-bank/:path*",
    "/notifications/:path*",
    "/contact/:path*",
    "/sign-out",
  ],
};
