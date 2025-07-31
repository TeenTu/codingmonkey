const mysql = require('mysql2/promise');
// database pool config
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',      
  password: 'Zyq0137!',  
  database: 'investment_db',      
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;