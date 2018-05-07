const fs = require("fs");
const User = require("../models/user");
const async = require("async");

module.exports = {
  indexPage: function (req, res) {
    if (req.user) return res.redirect("/user/home");
    res.render("main/index", {
      title: "Login Page",
      message: req.flash("loginMessage"),
      signup_success: req.flash("signup_success")
    });
  },
  signupPage: function (req, res) {
    res.render("main/signup", {
      message: req.flash("msg1"),
      signup_success: req.flash("signup_success")
    });
  },
  singupPost: function (req, res, next) {
    if (
      req.body.username &&
      req.body.fname &&
      req.body.lname &&
      req.body.email &&
      req.body.gender !== "-select-" &&
      req.body.password && req.body.phone) {
      User.findOne({username: req.body.username}, function (err, result) {
        if (err) return next(err);
        if (result) {
          req.flash("msg1", "User already exists");
          return res.redirect("/signup");
        }

        //create respective folders first
        async.waterfall([
          function (callback) {
            fs.mkdir("resized_pictures/" + req.body.username, function (err) {
              if (err) return next(err);
              const success1 = 1;
              callback(null, success1);
            });
          },
          function (success1, callback) {
            if (success1 == 1) {
              fs.mkdir("resized_pictures/" + req.body.username + "/picture1", function (err) {
                if (err) return next(err);
                const success2 = 2;
                callback(null, success2);
              });
            } else {
              res.json("problem creating folder");
            }
          },
          function (success2, callback) {
            if (success2 == 2) {
              fs.mkdir("resized_pictures/" + req.body.username + "/picture2", function (err) {
                if (err) return next(err);
                const success3 = 3;
                callback(null, success3);
              });
            } else {
              res.json("problem 2 creating folder");
            }
          },
          function (success3, callback) {
            if (success3 == 3) {
              fs.mkdir("uploads/" + req.body.username, function (err) {
                if (err) return next(err);
                const success4 = 4;
                callback(null, success4);
              });
            } else {
              res.json("problem creating folder");
            }
          },
          function (success4, callback) {
            if (success4 == 4) {
              fs.mkdir("uploads/" + req.body.username + "/picture1", function (err) {
                if (err) return next(err);
                const success5 = 5;
                callback(null, success5);
              });
            } else {
              res.json("problem creating folder");
            }
          },
          function (success5) {
            if (success5 == 5) {
              fs.mkdir("uploads/" + req.body.username + "/picture2", function (err) {
                if (err) return next(err);

                //create user DB info since all folders have been created
                User.create({
                  username: req.body.username,
                  name: {
                    fname: req.body.fname,
                    lname: req.body.lname
                  },
                  email: req.body.email,
                  sex: req.body.gender,
                  password: req.body.password,
                  phone: req.body.phone

                }, function (err, user) {
                  if (err) return next(err);
                  if (!user) {
                    req.flash("msg1", "No user was created");
                    res.redirect("/signup");
                  }
                  req.flash("signup_success", "Sign up successful. Login to your account here.");
                  res.redirect("/");
                });
              });
            } else {
              res.json("problem creating folder");
            }
          }
        ]);
      });

    } else {
      req.flash("msg1", "All fields must be filled");
      res.redirect("/signup");
    }

  },
  loginPost: function (req, res, next) {
    if(!req.body.username || !req.body.password) {
      req.flash("loginMessage", "All fields are required");
      return res.redirect('/');
    }
    next();
  },
  //use to test JQuery Files
  checkingPost: function (req, res) {
    const clientData = {
      like: req.body.like,
      unlike: req.body.unlike,
      image: req.body.image
    };

    res.json(clientData);
  },
  checkingGet: function (req, res) {
    async.waterfall([
      function (callback) {
        fs.mkdir("resized_pictures/pic2", function (err) {
          if (err) throw err;
          const success = 1
          callback(null, success);
        });
      },
      function (success, callback) {
        if (success == 1) {
          fs.mkdir("resized_pictures/pic2/pic1", function (err) {
            if (err) throw err;
            const success2 = 1
            callback(null, success2);
          });
        } else {
          res.json("problem creating folder");
        }
      },
      function (success2) {
        if (success2 == 1) {
          fs.mkdir("resized_pictures/pic2/pic3", function (err) {
            if (err) throw err;
            res.json("All folders created successfully");
          });
        } else {
          res.json("problem 2 creating folder");
        }
      }
    ]);
  }
}
