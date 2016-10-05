var express = require('express');
var app = express();
var path=require("path");

var mongoose=require("mongoose");
var logger = require('morgan');
//var User=require("./user");
var bodyParser = require('body-parser');

var cookieParser=require("cookie-parser");
var session=require("express-session");
var MongoStore=require("connect-mongo")(session);
var passport=require("passport");
var flash=require("express-flash");


var urlencodedParser = bodyParser.urlencoded({ extended: true });
var jsonParser=bodyParser.json();

var ejs=require("ejs");
var ejsmate=require("ejs-mate");

var routes=require("./routes/index");

app.engine("ejs",ejsmate);
app.set("view engine","ejs");

app.use(urlencodedParser);
app.use(jsonParser);
//connect to the database
mongoose.connect("mongodb://127.0.0.1/voting",function(err){
    if(err){console.log(err);}
    else{console.log("database connected");}
});

app.use(cookieParser());
app.use(session({
    resave :true,
    saveUninitialized: true,
    secret: "Keyboard Cat",
    store: new MongoStore({url:"mongodb://127.0.0.1/voting",autoReconnect: true})
}));
app.use(flash());

//initializing passport for use in express
app.use(passport.initialize());
app.use(passport.session());

app.use(function(req,res,next){
    res.locals.user=req.user;
    next();
});
app.use(express.static(__dirname+"/resized_pictures"));
app.use(express.static(__dirname+"/public"));
app.use(logger("dev"));
app.use(routes);

app.listen(4000,function(err){
    if(err)console.log(err);
    else console.log("listening to port 4000");
})



