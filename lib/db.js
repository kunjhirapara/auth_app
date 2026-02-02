import mysql from "mysql2/promise";

let pool = null;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || "localhost",
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "auth_app",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const pool = getPool();
  const [results] = await pool.execute(sql, params);
  return results;
}

// User functions
export async function createUser(email, passwordHash, name) {
  const result = await query(
    "INSERT INTO users (email, password_hash, name, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
    [email, passwordHash, name],
  );
  return result.insertId;
}

export async function getUserByEmail(email) {
  const users = await query("SELECT * FROM users WHERE email = ?", [email]);
  return users[0] || null;
}

export async function getUserById(id) {
  const users = await query(
    "SELECT id, email, name, created_at, updated_at FROM users WHERE id = ?",
    [id],
  );
  return users[0] || null;
}

export async function updateUserPassword(userId, passwordHash) {
  await query(
    "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?",
    [passwordHash, userId],
  );
}

export async function emailExists(email) {
  const users = await query("SELECT id FROM users WHERE email = ?", [email]);
  return users.length > 0;
}
