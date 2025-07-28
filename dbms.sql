-- Create new database and switch to it
CREATE DATABASE IF NOT EXISTS investment_db;
USE investment_db;

-- 产品表
CREATE TABLE product (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL
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

-- 持仓表：增加 holding_id 作为自增主键，product_id 可重复
CREATE TABLE holdings (
    holding_id   INT           NOT NULL AUTO_INCREMENT,
    product_id   INT           NOT NULL,
    buy_price    DECIMAL(18,2) NOT NULL,
    buy_amount   INT           NOT NULL,
    PRIMARY KEY (holding_id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);


-- 向产品表插入股票信息
INSERT INTO product (id, name) VALUES
(1, 'Apple Inc.'),
(2, 'Microsoft Corporation'),
(3, 'Amazon.com Inc.'),
(4, 'Tesla Inc.'),
(5, 'Alphabet Inc.');

-- 向产品当天价格表插入价格信息
INSERT INTO product_price (id, price) VALUES
(1, 173.62),
(2, 338.75),
(3, 134.52),
(4, 248.91),
(5, 128.47);

-- 向产品类型表插入类型信息（这里统一为股票类型）
INSERT INTO product_type (id, type) VALUES
(1, 'Stock'),
(2, 'Stock'),
(3, 'Stock'),
(4, 'Stock'),
(5, 'Stock');

-- 向产品剩余数量表插入库存信息
INSERT INTO product_quantity (id, amount) VALUES
(1, 1500),
(2, 1200),
(3, 950),
(4, 2000),
(5, 1800);

-- 向产品表插入基金名称
INSERT INTO product (id, name) VALUES
(6, 'Vanguard S&P 500 ETF'),
(7, 'Fidelity 500 Index Fund'),
(8, 'BlackRock Total Market Fund'),
(9, 'JP Morgan Global Bond Fund'),
(10, 'Goldman Sachs Growth Fund');

-- 向产品当天价格表插入基金价格
INSERT INTO product_price (id, price) VALUES
(6, 412.35),
(7, 238.72),
(8, 176.90),
(9, 98.45),
(10, 156.30);

-- 向产品类型表插入基金类型
INSERT INTO product_type (id, type) VALUES
(6, 'Fund'),
(7, 'Fund'),
(8, 'Fund'),
(9, 'Fund'),
(10, 'Fund');

-- 向产品剩余数量表插入基金可购数量
INSERT INTO product_quantity (id, amount) VALUES
(6, 5000),
(7, 3500),
(8, 4200),
(9, 6000),
(10, 2800);

-- 向产品表插入现金名称
INSERT INTO product (id, name) VALUES
(11, 'Cash');

-- 向产品价格表插入现金价格（单位：元）
INSERT INTO product_price (id, price) VALUES
(11, 1.00);

-- 向产品类型表插入现金类型
INSERT INTO product_type (id, type) VALUES
(11, 'Cash');

-- 向产品数量表插入现金数量
INSERT INTO product_quantity (id, amount) VALUES
(11, 100000);