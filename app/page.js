import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className={styles.hero}>
          <h1 className={styles.title}>
            Welcome to <span className={styles.gradient}>Auth App</span>
          </h1>
          <p className={styles.description}>
            A secure authentication system built with Next.js, Redis, and MySQL
          </p>

          <div className={styles.buttons}>
            <Link href="/login" className={styles.primaryButton}>
              Sign In
            </Link>
            <Link href="/register" className={styles.secondaryButton}>
              Create Account
            </Link>
          </div>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🔐</div>
            <h3>Secure Authentication</h3>
            <p>
              JWT access tokens with short expiry and refresh token rotation
            </p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>⚡</div>
            <h3>Redis Token Storage</h3>
            <p>Fast token validation and storage with automatic expiration</p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>🔄</div>
            <h3>Auto Token Refresh</h3>
            <p>
              Seamless token refresh before expiration for uninterrupted
              sessions
            </p>
          </div>

          <div className={styles.feature}>
            <div className={styles.featureIcon}>📧</div>
            <h3>Password Recovery</h3>
            <p>Secure password reset via email with time-limited tokens</p>
          </div>
        </div>
      </main>
    </div>
  );
}
