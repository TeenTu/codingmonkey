CREATE DATABASE exchange_db;
USE exchange_db;
CREATE TABLE exchanges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  from_currency VARCHAR(10),
  to_currency VARCHAR(10),
  amount DECIMAL(18,2),
  rate DECIMAL(10,4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE user_currencies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  currency VARCHAR(10) NOT NULL,
  amount DECIMAL(18,2) DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);