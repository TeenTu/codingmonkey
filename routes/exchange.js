const express = require('express');
const router = express.Router();
const pool = require('../db');

// 获取所有换汇记录
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM exchanges');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 新增换汇记录
router.post('/', async (req, res) => {
  const { from_currency, to_currency, amount, rate } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO exchanges (from_currency, to_currency, amount, rate) VALUES (?, ?, ?, ?)',
      [from_currency, to_currency, amount, rate]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 更新换汇记录
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { from_currency, to_currency, amount, rate } = req.body;
  try {
    await pool.query(
      'UPDATE exchanges SET from_currency=?, to_currency=?, amount=?, rate=? WHERE id=?',
      [from_currency, to_currency, amount, rate, id]
    );
    res.json({ message: '更新成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 删除换汇记录
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM exchanges WHERE id=?', [id]);
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;