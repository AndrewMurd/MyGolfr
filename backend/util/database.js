const mysql = require("mysql");
const config = require("../config/config.json");

const pool = mysql.createPool({
  connectionLimit : 1000,
  connectTimeout  : 60 * 60 * 1000,
  acquireTimeout  : 60 * 60 * 1000,
  timeout         : 60 * 60 * 1000,
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
});

const executeQuery = (query, arr) => {
  return new Promise((resolve, reject) => {
    pool.query(query, arr, (error, elements) => {
      if (error) {
        return reject(error);
      }
      return resolve(elements);
    });
  });
};

module.exports = executeQuery;
