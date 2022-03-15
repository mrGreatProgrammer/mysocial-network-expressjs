const db = require("../settings/db");
const response = require("../response");

// GET ALL DIALOGS
exports.getAllDialogs = (req, res) => {
  try {
    const userID = req.user[0].id
    db.query(
      "SELECT `id`, `user_id`, `friends_id`, `name` FROM `dialogs` WHERE `user_id` =" + userID,
      (err, rows, fields) => {
        if (err) {
          response.status(400, err, res);
        } else {
          response.status(200, {dialogs: rows}, res);
        }
      }
    );
  } catch (error) {
    console.log(error);
    response.status(500, { message: "внутренняя ошибка сервера" }, res);
  }
};

// ADD DIALOG
exports.addDialog = async (req, res) => {
  try {
    const userID = req.query.userid;
    const friendsId = req.body.frindid;
    const dialogName = req.body.dialogname;

    const sql =
      "INSERT INTO `dialogs`(`user_id`, `friends_id`, `name`) VALUES('" +
      userID +
      "', '" +
      friendsId +
      "', '" +
      dialogName +
      "')";
    await db.query(sql, (err, results) => {
      if (err) {
        response.status(400, err, res);
      } else {
        response.status(200, { message: `Диалог добавлен ${results}` }, res);
      }
    });
  } catch (error) {
    console.log(error);
    response.status(500, { message: "внутренняя ошибка сервера" }, res);
  }
};

exports.getAllDialogsByUserId = async (req, res) => {
  try {
    await db.query(
      "SELECT `id`, `user_id`, `name`, `friends_id` FROM `dialogs` WHERE `friends_id` =" +
        req.body.user_id ,
      (err, rows, fields) => {
        if (err) {
          response.status(400, { message: err }, res);
        } else if (rows.length === 0) {
          response.status(404, { message: "not found" }, res);
        } else {
          response.status(200, { dialogs: rows }, res);
        }
      }
    );
  } catch (error) {
    console.log(error);
    response.status(500, { message: "Внутрення ошибка серевера" }, res);
  }
};

exports.getAllMesssages = async (req, res) => {
  try {
    await db.query(
      "SELECT `id`, `dialog_id`, `text_message`, `from_who`, `sent_at` FROM `messages` WHERE `dialog_id`=" +
        req.query.dialogsid,
      (err, rows, fields) => {
        if (err) {
          response.status(500, { message: err }, res);
        } else if (rows.length === 0) {
          response.status(404, { message: "not found any messages" }, res);
        } else {
          response.status(200, { messages: rows }, res);
        }
      }
    );
  } catch (error) {
    console.log(error);
    response.status(500, { message: "Внутренняя ошибка сервера" }, res);
  }
};

exports.addMessage = async (req, res) => {
  try {
    const dialogsId = req.body.dialogsid;
    const text = req.body.text;
    const fromWho = req.query.userid;
    const whenSent = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const expires = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const sql =
      "INSERT INTO `messages`(`dialog_id`, `text_message`, `from_who`, `sent_at`, `expires`) VALUES('" +
      dialogsId +
      "', '" +
      text +
      "', '" +
      fromWho +
      "', '" +
      whenSent +
      "', '" +
      expires +
      "')";
    await db.query(sql, (err, results) => {
      if (err) {
        response.status(400, err, res);
      } else {
        response.status(200, { message: `Message sent ${results}` }, res);
      }
    });
  } catch (error) {
    console.log(err);
    response.status(500, { message: "Внутренняя ошибка сервера" }, res);
  }
};
