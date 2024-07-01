const mysql = require('mysql');

const dbConfig = {
    host: '127.0.0.1', //'host.docker.internal',//'127.0.0.1',
    port:3306,
    user: 'axsiom_ahadmin',//'Yash',//axsiom_ahadmin
    password: 'parlor-flier-polish',//'Wupv1674@',//parlor-flier-polish
    database: "axsiom_auctionhacker1",//'crm_collections', //axsiom_auctionhacker1
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