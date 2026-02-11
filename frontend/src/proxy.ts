import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// 이 경로는 로그인이 없어도 접근 가능한 페이지들입니다.
const publicPaths = ["/login", "/signup", "/verify-email", "/accept-invite"];

export function proxy(request: NextRequest) {
    const token = request.cookies.get("token")?.value;
    const { pathname } = request.nextUrl;

    // 1. 토큰이 없는데 보호된 페이지에 접근하려는 경우
    if (!token && !publicPaths.some(path => pathname.startsWith(path))) {
        // 루트(/)나 대시보드 등에서 로그인이 안되어있으면 로그인으로 이동
        const loginUrl = new URL("/login", request.url);
        // 가려던 주소를 기억했다가 로그인 후 돌려보내기 위함
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // 2. 이미 로그인이 되어있는데 로그인/회원가입 페이지에 가려는 경우
    if (token && (pathname === "/login" || pathname === "/signup")) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

// 미들웨어가 실행될 경로 설정 (모든 경로에서 실행하되 정적로딩 등 제외)
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
