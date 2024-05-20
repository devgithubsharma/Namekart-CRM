const mysql = require('mysql');

const dbConfig = {
    host: '127.0.0.1',
    port:3306,
    user: 'Yash',
    password: 'Wupv1674@',
    database: 'crm_collections',
    connectionLimit: 1000
  };

  const pool = mysql.createPool(dbConfig);

  // Function to get a connection from the pool
const getConnection = () => {
    return new Promise((resolve, reject) => {
      pool.getConnection((err, connection) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(connection);
      });
    });
  };

  module.exports = {
    getConnection
  };