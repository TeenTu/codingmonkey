const mysql = require('mysql2/promise');
const password = require('./dbs_pwd'); // Import password from dbs_pwd.js
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