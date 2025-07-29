-- 插入默认用户
INSERT INTO users (id, name) VALUES
(1, 'Default User');

-- 插入默认用户的现金余额
INSERT INTO user_cash_balance (user_id, balance) VALUES
(1, 500000.00);

-- 向产品表插入股票信息
INSERT INTO product (id, name, code) VALUES
(1, 'Apple Inc.', 'AAPL.US'),
(2, 'Microsoft Corporation', '123'),
(3, 'Amazon.com Inc.', '123'),
(4, 'Tesla Inc.', 'TSLA.US'),
(5, 'Alphabet Inc.', '123');

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
(11, 'RMB');

-- 向产品价格表插入现金价格（单位：元）
INSERT INTO product_price (id, price) VALUES
(11, 1.00);

-- 向产品类型表插入现金类型
INSERT INTO product_type (id, type) VALUES
(11, 'Cash');

-- 向产品数量表插入现金数量
INSERT INTO product_quantity (id, amount) VALUES
(11, 100000);

-- 向持仓表插入测试数据（所有数据归属于默认用户 id=1）
INSERT INTO holdings (user_id, product_id, buy_price, buy_amount) VALUES
-- 股票持仓
(1, 1, 165.50, 100),  -- Apple Inc. 持仓100股，买入价165.50
(1, 2, 320.25, 50),   -- Microsoft Corporation 持仓50股，买入价320.25
(1, 3, 125.80, 80),   -- Amazon.com Inc. 持仓80股，买入价125.80
(1, 4, 235.60, 30),   -- Tesla Inc. 持仓30股，买入价235.60
(1, 5, 115.30, 75),   -- Alphabet Inc. 持仓75股，买入价115.30

-- 基金持仓
(1, 6, 395.20, 25),   -- Vanguard S&P 500 ETF 持仓25份，买入价395.20
(1, 7, 225.40, 40),   -- Fidelity 500 Index Fund 持仓40份，买入价225.40
(1, 8, 168.75, 60),   -- BlackRock Total Market Fund 持仓60份，买入价168.75
(1, 9, 92.80, 100),   -- JP Morgan Global Bond Fund 持仓100份，买入价92.80
(1, 10, 148.90, 20),  -- Goldman Sachs Growth Fund 持仓20份，买入价148.90

-- 现金持仓
(1, 11, 1.00, 50000); -- RMB现金 50,000元
