import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUser, emailExists } from "@/lib/db";

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 },
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
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

    // Check if email already exists
    const exists = await emailExists(email);
    if (exists) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const userId = await createUser(email, passwordHash, name);

    return NextResponse.json(
      { message: "User registered successfully", userId },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
