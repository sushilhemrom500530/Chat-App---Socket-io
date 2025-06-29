import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const pathname = request.nextUrl.pathname;

//   if (!token && pathname.startsWith("/")) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

  return NextResponse.next();
}

export const config = {
//   matcher: ["/"],
};
