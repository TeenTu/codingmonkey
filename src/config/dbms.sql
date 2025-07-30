

-- Create new database and switch to it
CREATE DATABASE IF NOT EXISTS investment_db;
USE investment_db;

-- 用户表
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL
);

-- 用户游戏状态表
CREATE TABLE user_game_status (
    user_id INT PRIMARY KEY,
    balance DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    remain_days INT NOT NULL DEFAULT 30,
    max_day INT NOT NULL DEFAULT 30,
    is_game_over BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,    
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 产品表
CREATE TABLE product (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
		code VARCHAR(255), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 产品当天价格表
CREATE TABLE product_price (
    id INT PRIMARY KEY,
    price DECIMAL(18,2) NOT NULL,
    FOREIGN KEY (id) REFERENCES product(id)
);

-- 产品类型表
CREATE TABLE product_type (
    id INT PRIMARY KEY,
    type VARCHAR(100) NOT NULL,
    FOREIGN KEY (id) REFERENCES product(id)
);

-- 产品剩余数量表
CREATE TABLE product_quantity (
    id INT PRIMARY KEY,
    amount INT NOT NULL,
    FOREIGN KEY (id) REFERENCES product(id)
);

-- 持仓表：使用自增主键 holding_id
CREATE TABLE holdings (
    id   INT           NOT NULL AUTO_INCREMENT,
    user_id      INT           NOT NULL,
    product_id   INT           NOT NULL,
    buy_price    DECIMAL(18,2) NOT NULL,
    buy_amount   INT           NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);

