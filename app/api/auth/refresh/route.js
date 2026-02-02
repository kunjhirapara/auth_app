import { NextResponse } from "next/server";
import { getUserById } from "@/lib/db";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  getAccessTokenExpiry,
} from "@/lib/jwt";
import {
  getRefreshToken,
  deleteRefreshToken,
  storeRefreshToken,
} from "@/lib/redis";

export async function POST(request) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: "Refresh token not provided" },
        { status: 401 },
      );
    }

    // Verify refresh token exists in Redis
    const tokenData = await getRefreshToken(refreshToken);
    if (!tokenData) {
      // Clear invalid cookies
      const response = NextResponse.json(
        { error: "Invalid or expired refresh token" },
        { status: 401 },
      );
      response.cookies.set("refreshToken", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });
      response.cookies.set("accessToken", "", {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      });
      return response;
    }

    // Get user from database
    const user = await getUserById(tokenData.userId);
    if (!user) {
      await deleteRefreshToken(refreshToken);
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    // Delete old refresh token (token rotation)
    await deleteRefreshToken(refreshToken);

    // Generate new tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken();

    // Store new refresh token in Redis
    await storeRefreshToken(user.id, newRefreshToken, getRefreshTokenExpiry());

    // Create response
    const response = NextResponse.json({
      message: "Token refreshed successfully",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken: newAccessToken,
    });

    // Set new access token cookie
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: getAccessTokenExpiry(),
      path: "/",
    });

    // Set new refresh token cookie
    response.cookies.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: getRefreshTokenExpiry(),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Refresh token error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
