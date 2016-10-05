var User=require("../models/user");
var Post=require("../models/post");
var Count=require("../models/postCount");
var async=require("async");


module.exports={
    validateUser: function(username,next){
        User.findOne({username: username}, function(err,rs){
            if(err) return next(err)
            if(!rs) return false;
            return true;
        });
    },
    savePostToDB: function(req,res,title,posterId,username,postId,ext1,ext2,url){

        pic1_path=postId+"."+ext1;
        pic2_path=postId+"."+ext2;

        var post=new Post();
        post.title=title;
        post.poster=posterId;
        post.postId=postId;

        post.picture.pic1.location=pic1_path;
        post.picture.pic2.location=pic2_path;

        post.save(function(err){
            if(err) throw err;
            Count.findOne({counter: "post"},function(err,rs){
                if(err) throw err;
                rs.count=rs.count+1;//update database count
                rs.save(function(err){
                    if(err) throw err;
                    //unset all sessions before redirect post
                    req.session.path1=null;
                    req.session.path2=null;
                    req.session.ext1=null;
                    req.session.ext1=null;
                    req.session.postId=null;

                    res.redirect(url);
                });
            });
        });
    },
    checkPost: function(postId,poster,cb){
        Post.findOne({postId:postId,poster:poster},function(err,rs){
            if(err) throw err;
            if(!rs) return cb(false);
            cb(true);
        });
    },
    uploadPhoto: function(res,jimpp,oldPath,newPath,goto){

        jimpp.read(oldPath,function(err,image){
            if(err) throw err;
            image.resize(250,250)
                .quality(100)
                .write(newPath);
            res.redirect(goto);

        });
    },
    checkPostIdExist: function(postId,cb){
        Post.findOne({postId:postId},function(err,rs){
            if(err) throw err;
            if(rs) return cb(true);
            cb(false);
        });
    },
    renamePictures: function(fs,oldPostId,newPostId,ext1,ext2,cb){
        var patho1="resized_pictures/picture1/"+oldPostId+"."+ext1;
        var newPatho1="resized_pictures/picture1/"+newPostId+"."+ext2;

        var patho2="resized_pictures/picture2/"+oldPostId+"."+ext1;
        var newPatho2="resized_pictures/picture2/"+newPostId+"."+ext2;

        fs.rename(patho1, newPatho1, function(err) {
            if ( err ) throw err;
            fs.rename(patho2,newPatho2,function(err){
                if(err) throw err;
                cb(newPostId);
            });
        });
    },
    getPostCount: function(cb){
        Count.findOne({counter: "post"},function(err,rs){
            if(err) throw err;
            count = rs.count+1;
            cb(count);
        });
    }

}
