const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const exchangeRouter = require('./routes/exchange');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/exchanges', exchangeRouter);

describe('换汇系统API', () => {
  let exchangeId;

  it('POST /api/exchanges 新增换汇记录', async () => {
    const res = await request(app)
      .post('/api/exchanges')
      .send({
        from_currency: 'USD',
        to_currency: 'CNY',
        amount: 100,
        rate: 7.2
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBeDefined();
    exchangeId = res.body.id;
  });

  it('GET /api/exchanges 获取所有换汇记录', async () => {
    const res = await request(app).get('/api/exchanges');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('PUT /api/exchanges/:id 更新换汇记录', async () => {
    const res = await request(app)
      .put(`/api/exchanges/${exchangeId}`)
      .send({
        from_currency: 'USD',
        to_currency: 'CNY',
        amount: 200,
        rate: 7.3
      });
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('更新成功');
  });

  it('DELETE /api/exchanges/:id 删除换汇记录', async () => {
    const res = await request(app).delete(`/api/exchanges/${exchangeId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('删除成功');
  });
});