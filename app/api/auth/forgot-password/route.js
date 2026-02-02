import { NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/db";
import { storePasswordResetToken } from "@/lib/redis";
import { sendPasswordResetEmail } from "@/lib/email";

// Generate UUID v4 without crypto module for Turbopack compatibility
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Always return success to prevent email enumeration
    const successResponse = NextResponse.json({
      message:
        "If an account with that email exists, a password reset link has been sent.",
    });

    // Check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
      // Return success anyway to prevent email enumeration
      return successResponse;
    }

    // Generate reset token
    const resetToken = generateUUID();

    // Store reset token in Redis (expires in 15 minutes)
    await storePasswordResetToken(user.id, resetToken, 60 * 15);

    // Send reset email
    const emailSent = await sendPasswordResetEmail(email, resetToken);

    if (!emailSent) {
      console.error("Failed to send password reset email to:", email);
      // Still return success to prevent information leakage
    }

    return successResponse;
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
