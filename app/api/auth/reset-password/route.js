import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import {
  getPasswordResetToken,
  deletePasswordResetToken,
  deleteAllUserTokens,
} from "@/lib/redis";
import { updateUserPassword } from "@/lib/db";

export async function POST(request) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 },
      );
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 },
      );
    }

    // Verify reset token
    const tokenData = await getPasswordResetToken(token);
    if (!tokenData) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 },
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password
    await updateUserPassword(tokenData.userId, passwordHash);

    // Delete the reset token
    await deletePasswordResetToken(token);

    // Invalidate all existing refresh tokens for this user (security measure)
    await deleteAllUserTokens(tokenData.userId);

    return NextResponse.json({
      message:
        "Password reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
