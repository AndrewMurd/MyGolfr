const mysql = require("mysql");

const pool = mysql.createPool({
  connectionLimit: 1000,
  connectTimeout: 60 * 60 * 1000,
  acquireTimeout: 60 * 60 * 1000,
  timeout: 60 * 60 * 1000,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABSE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
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
