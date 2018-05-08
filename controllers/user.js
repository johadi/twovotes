require('dotenv').load();
const Post = require("../models/post");
const User = require("../models/user");
const Count = require("../models/postCount");
const Reaction = require("../models/user_reaction");
const appendix = require("./appendix");
const async = require("async");
const fs = require("fs");

const multer = require("multer");//saves pictures
const jimp = require("jimp");//for resizing pictures
const isProduction = process.env.NODE_ENV === 'production';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/' + req.user.username + '/picture1');
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    cb(null, req.body.postId + "." + ext.toLowerCase());
  }
});
const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/' + req.user.username + '/picture2');
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    cb(null, req.body.postId + "." + ext.toLowerCase());
  }
});

const storageProfileImage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/profile_pictures');
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();
    cb(null, req.user.username + "." + ext.toLowerCase());
  }
});
const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();

    if (ext.toLowerCase() == 'jpg' || ext.toLowerCase() == 'jpeg' || ext.toLowerCase() == 'png') {
      req.flash("success_msg", "First Picture uploaded successfully");
      req.session.postId = req.body.postId;
      req.session.ext1 = ext.toLowerCase();
      req.session.path1 = "/" + req.user.username + "/picture1/" + req.body.postId + "." + ext.toLowerCase();
      return cb(null, true);
    }
    else {
      //req.fileValidationError="this file is not allowed";
      req.flash("message", ext + " file not allowed");
      return cb(null, false);
    }

  }

}).single("picture1");

const upload2 = multer({
  storage: storage2,
  fileFilter: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();

    if (ext.toLowerCase() == 'jpg' || ext.toLowerCase() == 'jpeg' || ext.toLowerCase() == 'png') {
      req.flash("success_msg", "Second Picture uploaded successfully");
      req.session.ext2 = ext.toLowerCase();
      req.session.postId = req.body.postId;
      req.session.path2 = "/" + req.user.username + "/picture2/" + req.body.postId + "." + ext.toLowerCase();
      return cb(null, true);
    }
    else {
      //req.fileValidationError="this file is not allowed";
      req.flash("message", ext + " file not allowed");
      return cb(null, false);
    }

  }

}).single("picture2");

const uploadProfileImage = multer({
  storage: storageProfileImage,
  fileFilter: function (req, file, cb) {
    const ext = file.originalname.split(".").pop();

    if (ext.toLowerCase() == 'jpg' || ext.toLowerCase() == 'jpeg' || ext.toLowerCase() == 'png') {
      req.session.postId = req.body.postId;
      req.session.imgExt = ext.toLowerCase();
      //req.session.path1="/"+req.user.username+"/picture1/"+req.body.postId+"."+ext.toLowerCase();
      return cb(null, true);
    }
    else {
      console.log(ext + " file not allowed");
      //req.fileValidationError="this file is not allowed";
      return cb(null, false, new Error('I don\'t have a clue!'));
    }

  }

}).single("photoimg");

module.exports = {
  userHomePage: function (req, res) {
    Post.find({})
      .sort({date: -1})
      .populate("poster")
      .exec(function (err, rs) {
        if (err) throw err;
        res.render("user/home", {posts: rs});
      });
  },
  userPostsPage: function (req, res) {
    Post.find({ poster: req.user._id })
      .sort({date: -1})
      .populate("poster")
      .exec(function (err, rs) {
        if (err) throw err;
        res.render("user/user_posts_page", {posts: rs});
      });
  },

  userPost1Get: function (req, res) {
    async.waterfall([
      function (callback) {
        appendix.getPostCount(function (count) {//returns count and add 1 to it for use
          callback(null, count);
        });
      },
      function (count) {
        let path2 = "/uploads/default.jpg";
        const path1 = "/uploads/default.jpg";
        if (req.session && req.session.path2) {
          path2 = req.session.path2;
        }

        res.render("user/post_page", {
          msg: req.user.username,
          count,
          path1,
          path2,
          message: req.flash("message"),
          success_msg: req.flash("success_msg")
        });

      }
    ]);
  },

  userPost1Post: function (req, res) { //handles first picture post
    if(isProduction) {
      appendix.uploadToCloudinary(req, res, 'picture1');
    } else {
      upload(req, res, function (err) {
        if (err) throw err;
        if (!req.file) {
          req.flash("message", "Choose valid image");
          return res.redirect("/user/post");
        }
        const ext = req.file.originalname.split(".").pop();
        const filename = req.body.postId + "." + ext.toLowerCase();

        const oldPath = "uploads/" + req.user.username + "/picture1/" + filename;
        const newPath = "resized_pictures/" + req.user.username + "/picture1/" + filename;
        //resize the picture,save it and redirect page to "post-2"

        let goto = "/user/post-2";
        if (req.session.path2) {
          goto = '/user/post-all';
        }

        appendix.uploadPhoto(res, jimp, oldPath, newPath, goto);
      });
    }
  },

  userPost2Get: function (req, res) {
    const count = req.session.postId;
    if (req.session && req.session.path2) {
      req.session.path2 = null;
    }
    const path1 = req.session.path1;
    const path2 = "/uploads/default.jpg";
    res.render("user/post_page2", {
      msg: req.user.username,
      path1,
      path2,
      count,
      message: req.flash("message"),
      success_msg: req.flash("success_msg")
    });

  },

  userPost2Post: function (req, res) { //handles second pic post
    if(isProduction) {
      appendix.uploadToCloudinary(req, res, 'picture2');
    } else {
      upload2(req, res, function (err) {
        if (err) throw err;
        if (!req.file) {
          req.flash("message", "Choose valid image");
          return res.redirect("/user/post-2");
        }
        const ext = req.file.originalname.split(".").pop();
        const filename = req.body.postId + "." + ext.toLowerCase();

        const oldPath = "uploads/" + req.user.username + "/picture2/" + filename;
        const newPath = "resized_pictures/" + req.user.username + "/picture2/" + filename;
        //resize the picture,save it and redirect page to "post-all"
        appendix.uploadPhoto(res, jimp, oldPath, newPath, "/user/post-all");

      });
    }
  },

  userPostAllGet: function (req, res) {
    if (req.session && req.session.path1 && req.session.path2 && req.session.postId) {
      res.render("user/post_page_all", {
        message: req.flash("message"),
        success_msg: req.flash("success_msg"),
        ext1: req.session.ext1,
        ext2: req.session.ext2,
        postId: req.session.postId,
        pic_path1: req.session.path1,
        pic_path2: req.session.path2
      });
    }
    else {
      res.json("something is wrong");
    }
  },
  //handles all pic post
  userPostAllPost: function (req, res) {
    if (
      req.body.posterId &&
      req.body.postId &&
      req.body.pic_path1 &&
      req.body.pic_path2 &&
      req.body.title
    ) {

      async.waterfall([
        function (callback) {
          //check if user already posted with this post Id
          appendix.checkPost(req.body.postId, req.body.posterId, function (status) {
            callback(null, status);
          });
        },
        function (status) {
          //if user already posted,just redirect
          if (status) {
            //unset all sessions before redirect
            req.session.path1 = null;
            req.session.path2 = null;
            req.session.ext1 = null;
            req.session.ext1 = null;
            req.session.postId = null;


            res.redirect("/user/home");
          } else {//if user has not posted,create new post

            const title = req.body.title;
            const posterId = req.body.posterId;
            const postId = req.body.postId;
            // save post info to Db,update post count in PostCount and redirect
            appendix.savePostToDB(
              req, res, title, posterId, postId, req.body.pic_path1, req.body.pic_path2, "/user/home"
            );
          }
        }
      ]);
    } else {
      req.flash("message", "Something\'s wrong, check Your Post title")
      res.redirect("/user/post-all");
    }
  },
  userProfile: function (req, res) {
    if (req.user) {
      return res.render("user/profile");
    }

    res.json("error! page not found");
  },
  updateUserGet: function (req, res) {
    if (req.user) {
      return res.render("user/update_profile",
        {
          success_msg: req.flash("success_msg"),
          message: req.flash("message"),
          imageErrorMessage: req.flash("imageErrorMessage"),
          imageSuccessMessage: req.flash("imageSuccessMessage"),
        });
    }

    res.json("error! page not found");
  },
  updateUserPost: function (req, res) {
    if (!req.body.email || !req.body.sex || !req.body.phone || !req.body.lname || !req.body.fname) {
      req.flash('message', 'All fields are required');
      return res.redirect('/user/update-profile');
    }
    const body = req.body;
    body.name = {
      fname: body.fname,
      lname: body.lname
    };

    User.findOneAndUpdate({username: req.user.username}, {$set: body}, {returnNewDocument: true})
      .then(() => {
        req.flash('success_msg', 'Profile updated successfully');
        res.redirect('/user/update-profile')
      })
      .catch(err => res.json({err}));
  },
  userUpload: function (req, res) {
    uploadProfileImage(req, res, function (err) {
      console.log('REqqq', req.file);
      if (err) throw err;
      if (!req.file) {
        req.flash("imageErrorMessage", "Choose valid image");
        return res.redirect("/user/update-profile");
      }

      const ext = req.file.originalname.split(".").pop();
      const filename = req.user.username + "." + ext.toLowerCase();

      const oldPath = "public/profile_pictures/" + filename;
      const newPath = "public/profile_pictures/" + filename;
      jimp.read(oldPath, function (err, image) {
        if (err) throw err;
        image.resize(200, 200)
          .quality(100)
          .write(newPath);
        User.findById(req.user._id)
          .then(user => {
            const avatarPath = "/profile_pictures/" + filename;
            user.user_avatar = avatarPath;
            user.save(function (savedErr) {
              if(savedErr) return res.json('Error occurred');
              return res.redirect("/user/update-profile");
            });
          });
      });

    });
  },
  userUpload2: function (req, res) {
    //res.redirect("/user/update-profile");
    res.json("hello");

  },
  processLike: function (req, res) {
    //res.json(clientData);
    if (req.body.posterId && req.body.postId && req.body.likeType && req.body.userId) {
      const posterId = req.body.posterId;
      const postId = req.body.postId;
      const userId = req.body.userId;

      //likeType==1 - person click the 1st like
      if (req.body.likeType == 1) {//check which type of like is Coming
        Reaction.findOne({post: postId, voter: userId, poster: posterId}, function (err, rs) {
          if (err) throw err;
          if (rs) {
            const status = rs.vote_status;
            if (status == 1) { //person wants to unlike the 1st post:the two links become like and remove this reaction from DB
              //Also, decrease the vote of 1 in Post DB and return the new votes
              Reaction.findOneAndRemove({_id: rs._id}, function (err, remove) {
                if (err) throw err;
                //Decrease Vote 1
                const condition = {_id: postId};
                const update = {$inc: {"picture.pic1.votes": -1}};
                Post.update(condition, update, function (err, votex) {//decreasing the Post Vote 1
                  if (err) throw err;
                  //votex={ok: 1,nModified :1, n=1}
                  if (votex.ok == 1 && votex.nModified == 1 && votex.n == 1) {
                    Post.findById(postId, function (err, post) {

                      const vote1 = post.picture.pic1.votes;
                      const vote2 = post.picture.pic2.votes;

                      //to change the like status in Post sub-document "reactions"
                      for (let i = 0; i < post.reactions.length; i++) {
                        if (userId == post.reactions[i].voter) {
                          post.reactions[i].like1Status = "Like";
                          post.reactions[i].like2Status = "Like";

                          post.save(function (err) {
                            if (err) throw err;

                            console.log(votex.ok);

                            const like1 = "Like";
                            const like2 = "Like";
                            const clientData = {
                              likeType: 1,
                              vote1: vote1,
                              vote2: vote2,
                              like1: like1,
                              like2: like2
                            }
                            res.json(clientData);
                          });

                          return;
                        }
                      }

                    });
                  }
                });
              });

              //person wants to like the 1st post:1st post becomes
              // unlike and 2nd post becomes like, update Reaction
            } else if (status == 2) {
              // DB status to 1 . Also, increase the vote of 1 and decrease
              // the vote of 2 in Post DB ,then return the two votes

              rs.vote_status = 1;
              rs.save(function (err) {
                if (err) throw err;

                //decrease the vote of 2 in post DB before increasing vote of 1
                const condition = {_id: postId};
                const updateVote2 = {$inc: {"picture.pic2.votes": -1}}; //decrease condition of votes 2
                Post.update(condition, updateVote2, function (err, votey) {//decreasing the Post Vote 2
                  if (err) throw err;
                  if (votey.ok == 1 && votey.nModified == 1 && votey.n == 1) {
                    //All is well, Increase Vote 1 now
                    const updateVote1 = {$inc: {"picture.pic1.votes": 1}};//increase condition condition of vote 1
                    Post.update(condition, updateVote1, function (err, votex) {// increasing the Post Vote 1
                      if (err) throw err;
                      //votex={ok: 1,nModified :1, n=1}
                      if (votex.ok == 1 && votex.nModified == 1 && votex.n == 1) {
                        Post.findById(postId, function (err, post) {
                          const vote1 = post.picture.pic1.votes;
                          const vote2 = post.picture.pic2.votes;

                          //to change the like status in Post sub-document "reactions"
                          for (let i = 0; i < post.reactions.length; i++) {
                            if (userId == post.reactions[i].voter) {
                              post.reactions[i].like1Status = "Unlike";
                              post.reactions[i].like2Status = "Like";

                              post.save(function (err) {
                                if (err) throw err;


                                console.log(votex.ok);

                                const like1 = "Unlike";
                                const like2 = "Like";
                                const clientData = {
                                  likeType: 1,
                                  vote1: vote1,
                                  vote2: vote2,
                                  like1: like1,
                                  like2: like2
                                }
                                res.json(clientData);
                                //res.json("good "+vote1);
                              });
                              return;
                            }
                          }
                        });
                      }

                    });
                  }


                });
              });
            }

          } else {//if user has never reacted, create new reaction and increase the post votes accordingly
            //the link1 becomes Unlike while link2 becomes like
            const reaction = new Reaction();
            reaction.post = postId;
            reaction.poster = posterId;
            reaction.voter = userId;
            reaction.vote_status = 1;

            reaction.save(function (err) {
              if (err) throw err;

              const condition = {_id: postId};
              const update = {$inc: {"picture.pic1.votes": 1}}; //increase condition of votes 1
              Post.update(condition, update, {new: true}, function (err, votex) {//inreasing the Post Vote 1
                if (err) throw err;
                //votex={ok: 1,nModified :1, n=1}
                if (votex.ok == 1 && votex.nModified == 1 && votex.n == 1) {
                  Post.findById(postId, function (err, post) {
                    const vote1 = post.picture.pic1.votes;
                    const vote2 = post.picture.pic2.votes;

                    //update reactions or push new reaction dependng on previous reaction of the user
                    let found = 0; //indicates if this user reacted to the post before
                    let foundIndex = -1; //to grab the index should the user ever reacted
                    for (let i = 0; i < post.reactions.length; i++) {
                      if (userId == post.reactions[i].voter) {
                        found++;
                        foundIndex = i;
                        break;
                      }
                    }

                    if (found > 0 && foundIndex != -1) {
                      post.reactions[foundIndex].like1Status = "Unlike";
                      post.reactions[foundIndex].like2Status = "Like";
                    } else {
                      post.reactions.push({voter: userId, like1Status: "Unlike", like2Status: "Like"});
                    }
                    //save the status of like 1 and like 2
                    post.save(function (err) {
                      if (err) throw err;

                      console.log(votex.ok);

                      const like1 = "Unlike";
                      const like2 = "Like";
                      const clientData = {
                        likeType: 1,
                        vote1: vote1,
                        vote2: vote2,
                        like1: like1,
                        like2: like2
                      }
                      res.json(clientData);
                      //res.json("good "+vote1);

                    });
                  });
                }
              });

            });

          }
        });

      } else {//else of if likeType==1

        //likeType==2
        Reaction.findOne({post: postId, voter: userId, poster: posterId}, function (err, rs) {
          if (err) throw err;
          if (rs) {
            const status = rs.vote_status;
            // Note: 1 is for 1st vote and 2 is 2nd vote in Post DB
            // person wants to unlike the 2nd post:the two links become like and remove this reaction from DB
            // Also, decrease the vote of 2 in Post DB and return the new votes
            if (status == 2) {
              Reaction.findOneAndRemove({_id: rs._id}, function (err, remove) {
                if (err) throw err;

                //decrease vote 2
                const condition = {_id: postId};

                const update = {$inc: {"picture.pic2.votes": -1}};
                Post.update(condition, update, function (err, votey) {//decreasing the Post Vote 2
                  if (err) throw err;
                  //votey={ok: 1,nModified :1, n=1}
                  if (votey.ok == 1 && votey.nModified == 1 && votey.n == 1) {
                    Post.findById(postId, function (err, post) {
                      const vote1 = post.picture.pic1.votes;
                      const vote2 = post.picture.pic2.votes;

                      for (let i = 0; i < post.reactions.length; i++) {//to change the like status in Post sub-document "reactions"
                        if (userId == post.reactions[i].voter) {
                          post.reactions[i].like1Status = "Like";
                          post.reactions[i].like2Status = "Like";

                          post.save(function (err) {
                            if (err) throw err;

                            console.log(votey.ok);

                            const like1 = "Like";
                            const like2 = "Like";
                            const clientData = {
                              likeType: 2,
                              vote1: vote1,
                              vote2: vote2,
                              like1: like1,
                              like2: like2
                            }
                            res.json(clientData);
                            //res.json("good "+vote1);
                          });
                          return;
                        }
                      }

                    });
                  }
                });

              });
              // person wants to like the 2nd post:2nd post becomes unlike and 1st post becomes like, update DB
              // status to 2. Also, increase the vote of 2 and decrease the vote of 1 in Post DB ,
              // then return the two votes
            } else if (status == 1) {
              rs.vote_status = 2;
              rs.save(function (err) {
                if (err) throw err;

                //decrease the vote of 1 in post DB before increasing vote of 2
                const condition = {_id: postId};
                const updateVote1 = {$inc: {"picture.pic1.votes": -1}};
                Post.update(condition, updateVote1, function (err, votey) {//decreasing the Post Vote 1
                  if (err) throw err;
                  if (votey.ok == 1 && votey.nModified == 1 && votey.n == 1) {
                    //All is well, Increase Vote 2 now
                    const updateVote2 = {$inc: {"picture.pic2.votes": 1}};
                    Post.update(condition, updateVote2, function (err, votex) {// increasing the Post Vote 2
                      if (err) throw err;
                      //votex={ok: 1,nModified :1, n=1}
                      if (votex.ok == 1 && votex.nModified == 1 && votex.n == 1) {
                        Post.findById(postId, function (err, post) {
                          const vote1 = post.picture.pic1.votes;
                          const vote2 = post.picture.pic2.votes;

                          for (let i = 0; i < post.reactions.length; i++) {//to change the like status
                            // in Post sub-document "reactions"
                            if (userId == post.reactions[i].voter) {
                              post.reactions[i].like1Status = "Like";
                              post.reactions[i].like2Status = "Unlike";

                              post.save(function (err) {
                                if (err) throw err;


                                console.log(votex.ok);

                                const like1 = "Like";
                                const like2 = "Unlike";
                                const clientData = {
                                  likeType: 2,
                                  vote1: vote1,
                                  vote2: vote2,
                                  like1: like1,
                                  like2: like2
                                }
                                res.json(clientData);
                                //res.json("good "+vote1);
                              });
                              return;
                            }
                          }
                        });
                      }

                    });
                  }
                });
              });
            }//end if (status==1)

          } else {//if user has never reacted, create new reaction and increase the post votes accordingly
            //link 1 becomes like and link 2 becomes unlike

            const reaction = new Reaction();
            reaction.post = postId;
            reaction.poster = posterId;
            reaction.voter = userId;
            reaction.vote_status = 2;

            reaction.save(function (err) {
              if (err) throw err;

              const condition = {_id: postId};
              const update = {$inc: {"picture.pic2.votes": 1}};
              Post.update(condition, update, function (err, votex) {//inreasing the Post Vote 2 by 1
                if (err) throw err;
                if (votex.ok == 1 && votex.nModified == 1 && votex.n == 1) {
                  Post.findById(postId, function (err, post) {
                    const vote1 = post.picture.pic1.votes;
                    const vote2 = post.picture.pic2.votes;

                    //update reactions or push new reaction dependng on previous reaction of the user
                    let found = 0; //indicates if this user reacted to the post before
                    let foundIndex = -1; //to grab the index should the user ever reacted
                    for (let i = 0; i < post.reactions.length; i++) {
                      if (userId == post.reactions[i].voter) {
                        found++;
                        foundIndex = i;
                        break;
                      }
                    }

                    if (found > 0 && foundIndex > -1) {
                      post.reactions[foundIndex].like1Status = "Like";
                      post.reactions[foundIndex].like2Status = "Unlike";
                    } else {
                      post.reactions.push({voter: userId, like1Status: "Like", like2Status: "Unlike"});
                    }

                    //save the status of like 1 and like 2
                    post.save(function (err) {
                      console.log(votex.ok);

                      const like1 = "Like";
                      const like2 = "Unlike";
                      const clientData = {
                        likeType: 2,
                        vote1: vote1,
                        vote2: vote2,
                        like1: like1,
                        like2: like2
                      }
                      res.json(clientData);
                      //res.json("good "+vote1);
                    });
                  });
                }
              });
            });
          }
        });
      }// end of else of if(likeType)
    }// end of if (poster,post,likeType)
  },
  userLogout: function (req, res) {
    req.session.destroy();
    req.logout();
    res.redirect("/");
  }
}
