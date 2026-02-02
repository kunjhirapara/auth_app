"use client";

import { useAuth } from "@/context/AuthContext";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Redirecting to login...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>Auth App</div>
        <button onClick={logout} className={styles.logoutButton}>
          Logout
        </button>
      </nav>

      <main className={styles.main}>
        <div className={styles.welcomeCard}>
          <div className={styles.avatar}>
            {user.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <h1 className={styles.welcomeTitle}>Welcome back, {user.name}!</h1>
          <p className={styles.welcomeSubtitle}>
            You are successfully logged in
          </p>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>📧</div>
            <div className={styles.infoContent}>
              <h3 className={styles.infoLabel}>Email</h3>
              <p className={styles.infoValue}>{user.email}</p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>👤</div>
            <div className={styles.infoContent}>
              <h3 className={styles.infoLabel}>Name</h3>
              <p className={styles.infoValue}>{user.name}</p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>🆔</div>
            <div className={styles.infoContent}>
              <h3 className={styles.infoLabel}>User ID</h3>
              <p className={styles.infoValue}>{user.id}</p>
            </div>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>✅</div>
            <div className={styles.infoContent}>
              <h3 className={styles.infoLabel}>Status</h3>
              <p className={styles.infoValue}>Authenticated</p>
            </div>
          </div>
        </div>

        <div className={styles.featuresSection}>
          <h2 className={styles.sectionTitle}>Authentication Features</h2>
          <div className={styles.featuresList}>
            <div className={styles.feature}>
              <span className={styles.featureCheck}>✓</span>
              <span>JWT Access Tokens (15 min expiry)</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureCheck}>✓</span>
              <span>Refresh Token Rotation (7 day expiry)</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureCheck}>✓</span>
              <span>Secure HTTP-only Cookies</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureCheck}>✓</span>
              <span>Redis Token Storage</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureCheck}>✓</span>
              <span>Password Reset via Email</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureCheck}>✓</span>
              <span>Token Blacklisting on Logout</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
