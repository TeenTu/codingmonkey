const mysql = require('mysql2/promise');
const password = require('./dbs_pwd');
// database pool config
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',      
  password: password,  
  database: 'investment_db',      
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;