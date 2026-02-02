import { NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/jwt";
import { isAccessTokenBlacklisted } from "@/lib/redis";
import { getUserById } from "@/lib/db";

export async function GET(request) {
  try {
    // Get access token from header
    const authHeader = request.headers.get("authorization");
    const accessToken = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Access token not provided" },
        { status: 401 },
      );
    }

    // Check if token is blacklisted
    const isBlacklisted = await isAccessTokenBlacklisted(accessToken);
    if (isBlacklisted) {
      return NextResponse.json(
        { error: "Token has been invalidated" },
        { status: 401 },
      );
    }

    // Verify access token
    const decoded = verifyAccessToken(accessToken);
    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired access token" },
        { status: 401 },
      );
    }

    // Get fresh user data from database
    const user = await getUserById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
