import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/db";
import {
  generateAccessToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  getAccessTokenExpiry,
} from "@/lib/jwt";
import { storeRefreshToken } from "@/lib/redis";

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Get user by email
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken();

    // Store refresh token in Redis
    await storeRefreshToken(user.id, refreshToken, getRefreshTokenExpiry());

    // Create response with cookies
    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    });

    // Set access token as cookie (for middleware)
    response.cookies.set("accessToken", accessToken, {
      httpOnly: false, // Accessible by JS for auth header
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: getAccessTokenExpiry(),
      path: "/",
    });

    // Set refresh token as HTTP-only cookie
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: getRefreshTokenExpiry(),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
