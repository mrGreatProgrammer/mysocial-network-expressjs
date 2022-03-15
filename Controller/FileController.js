"use strict";

const response = require("../response");
const db = require("../settings/db");

exports.upLoadAvatar = async (req, res, err) => {
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
    const image = req.file.filename;
    const id = req.query.userid;
    const sqlInsert = "UPDATE users SET `avatar` = ? WHERE id = ?;";
    await db.query(sqlInsert, [image, id], (err, result) => {
      if (err) {
        console.log(err);
        response.status(400, { message: err }, res);
      }

      if (result) {
        response.status(
          200,
          {
            reslt: result,
            message: "your image has been updated!",
          },
          res
        );
      }
    });
  } catch (error) {
    console.log(req.file);
    console.log("bodyyyy", req.body);
    console.log(error);
  }
};
