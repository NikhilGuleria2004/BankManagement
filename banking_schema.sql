-- Create Database
CREATE DATABASE banking_system;
USE banking_system;

-- Users Table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Accounts Table
CREATE TABLE accounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    account_type ENUM('checking', 'savings', 'credit') NOT NULL,
    balance DECIMAL(15, 2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Transactions Table (Fixed)
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    from_account INT DEFAULT NULL,
    to_account INT DEFAULT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    type ENUM('transfer', 'deposit', 'withdrawal') NOT NULL,
    FOREIGN KEY (from_account) REFERENCES accounts(id) ON DELETE SET NULL,
    FOREIGN KEY (to_account) REFERENCES accounts(id) ON DELETE SET NULL
);

-- Create Banking Admin User
CREATE USER 'banking_admin'@'localhost' IDENTIFIED BY 'secure_banking_password';
GRANT ALL PRIVILEGES ON banking_system.* TO 'banking_admin'@'localhost';
FLUSH PRIVILEGES;
