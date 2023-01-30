const mysql = require("mysql");
const config = require("../config.json");

const pool = mysql.createPool({
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database,
});

// const executeQuery = async (query, arr, callback) => {
//   console.log("Started Execution");
//   const result = pool.getConnection((err, connection) => {
//     if (err) {
//       connection.release();
//       console.log(err);
//     }
//     console.log("Connected to Database");
//     console.log("Execution of Query: ", query);
//     connection.query(query, arr, (err, rows) => {
//       connection.release();
//       if (!err) {
//         callback(null, { rows: rows });
//         return rows;
//       }
//     })
//     connection.on("error", (err) => {
//       console.log(err);
//       return;
//     });
//   });
//   return result;
// };

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
