# Banking Backend API

A secure and robust banking backend API built with Node.js, Express, MySQL, and Sequelize following the MVC architecture.

## Features

- User authentication (register/login)
- Account management
- Transaction processing (deposits, withdrawals, transfers)
- Secure password hashing
- JWT-based authentication
- Database transactions for data integrity

## Prerequisites

- Node.js (v14 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a MySQL database named `bank_db`

4. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the database credentials and other settings in `.env`

5. Start the server:
   ```bash
   npm start
   ```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Accounts
- `POST /api/accounts` - Create a new account
- `GET /api/accounts` - Get all user accounts
- `GET /api/accounts/:accountNumber` - Get account details
- `GET /api/accounts/:accountNumber/balance` - Get account balance
- `PATCH /api/accounts/:accountNumber/status` - Update account status

### Transactions
- `POST /api/transactions/:accountNumber` - Create a new transaction
- `POST /api/transactions/:accountNumber/deposit` - Make a deposit
- `GET /api/transactions/:accountNumber` - Get account transactions

## Database Schema

### SQL Schema

```sql
-- Users table
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('customer', 'admin') DEFAULT 'customer',
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Accounts table
CREATE TABLE Accounts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    accountNumber VARCHAR(255) NOT NULL UNIQUE,
    balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    type ENUM('savings', 'checking', 'business') NOT NULL,
    status ENUM('active', 'inactive', 'frozen') DEFAULT 'active',
    userId INT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE Transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    amount DECIMAL(10,2) NOT NULL,
    type ENUM('deposit', 'withdrawal', 'transfer') NOT NULL,
    status ENUM('pending', 'completed', 'failed', 'reversed') DEFAULT 'pending',
    description VARCHAR(255),
    sourceAccountId INT NOT NULL,
    destinationAccountId INT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sourceAccountId) REFERENCES Accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (destinationAccountId) REFERENCES Accounts(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_accounts_userId ON Accounts(userId);
CREATE INDEX idx_transactions_sourceAccountId ON Transactions(sourceAccountId);
CREATE INDEX idx_transactions_destinationAccountId ON Transactions(destinationAccountId);
CREATE INDEX idx_transactions_createdAt ON Transactions(createdAt);
```

### Table Descriptions

#### Users
- `id`: Primary key, auto-incrementing integer
- `firstName`: User's first name
- `lastName`: User's last name
- `email`: Unique email address
- `password`: Hashed password
- `role`: User role (customer/admin)
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update

#### Accounts
- `id`: Primary key, auto-incrementing integer
- `accountNumber`: Unique account number
- `balance`: Current account balance
- `type`: Account type (savings/checking/business)
- `status`: Account status (active/inactive/frozen)
- `userId`: Foreign key to Users table
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update

#### Transactions
- `id`: Primary key, auto-incrementing integer
- `amount`: Transaction amount
- `type`: Transaction type (deposit/withdrawal/transfer)
- `status`: Transaction status
- `description`: Optional transaction description
- `sourceAccountId`: Foreign key to source account
- `destinationAccountId`: Foreign key to destination account (for transfers)
- `createdAt`: Timestamp of creation
- `updatedAt`: Timestamp of last update

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Protected routes
- Input validation
- Database transactions for data integrity
- Secure error handling

## Error Handling

The API includes comprehensive error handling for:
- Authentication failures
- Invalid inputs
- Database errors
- Transaction failures
- Resource not found
- Insufficient funds
- Invalid account status

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 