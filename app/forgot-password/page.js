"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import styles from "../login/auth.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const result = await forgotPassword(email);

    if (result.success) {
      setSuccess(result.message);
      setEmail("");
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <Link href="/login" className={styles.backLink}>
          ← Back to login
        </Link>

        <div className={styles.header}>
          <h1 className={styles.title}>Forgot Password</h1>
          <p className={styles.subtitle}>
            Enter your email address and we&apos;ll send you a link to reset
            your password
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.input}
              placeholder="Enter your email"
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Remember your password?{" "}
            <Link href="/login" className={styles.link}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
