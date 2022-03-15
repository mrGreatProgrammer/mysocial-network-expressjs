"use strict";

const response = require("./../response");

exports.index = (req, res) => {
  response.status(200, { message: "hello" }, res);
};
