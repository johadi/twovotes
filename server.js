require('dotenv').load();
const express = require('express');
const app = express();
const path = require("path");

const mongoose = require("mongoose");
const logger = require('morgan');
//const User=require("./user");
const bodyParser = require('body-parser');

const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const passport = require("passport");
const flash = require("express-flash");


const urlencodedParser = bodyParser.urlencoded({extended: true});
const jsonParser = bodyParser.json();

const ejs = require("ejs");
const ejsmate = require("ejs-mate");

const routes = require("./routes/index");

const PORT = process.env.PORT || 4000;

app.engine("ejs", ejsmate);
app.set("view engine", "ejs");

app.use(urlencodedParser);
app.use(jsonParser);
//connect to the database
mongoose.connect(process.env.MONGODB_URI, function (err) {
  if (err) {
    console.error(err);
  }
  else {
    console.info("database connected");
  }
});

app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: "Keyboard Cat",
  store: new MongoStore({url: process.env.MONGODB_URI, autoReconnect: true})
}));
app.use(flash());

//initializing passport for use in express
app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  res.locals.user = req.user;
  next();
});
app.use(express.static(__dirname + "/resized_pictures"));
app.use(express.static(__dirname + "/public"));
app.use(logger("dev"));
app.use(routes);

app.listen(PORT, function (err) {
  if (err) console.error(err);
  else console.info(`listening to port ${PORT}`);
});



