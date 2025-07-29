-- product
INSERT INTO product (id, name, code) VALUES
(1, 'Apple Inc.', 'AAPL'),
(2, 'Microsoft Corporation', 'MSFT'),
(3, 'Amazon.com, Inc.', 'AMZN'),
(4, 'NVIDIA Corporation', 'NVDA'),
(5, 'Alphabet Inc.', 'GOOGL'),
(6, 'Meta Platforms, Inc.', 'META'),
(7, 'Tesla, Inc.', 'TSLA'),
(8, 'Berkshire Hathaway Inc. New', 'BRK-B'),
(9, 'JPM', 'JPM'),
(10, 'UNH', 'UNH'),
(11, 'V', 'V'),
(12, 'WMT', 'WMT'),
(13, 'JNJ', 'JNJ'),
(14, 'PG', 'PG'),
(15, 'HD', 'HD'),
(16, 'MA', 'MA'),
(17, 'DIS', 'DIS'),
(18, 'CRM', 'CRM'),
(19, 'INTC', 'INTC'),
(20, 'ADBE', 'ADBE'),
(21, 'NFLX', 'NFLX'),
(22, 'BAC', 'BAC'),
(23, 'AMD', 'AMD'),
(24, 'ORCL', 'ORCL'),
(25, 'CSCO', 'CSCO'),
(26, 'KO', 'KO'),
(27, 'PFE', 'PFE'),
(28, 'XOM', 'XOM'),
(29, 'T', 'T'),
(30, 'MMM', 'MMM'),

(31, 'Vanguard S&P 500 ETF', 'VOO'),
(32, 'SPDR S&P 500', 'SPY'),
(33, 'iShares Core S&P 500 ETF', 'IVV'),
(34, 'Vanguard Total Stock Market ETF', 'VTI'),
(35, 'Schwab US Dividend Equity ETF', 'SCHD'),
(36, 'Vanguard Growth ETF', 'VUG'),
(37, 'Vanguard Value ETF', 'VTV'),
(38, 'Vanguard High Dividend Yield ET', 'VYM'),
(39, 'Technology Select Sector SPDR', 'XLK'),
(40, 'Energy Select Sector SPDR Fund', 'XLE'),
(41, 'Financial Select Sector SPDR F', 'XLF'),
(42, 'iShares Russell 2000 ETF', 'IWM'),
(43, 'iShares Core S&P Mid-Cap ETF', 'IJH'),
(44, 'Vanguard FTSE Emerging Markets', 'VWO'),
(45, 'iShares MSCI Emerging Index Fun', 'EEM');

-- product_price
INSERT INTO product_price (id, price) VALUES
(1, 200.85),   -- AAPL
(2, 460.36),   -- MSFT
(3, 205.01),   -- AMZN
(4, 135.13),   -- NVDA
(5, 171.74),   -- GOOGL
(6, 647.48),   -- META
(7, 346.45),   -- TSLA
(8, 503.95),        -- BRK-B
(9, 264.00),        -- JPM
(10, 301.91),       -- UNH
(11, 365.19),       -- V
(12, 98.72),       -- WMT
(13, 155.21),       -- JNJ
(14, 169.88),       -- PG
(15, 368.29),       -- HD
(16, 585.59),       -- MA
(17, 113.04),       -- DIS
(18, 265.36),       -- CRM
(19, 19.54),       -- INTC
(20, 415.08),       -- ADBE
(21, 1207.22),       -- NFLX
(22, 44.13),       -- BAC
(23, 110.73),       -- AMD
(24, 165.52),       -- ORCL
(25, 63.04),       -- CSCO
(26, 72.09),       -- KO
(27, 23.48),       -- PFE
(28, 102.30),       -- XOM
(29, 27.79),       -- T
(30, 148.35);       -- MMM

-- product_type
INSERT INTO product_type (id, type) VALUES
(1, 'Stock'), (2, 'Stock'), (3, 'Stock'), (4, 'Stock'), (5, 'Stock'),
(6, 'Stock'), (7, 'Stock'), (8, 'Stock'), (9, 'Stock'), (10, 'Stock'),
(11, 'Stock'), (12, 'Stock'), (13, 'Stock'), (14, 'Stock'), (15, 'Stock'),
(16, 'Stock'), (17, 'Stock'), (18, 'Stock'), (19, 'Stock'), (20, 'Stock'),
(21, 'Stock'), (22, 'Stock'), (23, 'Stock'), (24, 'Stock'), (25, 'Stock'),
(26, 'Stock'), (27, 'Stock'), (28, 'Stock'), (29, 'Stock'), (30, 'Stock');

-- product_quantity
INSERT INTO product_quantity (id, amount) VALUES
(1, 1000), (2, 1000), (3, 1000), (4, 1000), (5, 1000),
(6, 1000), (7, 1000), (8, 1000), (9, 1000), (10, 1000),
(11, 1000), (12, 1000), (13, 1000), (14, 1000), (15, 1000),
(16, 1000), (17, 1000), (18, 1000), (19, 1000), (20, 1000),
(21, 1000), (22, 1000), (23, 1000), (24, 1000), (25, 1000),
(26, 1000), (27, 1000), (28, 1000), (29, 1000), (30, 1000);



-- product_price
INSERT INTO product_price (id, price) VALUES
(31, 541.76),   -- VOO
(32, 589.39),   -- SPY
(33, 592.15),   -- IVV
(34, 289.88),   -- VTI
(35, 26.17),    -- SCHD
(36, 413.14),   -- VUG
(37, 171.38),        -- VTV
(38, 129.02),        -- VYM
(39, 230.91),        -- XLK
(40, 81.52),        -- XLE
(41, 50.95),        -- XLF
(42, 205.07),        -- IWM
(43, 60.04),        -- IJH
(44, 47.00),        -- VWO
(45, 49.18);    -- EEM

-- product_type
INSERT INTO product_type (id, type) VALUES
(31, 'Fund'), (32, 'Fund'), (33, 'Fund'), (34, 'Fund'), (35, 'Fund'),
(36, 'Fund'), (37, 'Fund'), (38, 'Fund'), (39, 'Fund'), (40, 'Fund'),
(41, 'Fund'), (42, 'Fund'), (43, 'Fund'), (44, 'Fund'), (45, 'Fund');

-- product_quantity
INSERT INTO product_quantity (id, amount) VALUES
(31, 2000), (32, 2000), (33, 2000), (34, 2000), (35, 2000),
(36, 2000), (37, 2000), (38, 2000), (39, 2000), (40, 2000),
(41, 2000), (42, 2000), (43, 2000), (44, 2000), (45, 2000);


INSERT INTO users (id, name) VALUES (1, 'default_user');
INSERT INTO user_game_status (user_id, balance, remain_days) VALUES (1, 500000.00, 30);

INSERT INTO holdings (user_id, product_id, buy_price, buy_amount) VALUES
-- 股票持仓
(1, 1, 200.85, 100),  
(1, 2, 460.36, 50),   
(1, 3, 205.01, 80),   
(1, 4, 135.13, 30),   
(1, 5, 171.74, 75),   

-- 基金持仓
(1, 31, 395.20, 25),   
(1, 32, 225.40, 40);  