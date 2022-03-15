"use strict";

const multer = require("multer");

module.exports = (app) => {
  const passport = require("passport");
  const indexController = require("./../Controller/IndexController");
  const usersController = require("./../Controller/UsersController");
  const postsController = require('../Controller/PostsController')
  const chatsController = require("../Controller/ChatsController")
  const fileController = require("../Controller/FileController");
  const mailController = require("../Controller/MailController");

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./");
    },
    filename: function (req, file, cb) {
      const ext = file.mimetype.split("/")[1];
      cb(
        null,
        `/uploads/${file.originalname.split(".")[0]}-${Date.now()}.${ext}`
      );
    },
  });
  
  const upload = multer({
    storage: storage,
  });

  app.route("/").get(indexController.index);
  
  app.route("/api/auth/signup").post(usersController.signup);
  app.route("/api/auth/signin").post(usersController.signin);
  app.route("/api/auth/userstatus").post(passport.authenticate('jwt', {session: false}), usersController.editStatus)
  app.route("/api/auth/avatar").post(upload.single("image"), fileController.upLoadAvatar)

  app.route("/user/friends").get(passport.authenticate('jwt', {session: false}), usersController.getFriends)
  app.route("/user/follow").post(passport.authenticate('jwt', {session: false}), usersController.follow)
  app.route('/user/unfollow').delete(passport.authenticate('jwt', {session: false}), usersController.unfollow)

  // app.route("/search/users").get(usersController.search)

  app.route("/user/profile").get(usersController.getUserById);
  app.route("/api/users").get(usersController.getAllUsers);

  app.route("/api/posts").get(postsController.getAllPosts);
  app.route("/api/posts/byid").get(passport.authenticate('jwt', {session: false}), postsController.getPostsByUserId)
  app.route("/api/addpost").post(upload.single("img"), postsController.addPost)
  app.route("/api/posts/like").post(postsController.like)
  // app.route("/api/posts/dislike").post(passport.authenticate('jwt', {session: false}), postsController.dislike)

  app.route("/api/dialogs").get(passport.authenticate('jwt', {session: false}), chatsController.getAllDialogs)
  app.route("/api/dialogs").post(passport.authenticate('jwt', {session: false}), chatsController.addDialog);
  app.route("/api/dialogs/byid").get(passport.authenticate('jwt', {session: false}), chatsController.getAllDialogsByUserId)
  app.route("/api/dialogs/message").get(passport.authenticate('jwt', {session: false}), chatsController.getAllMesssages)
  app.route("/api/dialogs/message").post(passport.authenticate('jwt', {session: false}), chatsController.addMessage);


  app.route("/api/sendmail").post(mailController.sendMail)
};