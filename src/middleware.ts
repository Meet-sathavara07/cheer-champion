import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { authenticateRequest, getUserProfile } from "@/helpers/loginHelper";


export async function middleware(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value || "";
  const { pathname } = request.nextUrl;
  const publicRoutes = ["/login"];
  if (publicRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/feeds", request.url))
  }

  if (!publicRoutes.includes(pathname) && !token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (pathname.startsWith("/admin/")) {
    // Authenticate and get user id
    const user = await authenticateRequest(request);
    if (!user || !user.id) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // Get user profile
    const profile = await getUserProfile(user.id);
    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
}

export const config = {
  matcher: [
    "/profile/:path*",
    "/update-profile",
    "/feeds",
    "/login",
    "/admin/:path*",
  ],
};
