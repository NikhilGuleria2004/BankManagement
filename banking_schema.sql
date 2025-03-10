-- Create Database
CREATE DATABASE IF NOT EXISTS banking_system;
USE banking_system;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts Table (Prevent Negative Balance)
CREATE TABLE IF NOT EXISTS accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_type ENUM('checking', 'savings', 'credit') NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00 CHECK (balance >= 0), -- Ensures balance is never negative
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transactions Table (Fixed & Improved)
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_account INT DEFAULT NULL,
    to_account INT DEFAULT NULL,
    amount DECIMAL(15, 2) NOT NULL CHECK (amount > 0), -- Prevents transactions with zero or negative amounts
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, -- Ensures correct timestamps
    type ENUM('transfer', 'deposit', 'withdrawal') NOT NULL,
    FOREIGN KEY (from_account) REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (to_account) REFERENCES accounts(id) ON DELETE SET NULL
);

-- Create Banking Admin User (Optional)
CREATE USER IF NOT EXISTS 'banking_admin'@'localhost' IDENTIFIED BY 'secure_banking_password';
GRANT ALL PRIVILEGES ON banking_system.* TO 'banking_admin'@'localhost';
FLUSH PRIVILEGES;

-- Indexing for faster queries (Optional)
CREATE INDEX idx_user_id ON accounts(user_id);
CREATE INDEX idx_from_account ON transactions(from_account);
CREATE INDEX idx_to_account ON transactions(to_account);
