const express = require("express");
const app = express();
const port = process.env.PORT || 4000;
const bodyParser = require("body-parser");
const corsMiddleware = require("./middleware/cors.middleware");
const routes = require("./settings/routes");
const passport = require("passport");

const path = require("path");

app.use(corsMiddleware);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());
app.use("/", express.static(path.join(__dirname, "/")));

require("./middleware/passport")(passport);

routes(app);

app.listen(port, () => {
  console.log("Server is working on: http://localhost:", port);
});
