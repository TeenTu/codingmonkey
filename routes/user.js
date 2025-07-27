const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const router = express.Router();

// 注册
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash]);
    res.json({ message: '注册成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 登录
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE username=?', [username]);
    if (rows.length === 0) return res.status(400).json({ error: '用户不存在' });
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: '密码错误' });
    req.session.userId = user.id;
    res.json({ message: '登录成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 登出
router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: '登出成功' });
  });
});

// 查询用户拥有的货币
router.get('/currencies', async (req, res) => {
  if (!req.session.userId) return res.status(401).json({ error: '未登录' });
  try {
    const [rows] = await pool.query('SELECT currency, amount FROM user_currencies WHERE user_id=?', [req.session.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;