"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import styles from "../login/auth.module.css";

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const tokenError = !token
    ? "Invalid or missing reset token. Please request a new password reset link."
    : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    const result = await resetPassword(token, password);

    if (result.success) {
      setSuccess(result.message);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
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
          <h1 className={styles.title}>Reset Password</h1>
          <p className={styles.subtitle}>Enter your new password below</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {(error || tokenError) && <div className={styles.error}>{error || tokenError}</div>}
          {success && <div className={styles.success}>{success}</div>}

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              New Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.input}
              placeholder="Enter new password"
              required
              disabled={loading || !token}
              minLength={8}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.label}>
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={styles.input}
              placeholder="Confirm new password"
              required
              disabled={loading || !token}
              minLength={8}
            />
          </div>

          <button
            type="submit"
            className={styles.button}
            disabled={loading || !token}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            Need a new reset link?{" "}
            <Link href="/forgot-password" className={styles.link}>
              Request here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.header}>
              <h1 className={styles.title}>Loading...</h1>
            </div>
          </div>
        </div>
      }>
      <ResetPasswordForm />
    </Suspense>
  );
}
