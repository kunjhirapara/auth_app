# Auth App Database Setup

## MySQL Database Schema

Run the following SQL commands in your MySQL database to create the required tables:

```sql
-- Create the database
CREATE DATABASE IF NOT EXISTS auth_app;

-- Use the database
USE auth_app;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## Redis Setup

Make sure Redis is running on your system. The default configuration expects Redis at `redis://localhost:6379`.

### Install Redis:

**Ubuntu/Debian:**

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

**macOS (Homebrew):**

```bash
brew install redis
brew services start redis
```

**Docker:**

```bash
docker run -d --name redis -p 6379:6379 redis
```

## Environment Variables

Copy `.env.example` to `.env.local` and update the values:

```bash
cp .env.example .env.local
```

Then edit `.env.local` with your actual configuration values.

## Running the Application

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- **User Registration** - Create new accounts with email/password
- **User Login** - Authenticate with email/password
- **JWT Access Tokens** - Short-lived tokens (15 minutes) for API access
- **Refresh Tokens** - Long-lived tokens (7 days) stored in Redis with rotation
- **Token Refresh** - Automatic token refresh before expiration
- **Logout** - Invalidate tokens and clear sessions
- **Forgot Password** - Request password reset via email
- **Reset Password** - Set new password with time-limited token
- **Protected Routes** - Middleware to protect dashboard and other routes
