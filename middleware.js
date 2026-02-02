import { NextResponse } from "next/server";

// Define protected routes
const protectedRoutes = ["/dashboard"];
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check if accessing a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Get access token from cookie or authorization header
  const accessToken =
    request.cookies.get("accessToken")?.value ||
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (isProtectedRoute) {
    // Redirect to login if no token
    if (!accessToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Basic JWT validation (check if it looks like a valid JWT structure)
    // Full validation happens in API routes
    const parts = accessToken.split(".");
    if (parts.length !== 3) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("accessToken");
      return response;
    }

    // Check expiration from payload (base64 decode)
    try {
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        // Token expired, redirect to login
        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.delete("accessToken");
        return response;
      }
    } catch (error) {
      // Invalid token format
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("accessToken");
      return response;
    }
  }

  // Don't redirect authenticated users from auth pages in middleware
  // Let the client-side handle this to avoid issues with token validation

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
