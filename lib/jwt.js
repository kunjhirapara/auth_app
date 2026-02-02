import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET || "access-secret-key-change-in-production";
const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || "refresh-secret-key-change-in-production";

const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

// Generate UUID v4 without crypto module for Turbopack compatibility
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function generateAccessToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY },
  );
}

export function generateRefreshToken() {
  return generateUUID();
}

export function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_TOKEN_SECRET);
  } catch (error) {
    return null;
  }
}

export function decodeAccessToken(token) {
  try {
    return jwt.decode(token);
  } catch (error) {
    return null;
  }
}

export function getAccessTokenExpiry() {
  // Returns expiry in seconds (15 minutes)
  return 15 * 60;
}

export function getRefreshTokenExpiry() {
  // Returns expiry in seconds (7 days)
  return 7 * 24 * 60 * 60;
}
