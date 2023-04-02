const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 1000,
  connectTimeout: 60 * 60 * 1000,
  acquireTimeout: 60 * 60 * 1000,
  timeout: 60 * 60 * 1000,
  host: process.env.host,
  user: process.env.user,
  password: process.env.password,
  database: process.env.database,
});

const executeQuery = (query, arr) => {
  return new Promise((resolve, reject) => {
    try {
      pool.query(query, arr, (error, elements) => {
        if (error) {
          return reject(error);
        }
        return resolve(elements);
      });
    } catch (error) {
      console.log(error);
    }
  });
};

module.exports = executeQuery;
