"use strict";

const db = require("../settings/db");
const response = require("../response");

// GET ALL POSTS
exports.getAllPosts = (req, res) => {
  try {
    db.query(
      "SELECT `id`, `user_id`, `title`, `text_content`, `photo`, `likes`, `created` FROM `posts`",
      (err, rows, fields) => {
        if (err) {
          response.status(400, err, res);
        } else {
          response.status(200, {posts: rows}, res);
        }
      }
    );
  } catch (error) {
    console.log(error);
    response.status(500, { message: "внутренняя ошибка сервера" }, res);
  }
};

// ADD POST
exports.addPost = (req, res) => {
  try {

    if (
      !req.file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)
    ) {
      response.status(
        400,
        { message: "Only image files (jpg, jpeg, png) are allowed!" },
        res
      );
    }

    const userId = req.query.userid;
    const title = req.query.title;
    const textContent = req.query.text_content;
    const photo = req.file.filename;
    let likes = 0;
    let created = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // добавляем пост
    const sql =
      "INSERT INTO `posts`(`user_id`, `title`, `text_content`, `photo`, `likes`, `created`) VALUES('" +
      userId +
      "', '" +
      title +
      "', '" +
      textContent +
      "', '" +
      photo +
      "', '" +
      likes +
      "', '" +
      created +
      "')";

    db.query(sql, (err, results) => {
      if (err) {
        response.status(400, err, res);
      } else {
        response.status(200, { message: `Пост добавлен ${results}`,}, res);
      }
    });
  } catch (error) {
    console.log("fileee", req.file);
    console.log("boddddyy", req.body);
    // console.log("heeaader", req.header);
    console.log(error);
    response.status(500, { message: "внутренняя ошибка сервера" }, res);
  }
};

exports.getPostsByUserId = async (req, res) => {
  try {
    const userID = req.query.userid
    await db.query(
      "SELECT `id`, `user_id`, `title`, `text_content`, `photo`, `likes`, `created` FROM `posts` WHERE `user_id` = " +
        userID,
      (err, rows, fields) => {
        if (err) {
          response.status(400, { message: err},res );
        } else if (rows.length === 0) {
          response.status(404, { message: "not found" }, res);
        } else {
          response.status(200, { posts: rows }, res);
        }
      }
    );
  } catch (error) {
    console.log(error);
    response.status(500, { message: "serever error", res });
  }
};


exports.like = async (req, res) => {
  try {
    const likes = req.body.likes
    const postId = req.body.postid

    const sql = "UPDATE `posts` SET `likes` = " + likes + " WHERE `id`=" + postId

    await db.query(sql, (err, results)=>{
      if (err) {
        response.status(400, err, res);
      } else {
        response.status(200, {message: `liked ${results}`}, res)
      }
    })
  } catch (error) {
    console.log(error);
    response.status(500, {message: "внутренняя ошибка сервера"}, res)
  }
}

// exports.dislike = (req, res) => {

// }