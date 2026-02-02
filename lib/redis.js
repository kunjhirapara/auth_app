import { createClient } from "redis";

let redisClient = null;

export async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });

    redisClient.on("error", (err) => console.error("Redis Client Error", err));
    redisClient.on("connect", () => console.log("Redis Client Connected"));

    await redisClient.connect();
  }

  return redisClient;
}

// Token storage functions
export async function storeRefreshToken(
  userId,
  token,
  expiresIn = 60 * 60 * 24 * 7,
) {
  const client = await getRedisClient();
  // Store token with user reference
  await client.set(`refresh_token:${token}`, JSON.stringify({ userId }), {
    EX: expiresIn,
  });
  // Store user's active tokens (for invalidation)
  await client.sAdd(`user_tokens:${userId}`, token);
}

export async function getRefreshToken(token) {
  const client = await getRedisClient();
  const data = await client.get(`refresh_token:${token}`);
  return data ? JSON.parse(data) : null;
}

export async function deleteRefreshToken(token) {
  const client = await getRedisClient();
  const data = await getRefreshToken(token);
  if (data) {
    await client.del(`refresh_token:${token}`);
    await client.sRem(`user_tokens:${data.userId}`, token);
  }
}

export async function deleteAllUserTokens(userId) {
  const client = await getRedisClient();
  const tokens = await client.sMembers(`user_tokens:${userId}`);
  for (const token of tokens) {
    await client.del(`refresh_token:${token}`);
  }
  await client.del(`user_tokens:${userId}`);
}

// Password reset token functions
export async function storePasswordResetToken(
  userId,
  token,
  expiresIn = 60 * 15,
) {
  const client = await getRedisClient();
  await client.set(`password_reset:${token}`, JSON.stringify({ userId }), {
    EX: expiresIn,
  });
}

export async function getPasswordResetToken(token) {
  const client = await getRedisClient();
  const data = await client.get(`password_reset:${token}`);
  return data ? JSON.parse(data) : null;
}

export async function deletePasswordResetToken(token) {
  const client = await getRedisClient();
  await client.del(`password_reset:${token}`);
}

// Blacklist access tokens (for logout)
export async function blacklistAccessToken(token, expiresIn = 60 * 15) {
  const client = await getRedisClient();
  await client.set(`blacklist:${token}`, "true", { EX: expiresIn });
}

export async function isAccessTokenBlacklisted(token) {
  const client = await getRedisClient();
  const result = await client.get(`blacklist:${token}`);
  return result === "true";
}
