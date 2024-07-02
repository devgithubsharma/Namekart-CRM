const mysql = require('mysql');

const dbConfig = {
    host: process.env.host,
    port:process.env.port,
    user: process.env.hosted_user,
    password: process.env.hosted_pass,
    database: process.env.hosted_database,
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