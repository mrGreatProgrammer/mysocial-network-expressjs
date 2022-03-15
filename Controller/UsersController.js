"use strict";

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const response = require("../response");
const db = require("../settings/db");
const config = require("../config");

// GET ALL USERS
exports.getAllUsers = (req, res) => {
  let users = db.query(
    "SELECT `id`, `name`, `second_name`, `email`, `avatar`, `status` FROM `users`",
    (err, rows, fields) => {
      if (err) {
        response.status(400, err, res);
      } else {
        const page = req.query.page;
        const count = req.query.count;
        const startIndex = (page - 1) * count;
        const endIndex = page * count;
        const paginatedUsers = rows.slice(startIndex, endIndex);

        response.status(
          200,
          { users: paginatedUsers, totalUsersCount: rows.length },
          res
        );
      }
    }
  );
};

// SIGN UP
exports.signup = (req, res) => {
  try {
    db.query(
      "SELECT `id`, `name`, `email` FROM `users` WHERE `email` = '" +
        req.body.email +
        "'",
      (err, rows, fields) => {
        if (err) {
          response.status(400, err, res);
        } else if (typeof rows !== "undefined" && rows.length > 0) {
          const row = JSON.parse(JSON.stringify(rows));
          row.map((rw) => {
            response.status(
              302,
              {
                message: `Пользователь с таким email - ${rw.email} уже зарегистрирован!!!`,
              },
              res
            );
            return true;
          });
        } else {
          const email = req.body.email;
          const name = req.body.name !== "" ? req.body.name : "Не указан";
          const second_name = req.body.second_name;
          const avatar = req.body.avatar;
          const userStatus = req.body.user_status;

          // шифруем пароль
          const salt = bcrypt.genSaltSync(5);
          const password = bcrypt.hashSync(req.body.password, salt);

          // регистрируем пользователя
          const sql =
            "INSERT INTO `users`(`name`, `second_name`, `password`, `email`, `avatar`, `status`) VALUES('" +
            name +
            "', '" +
            second_name +
            "', '" +
            password +
            "', '" +
            email +
            "', '" +
            avatar +
            "', '" +
            userStatus +
            "')";
          db.query(sql, (error, results) => {
            if (error) {
              response.status(400, error, res);
            } else {
              response.status(
                200,
                { message: `Регистрация прошла успешна`, results },
                res
              );
            }
          });
        }
      }
    );
  } catch (error) {
    console.log(error);
    response.status(500, { message: "внутренняя ошибка сервера" }, res);
  }
};

// SIGN IN
exports.signin = (req, res) => {
  db.query(
    "SELECT `id`, `name`, `second_name`, `email`, `password`, `avatar`, `status` FROM `users` WHERE `email` = '" +
      req.body.email +
      "'",
    (err, rows, fields) => {
      if (err) {
        response.status(400, err, res);
      } else if (rows.length <= 0) {
        response.status(
          401,
          {
            message: `Пользователь с email ${req.body.email} не найден. Пройдите регистарцию`,
          },
          res
        );
      } else {
        const row = JSON.parse(JSON.stringify(rows));
        row.map((rw) => {
          // проверяем верен ли пароль
          const password = bcrypt.compareSync(req.body.password, rw.password);
          if (password) {
            const token = jwt.sign({ id: rw.id, email: rw.email }, config.jwt, {
              expiresIn: 8600,
            }); // наш конфиг живёт 24часа
            // let user = rw.name
            response.status(
              200,
              {
                token: `Bearer ${token}`,
                user: {
                  id: rw.id,
                  name: rw.name,
                  second_name: rw.second_name,
                  avatar: rw.avatar,
                  user_status: rw.status,
                },
              },
              res
            );
          } else {
            // выкидываем ошибку что пароль не верен
            response.status(402, { message: "Пароль не верен" }, res);
          }
          return true;
        });
      }
    }
  );
};

exports.getUserById = async (req, res) => {
  try {
    await db.query(
      "SELECT `id`, `email`, `name`, `second_name`, `avatar`, `status` FROM `users` WHERE `id` = '" +
        req.query.id +
        "'",
      (err, rows, fields) => {
        if (err) {
          response.status(500, { message: "server err", res });
        } else if (rows.length === 0) {
          response.status(404, { message: "not found" }, res);
        } else {
          response.status(200, { user: rows }, res);
        }
      }
    );
  } catch (error) {
    console.log(error);
    response.status(500, { message: "server error", res });
  }
};

// SEARCHER
// exports.search = async (req, res) => {
//   try {
//     const searchName = req.query.search;

//       let files = await File.find({ user: req.user.id });
//       files = files.filter((file) => file.name.includes(searchName));
//       return response.status(200, {}, res )
//   } catch (err) {
//     console.log("users searcher ", err);
//     return response.status(500, { message: "server error" }, res);
//   }
// };

exports.getFriends = async (req, res) => {
  try {
    const sql =
      "SELECT `user_id`, `friends_id` FROM `friends` WHERE `user_id` =" +
      req.user[0].id;
    db.query(sql, (err, rows, fields) => {
      if (err) {
        response.status(400, err, res);
      } else {
        response.status(200, rows, res);
      }
    });
  } catch (error) {
    console.log(error);
    response.status(500, { message: "Server error" }, res);
  }
};

// FOLLOW
exports.follow = async (req, res) => {
  try {
    const userID = req.user[0].id;
    const friendsID = req.body.userid;
    const sql =
      "INSERT INTO `friends`(`user_id`, `friends_id`) VALUES('" +
      userID +
      "', '" +
      friendsID +
      "')";

    await db.query(sql, (err, results) => {
      if (err) {
        response.status(400, err, res);
      } else {
        response.status(200, { message: results }, res);
      }
    });
  } catch (err) {
    console.log(err);
    console.log("-----", req.user);
    response.status(500, { message: "Server error" }, res);
  }
};

exports.unfollow = async (req, res) => {
  try {
    const userID = req.user[0].id;
    const friendsID = req.query.userid;

    const sql =
      "DELETE FROM `friends` WHERE `user_id`='" +
      userID +
      "' AND '" +
      friendsID +
      "'";

    await db.query(sql, (err, results) => {
      if (err) {
        response.status(400, err, res);
      } else {
        response.status(200, { message: `unfollowed ${results}` }, res);
      }
    });
  } catch (error) {
    console.log(error);
    response.status(500, { message: "Server error" }, res);
  }
};

exports.editStatus = async (req, res) => {
  try {
    const userID = req.user[0].id;
    const statusTxt = req.body.status_text;
    const defaultStatus = "double click to add your status";

    const sql =
      "UPDATE `users` SET `status` = '" +
      statusTxt +
      "'" +
      " WHERE id = " +
      userID;

    await db.query(sql, (err, results) => {
      if (err) {
        response.status(400, err, res);
      } else {
        response.status(200, { message: results }, res);
      }
    });
  } catch (error) {
    console.log(error);
    response.status(500, { message: "Server error" }, res);
  }
};
