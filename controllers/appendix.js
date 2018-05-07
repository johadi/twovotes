require('dotenv').load();
const User = require("../models/user");
const Post = require("../models/post");
const Count = require("../models/postCount");
const formidable = require('formidable');
const async = require("async");
const cloudinary = require('cloudinary');
const path = require('path');
const fs = require('fs');

// settings for cloudinary
cloudinary.config({
  cloud_name:  process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

module.exports = {
  validateUser: function (username, next) {
    User.findOne({username: username}, function (err, rs) {
      if (err) return next(err)
      if (!rs) return false;
      return true;
    });
  },
  savePostToDB: function (req, res, title, posterId, postId, pic1_path, pic2_path, url) {

    const post = new Post();
    post.title = title;
    post.poster = posterId;
    post.postId = postId;

    post.picture.pic1.location = pic1_path;
    post.picture.pic2.location = pic2_path;

    post.save(function (err) {
      if (err) throw err;
      Count.findOne({counter: "post"}, function (err, rs) {
        if (err) throw err;
        rs.count = rs.count + 1;//update database count
        rs.save(function (err) {
          if (err) throw err;
          //unset all sessions before redirect post
          req.session.path1 = null;
          req.session.path2 = null;
          req.session.ext1 = null;
          req.session.ext1 = null;
          req.session.postId = null;

          res.redirect(url);
        });
      });
    });
  },
  checkPost: function (postId, poster, cb) {
    Post.findOne({postId, poster}, function (err, rs) {
      if (err) throw err;
      if (!rs) return cb(false);
      cb(true);
    });
  },
  uploadPhoto: function (res, jimpp, oldPath, newPath, goto) {

    jimpp.read(oldPath, function (err, image) {
      if (err) throw err;
      image.resize(250, 250)
        .quality(100)
        .write(newPath);
      res.redirect(goto);

    });
  },
  uploadToCloudinary: function(req, res, pictureType) {
    const isPicture1 = pictureType === 'picture1';
    const oldPath = path.join(__dirname, '../uploads');
    const form = formidable.IncomingForm();
    form.uploadDir = oldPath;
    form.keepExtensions = true;
    form.parse(req, function(err, fields, files) {
      if (err) return res.status(500).json(err);

      // If no file provided
      if (!files[pictureType].name) {
        req.flash("message", "Upload valid picture");
        return fs.unlink(files[pictureType].path, function() {
          if (isPicture1) return res.redirect('/user/post');
          return res.redirect('/user/post-2');
        });
      }

      const ext = files[pictureType].name.split('.').pop();
      if (ext.toLowerCase() === 'jpg' || ext.toLowerCase() == 'jpeg' || ext.toLowerCase() == 'png') {
        // Upload to cloudinary
        const cloudFileName= fields.postId; //remember it has no file extension
        const cloudPath=`twovotes/uploads/${req.user.username}/${pictureType}/${cloudFileName}`;

        cloudinary.uploader.upload(files[pictureType].path,(result)=> {
            fs.unlink(files[pictureType].path,(err)=> {
              if(err) return res.status(500).json(err);

              if (isPicture1) {
                req.flash("success_msg", "First Picture uploaded successfully");
                req.session.postId = fields.postId;
                req.session.ext1 = ext.toLowerCase();
                req.session.path1=result.secure_url;
                if (req.session.path2) return res.redirect('/user/post-all');
                return res.redirect('/user/post-2');
              }

              req.flash("success_msg", "Second Picture uploaded successfully");
              req.session.ext2 = ext.toLowerCase();
              req.session.path2 = result.secure_url;

              return res.redirect('/user/post-all');
            });
          },
          {
            public_id: cloudPath,//images/files are saved according to this path
            width: 250,
            height: 250
          });
      } else {
        req.flash("message", ext + " file not allowed");
        fs.unlink(files[pictureType].path, function() {
          if(isPicture1) return res.redirect('/user/post');
          return res.redirect('/user/post-2');
        });
      }
    });
  },
  checkPostIdExist: function (postId, cb) {
    Post.findOne({postId: postId}, function (err, rs) {
      if (err) throw err;
      if (rs) return cb(true);
      cb(false);
    });
  },
  renamePictures: function (fs, oldPostId, newPostId, ext1, ext2, cb) {
    const patho1 = "resized_pictures/picture1/" + oldPostId + "." + ext1;
    const newPatho1 = "resized_pictures/picture1/" + newPostId + "." + ext2;

    const patho2 = "resized_pictures/picture2/" + oldPostId + "." + ext1;
    const newPatho2 = "resized_pictures/picture2/" + newPostId + "." + ext2;

    fs.rename(patho1, newPatho1, function (err) {
      if (err) throw err;
      fs.rename(patho2, newPatho2, function (err) {
        if (err) throw err;
        cb(newPostId);
      });
    });
  },
  getPostCount: function (cb) {
    Count.findOne({counter: "post"}, function (err, rs) {
      if (err) throw err;
      if (!rs) {
        const newCount = new Count();
        newCount.save();
        const count = newCount.count + 1;
        return cb(count);
      }
      const count = rs.count + 1;
      cb(count);
    });
  }

}
