const request = require('supertest');
const express = require('express');
const mysql = require('mysql2');
const app = require('../index'); // ต้อง export app จาก index.js (module.exports = app;)

// Mock Database Connection (Simple Mock)
jest.mock('mysql2', () => ({
  createConnection: () => ({
    query: (sql, params, callback) => {
      if (sql.includes('SELECT * FROM personnel')) {
        return callback(null, [{ username: 'testuser', password: 'hashedpassword', role: 'user' }]);
      }
      callback(null, []);
    }
  })
}));

describe('API Endpoints', () => {
  it('GET /materials should return status 200', async () => {
    const res = await request(app).get('/materials');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('POST /login should fail with wrong credentials', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        username: 'wronguser',
        password: 'wrongpassword'
      });
    expect(res.body).toEqual("No Record"); // Or whatever your API returns
  });
});