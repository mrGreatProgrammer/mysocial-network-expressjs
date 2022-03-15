const mysql = require("mysql");
const config = require("../config")

const connection = mysql.createConnection({
  host: config.HOST,
  socketPath: config.SOCKET,
  port: config.PORT,
  user: config.DBUSER,
  password: config.DBPASSWORD,
  database: config.DBNAME,
});

connection.connect((err) => {
  if (err) {
    return console.log("Ошибка подключение к БД", err.message);
  } else {
    return console.log("Подключение к БД прошло успешно");
  }
});

module.exports = connection;
