var Post=require("../models/post");
var User=require("../models/user");
var Count=require("../models/postCount");
var Reaction=require("../models/user_reaction");
var appendix=require("./appendix");
var async=require("async");
var fs=require("fs");

var multer=require("multer");//saves pictures
var jimp=require("jimp");//for resizing pictures

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,'./uploads/'+req.user.username+'/picture1');
    },
    filename: function (req, file, cb) {
        var ext=file.originalname.split(".").pop();
        cb(null, req.body.postId+"."+ext.toLowerCase());
    }
});
var storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,'./uploads/'+req.user.username+'/picture2');
    },
    filename: function (req, file, cb) {
        var ext=file.originalname.split(".").pop();
        cb(null, req.body.postId+"."+ext.toLowerCase());
    }
});

var storageImg = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null,'./uploads/'+req.user.username);
    },
    filename: function (req, file, cb) {
        var ext=file.originalname.split(".").pop();
        cb(null, req.user.username+"."+ext.toLowerCase());
    }
});
var upload=multer({storage: storage,
    fileFilter: function (req, file, cb) {
        var ext=file.originalname.split(".").pop();

        if (ext.toLowerCase() == 'jpg' || ext.toLowerCase() == 'jpeg' || ext.toLowerCase() == 'png') {
            req.flash("message","File uploaded successfully");
            req.session.postId=req.body.postId;
            req.session.ext1=ext.toLowerCase();
            req.session.path1="/"+req.user.username+"/picture1/"+req.body.postId+"."+ext.toLowerCase();
            console.log(file);
            return cb(null, true);
        }
        else{
            console.log(ext+" file not allowed");
            //req.fileValidationError="this file is not allowed";
            req.flash("message",ext+" file not allowed");
            return cb(null, false, new Error('I don\'t have a clue!'));
        }

    }

}).single("picture1");

var upload2=multer({storage: storage2,
    fileFilter: function (req, file, cb) {
        var ext=file.originalname.split(".").pop();

        if (ext.toLowerCase() == 'jpg' || ext.toLowerCase() == 'jpeg' || ext.toLowerCase() == 'png') {
            req.flash("message","File uploaded successfully");
            req.session.ext2=ext.toLowerCase();
            req.session.postId=req.body.postId;
            req.session.path2="/"+req.user.username+"/picture2/"+req.body.postId+"."+ext.toLowerCase();
            console.log(file);
            return cb(null, true);
        }
        else{
            console.log(ext+" file not allowed");
            //req.fileValidationError="this file is not allowed";
            req.flash("message",ext+" file not allowed");
            return cb(null, false, new Error('I don\'t have a clue!'));
        }

    }

}).single("picture2");
var uploadImg=multer({storage: storageImg,
    fileFilter: function (req, file, cb) {
        var ext=file.originalname.split(".").pop();

        if (ext.toLowerCase() == 'jpg' || ext.toLowerCase() == 'jpeg' || ext.toLowerCase() == 'png') {
            req.flash("error",1);
            //req.session.postId=req.body.postId;
            req.session.imgExt=ext.toLowerCase();
            //req.session.path1="/"+req.user.username+"/picture1/"+req.body.postId+"."+ext.toLowerCase();
            console.log(file);
            return cb(null, true);
        }
        else{
            console.log(ext+" file not allowed");
            //req.fileValidationError="this file is not allowed";
            req.flash("error",2);
            return cb(null, false, new Error('I don\'t have a clue!'));
        }

    }

}).single("photoimg");

module.exports={
    userPageGet: function(req,res){
        Post.find({})
            .populate("poster")
            .sort({date: -1})
            .exec(function(err,rs){
                if(err) throw err;
                res.render("user/home",{posts:rs});
            });
    },

    userPagePost: function(req,res){//shows all posts from which user can vote
        if(req.body.vote1){
            res.json("Am from Vote 1");
        }else if(req.body.vote2){
            res.json("Am from vote 2");
        }else{
            res.json("You have not voted");
        }
    },

    userPost1Get: function(req,res){
        async.waterfall([
            function(callback){
                appendix.getPostCount(function(count){//returns count and add 1 to it for use
                    callback(null,count);
                });
            },
            function(count){
                if(req.session && req.session.path1 && req.session.path2){
                    var path2=req.session.path2;
                    var path1=req.session.path1;
                    res.render("user/post_page",{msg:req.user.username,count:count,path1:path1,path2:path2,message: req.flash("message")});
                }else if(req.session && req.session.path1){
                    var path2="/uploads/default.jpg";
                    var path1=req.session.path1;
                    res.render("user/post_page",{msg:req.user.username,count:count,path1:path1,path2:path2,message: req.flash("message")});
                }
                else{
                    var path2="/uploads/default.jpg";
                    var path1="/uploads/default.jpg";
                    res.render("user/post_page",{msg:req.user.username,count:count,path1:path1,path2:path2,message: req.flash("message")});

                }

            }
        ]);
    },

    userPost1Post: function(req,res){ //handles first picture post
        upload(req,res,function(err) {
            if(err) throw err;
            if(!req.file) {

                req.flash("message","Choose valid image");
                return res.redirect("/user/post");
            }
            var ext=req.file.originalname.split(".").pop();
            var filename=req.body.postId+"."+ext.toLowerCase();

            var oldPath="uploads/"+req.user.username+"/picture1/"+filename;
            var newPath="resized_pictures/"+req.user.username+"/picture1/"+filename;
            appendix.uploadPhoto(res,jimp,oldPath,newPath,"/user/post-2"); //resize the picture,save it and redirect page to "post-2"

        });
    },

    userPost2Get: function(req,res){
         var count=req.session.postId;
         if(req.session && req.session.path1 && req.session.path2){
                    path1=req.session.path1;
                    path2=req.session.path2;
                    res.render("user/post_page2",{msg:req.user.username,path1:path1,path2:path2,postId:count,message: req.flash("message")});
         }else{
                    path1=req.session.path1;
                    path2="/uploads/default.jpg";
                    res.render("user/post_page2",{msg:req.user.username,path1:path1,path2:path2,postId:count,message: req.flash("message")});
         }

    },

    userPost2Post: function(req,res){ //handles second pic post
        upload2(req,res,function(err) {
            if(err) throw err;
            if(!req.file) {
                req.flash("message","Choose valid image");
                return res.redirect("/user/post-2");
            }
            var ext=req.file.originalname.split(".").pop();
            var filename=req.body.postId+"."+ext.toLowerCase();

            var oldPath="uploads/"+req.user.username+"/picture2/"+filename;
            var newPath="resized_pictures/"+req.user.username+"/picture2/"+filename;
            appendix.uploadPhoto(res,jimp,oldPath,newPath,"/user/post-all"); //resize the picture,save it and redirect page to "post-all"

        });
    },

    userPostAllGet: function(req,res){
        if(req.session && req.session.path1 && req.session.path2 && req.session.postId){

            res.render("user/post_page_all",{message:req.flash("message"),ext1:req.session.ext1,ext2:req.session.ext2,
                postId:req.session.postId,path1:req.session.path1,path2:req.session.path2});
        }
        else{
            res.json("something is wrong");
        }
    },
    userPostAllPost: function(req,res){ //handles all pic post
         //res.json({postId:req.body.postId,ext1:req.body.ext1,ext2:req.body.ext2,posterId:req.body.posterId,username:req.body.username});
        if(req.body.posterId && req.body.username && req.body.postId && req.body.ext1 && req.body.ext2 && req.body.title){

            async.waterfall([
                function(callback){
                    //check if user already posted with this post Id
                   appendix.checkPost(req.body.postId,req.body.posterId,function(status){
                       callback(null,status);
                   });
                },
                function(status){
                    //var parameters={postId:req.body.postId,ext1:req.body.ext1,ext2:req.body.ext2,posterId:req.body.posterId,username:req.body.username};
                    if(status) {//if user already posted,just redirect
                        //unset all sessions before redirect
                        req.session.path1=null;
                        req.session.path2=null;
                        req.session.ext1=null;
                        req.session.ext1=null;
                        req.session.postId=null;


                        res.redirect("/user/home");
                    }
                    else {//if user has not posted,create new post

                        var title=req.body.title;
                        var posterId=req.body.posterId;
                        var username=req.body.username;
                        var postId=req.body.postId;
                        var ext1=req.body.ext1;
                        var ext2=req.body.ext2;
                        //save post info to Db,update post count in PostCount and redirect
                        appendix.savePostToDB(req,res,title,posterId,username,postId,ext1,ext2,"/user/home");
                    }
                }
            ]);
        }else{
            req.flash("message","Something is wrong,Check Your Post title")
            res.redirect("/user/post-all");
        }

    },
    userProfile: function(req,res){
        if(req.user){
            res.render("user/profile");
        }else{
            res.json("error! page not found");
        }
    },
    userUpdate: function(req,res){
        if(req.user){
            res.render("user/update_profile",{message: req.flash("imgMsg")});
        }else{
            res.json("error! page not found");
        }
    },
    userUpload: function(req,res){
        uploadImg(req,res,function(err) {
            if(err) throw err;
            if(!req.file) {
                req.flash("success",0);
                return req.send("Choose valid image");
            }
            if(req.flash("error")==1){
                var ext=req.file.originalname.split(".").pop();
                var filename=req.user.username+"."+ext.toLowerCase();

                var oldPath="uploads/"+req.user.username+"/"+filename;
                var newPath="resized_pictures/"+req.user.username+"/"+filename;
                jimp.read(oldPath,function(err,image){
                    if(err) throw err;
                    image.resize(200,200)
                        .quality(100)
                        .write(newPath);
                    req.flash("success",1);
                    req.flash("ext",ext);
                    res.send("<img src='/"+req.user.username+"/"+req.user.username+"."+ext+"' />");

                });
                return;
            }
            req.flash("success",0);
            res.send("<p style='color:red'>Select Valid image</p> <img src='/pix.jpg'>");

        });
    },
    userUpload2: function(req,res){
            //res.redirect("/user/update-profile");
        res.json("hello");

    },
    processLike: function(req,res){
        //res.json(clientData);
        if(req.body.posterId && req.body.postId && req.body.likeType && req.body.userId){
            var posterId= req.body.posterId;
            var postId= req.body.postId;
            var userId= req.body.userId;

            //likeType==1 - person click the 1st like
            if(req.body.likeType==1){//check which type of like is Coming
                Reaction.findOne({post:postId,voter:userId,poster:posterId},function(err,rs){
                    if(err) throw err;
                    if(rs){
                        var status=rs.vote_status;
                        if(status==1){ //person wants to unlike the 1st post:the two links become like and remove this reaction from DB
                            //Also, decrease the vote of 1 in Post DB and return the new votes
                            Reaction.findOneAndRemove({_id: rs._id},function(err,remove){
                                if(err) throw err;
                               //Decrease Vote 1
                                    var condition={_id: postId};
                                    var update={$inc: {"picture.pic1.votes": -1}};
                                    Post.update(condition,update,function(err,votex){//decreasing the Post Vote 1
                                        if(err) throw err;
                                        //votex={ok: 1,nModified :1, n=1}
                                        if(votex.ok==1 && votex.nModified==1 && votex.n==1){
                                            Post.findById(postId,function(err,post){

                                                var vote1=post.picture.pic1.votes;
                                                var vote2=post.picture.pic2.votes;

                                                for(var i=0; i < post.reactions.length;i++){//to change the like status in Post sub-document "reactions"
                                                    if(userId==post.reactions[i].voter){
                                                        post.reactions[i].like1Status="Like";
                                                        post.reactions[i].like2Status="Like";

                                                        post.save(function(err){
                                                            if(err) throw err;

                                                            console.log(votex.ok);

                                                            var like1="Like";
                                                            var like2="Like";
                                                            var clientData={
                                                                likeType:1,
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


                        }else if(status==2){ //person wants to like the 1st post:1st post becomes unlike and 2nd post becomes like, update Reaction
                            // DB status to 1 . Also, increase the vote of 1 and decrease the vote of 2 in Post DB ,then return the two votes

                            rs.vote_status=1;
                            rs.save(function(err){
                                if(err) throw err;

                                //decrease the vote of 2 in post DB before increasing vote of 1
                                var condition={_id: postId};
                                var updateVote2={$inc: {"picture.pic2.votes": -1}}; //decrease condition of votes 2
                                Post.update(condition,updateVote2,function(err,votey){//decreasing the Post Vote 2
                                    if(err) throw err;
                                    if(votey.ok==1 && votey.nModified==1 && votey.n==1){
                                        //All is well, Increase Vote 1 now
                                        var updateVote1={$inc: {"picture.pic1.votes": 1}};//increase condition condition of vote 1
                                        Post.update(condition,updateVote1,function(err,votex){// increasing the Post Vote 1
                                            if(err) throw err;
                                            //votex={ok: 1,nModified :1, n=1}
                                            if(votex.ok==1 && votex.nModified==1 && votex.n==1){
                                                Post.findById(postId,function(err,post){
                                                    var vote1=post.picture.pic1.votes;
                                                    var vote2=post.picture.pic2.votes;

                                                    for(var i=0; i < post.reactions.length;i++) {//to change the like status in Post sub-document "reactions"
                                                        if (userId==post.reactions[i].voter) {
                                                            post.reactions[i].like1Status = "Unlike";
                                                            post.reactions[i].like2Status = "Like";

                                                            post.save(function(err){
                                                                if(err) throw err;


                                                                console.log(votex.ok);

                                                                var like1="Unlike";
                                                                var like2="Like";
                                                                var clientData={
                                                                    likeType:1,
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

                    }else{//if user has never reacted, create new reaction and increase the post votes accordingly
                          //the link1 becomes Unlike while link2 becomes like
                        var reaction=new Reaction();
                        reaction.post=postId;
                        reaction.poster=posterId;
                        reaction.voter=userId;
                        reaction.vote_status=1;

                        reaction.save(function(err){
                            if(err) throw err;

                                var condition={_id: postId};
                                var update={$inc: {"picture.pic1.votes": 1}}; //increase condition of votes 1
                                Post.update(condition,update,{new: true},function(err,votex){//inreasing the Post Vote 1
                                    if(err) throw err;
                                    //votex={ok: 1,nModified :1, n=1}
                                    if(votex.ok==1 && votex.nModified==1 && votex.n==1){
                                        Post.findById(postId,function(err,post){
                                            var vote1=post.picture.pic1.votes;
                                            var vote2=post.picture.pic2.votes;

                                            //update reactions or push new reaction dependng on previous reaction of the user
                                            var found =0; //indicates if this user reacted to the post before
                                            var foundIndex =-1; //to grab the index should the user ever reacted
                                            for(var i=0;i<post.reactions.length;i++){
                                                if (userId==post.reactions[i].voter) {
                                                    found++;
                                                    foundIndex=i;
                                                    break;
                                                }
                                            }

                                            if(found > 0 && foundIndex != -1){
                                                post.reactions[foundIndex].like1Status = "Unlike";
                                                post.reactions[foundIndex].like2Status = "Like";
                                            }else{
                                                post.reactions.push({voter: userId,like1Status: "Unlike",like2Status: "Like"});
                                            }
                                            //save the status of like 1 and like 2
                                            post.save(function(err){
                                                if(err) throw err;

                                                console.log(votex.ok);

                                                var like1="Unlike";
                                                var like2="Like";
                                                var clientData={
                                                    likeType:1,
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

            }else{//else of if likeType==1

                //likeType==2
                Reaction.findOne({post:postId,voter:userId,poster:posterId},function(err,rs){
                    if(err) throw err;
                    if(rs){
                        var status=rs.vote_status;
                        //Note: 1 is for 1st vote and 2 is 2nd vote in Post DB
                        if(status==2){ //person wants to unlike the 2nd post:the two links become like and remove this reaction from DB
                            //Also, decrease the vote of 2 in Post DB and return the new votes
                            Reaction.findOneAndRemove({_id: rs._id},function(err,remove){
                                if(err) throw err;

                                //decrease vote 2
                                var condition={_id: postId};

                                    var update={$inc: {"picture.pic2.votes": -1}};
                                    Post.update(condition,update,function(err,votey){//decreasing the Post Vote 2
                                        if(err) throw err;
                                        //votey={ok: 1,nModified :1, n=1}
                                        if(votey.ok==1 && votey.nModified==1 && votey.n==1){
                                            Post.findById(postId,function(err,post){
                                                var vote1=post.picture.pic1.votes;
                                                var vote2=post.picture.pic2.votes;

                                                for(var i=0; i < post.reactions.length;i++) {//to change the like status in Post sub-document "reactions"
                                                    if (userId==post.reactions[i].voter) {
                                                        post.reactions[i].like1Status = "Like";
                                                        post.reactions[i].like2Status = "Like";

                                                        post.save(function(err){
                                                            if(err) throw err;

                                                            console.log(votey.ok);

                                                            var like1="Like";
                                                            var like2="Like";
                                                            var clientData={
                                                                likeType:2,
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

                        }else if(status==1){ //person wants to like the 2nd post:2nd post becomes unlike and 1st post becomes like, update DB
                                             //status to 2. Also, increase the vote of 2 and decrease the vote of 1 in Post DB ,then return the two votes
                            rs.vote_status=2;
                            rs.save(function(err){
                                if(err) throw err;

                                //decrease the vote of 1 in post DB before increasing vote of 2
                                var condition={_id: postId};
                                var updateVote1={$inc: {"picture.pic1.votes": -1}};
                                Post.update(condition,updateVote1,function(err,votey){//decreasing the Post Vote 1
                                    if(err) throw err;
                                    if(votey.ok==1 && votey.nModified==1 && votey.n==1){
                                        //All is well, Increase Vote 2 now
                                        var updateVote2={$inc: {"picture.pic2.votes": 1}};
                                        Post.update(condition,updateVote2,function(err,votex){// increasing the Post Vote 2
                                            if(err) throw err;
                                            //votex={ok: 1,nModified :1, n=1}
                                            if(votex.ok==1 && votex.nModified==1 && votex.n==1){
                                                Post.findById(postId,function(err,post){
                                                    var vote1=post.picture.pic1.votes;
                                                    var vote2=post.picture.pic2.votes;

                                                    for(var i=0; i < post.reactions.length;i++) {//to change the like status
                                                                                                  // in Post sub-document "reactions"
                                                        if (userId==post.reactions[i].voter) {
                                                            post.reactions[i].like1Status = "Like";
                                                            post.reactions[i].like2Status = "Unlike";

                                                            post.save(function(err){
                                                                if(err) throw err;


                                                                console.log(votex.ok);

                                                                var like1="Like";
                                                                var like2="Unlike";
                                                                var clientData={
                                                                    likeType:2,
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

                    }else{//if user has never reacted, create new reaction and increase the post votes accordingly
                          //link 1 becomes like and link 2 becomes unlike

                        var reaction=new Reaction();
                        reaction.post=postId;
                        reaction.poster=posterId;
                        reaction.voter=userId;
                        reaction.vote_status=2;

                        reaction.save(function(err){
                            if(err) throw err;

                                var condition={_id: postId};
                                var update={$inc: {"picture.pic2.votes": 1}};
                                Post.update(condition,update,function(err,votex){//inreasing the Post Vote 2 by 1
                                    if(err) throw err;
                                    if(votex.ok==1 && votex.nModified==1 && votex.n==1){
                                        Post.findById(postId,function(err,post){
                                            var vote1=post.picture.pic1.votes;
                                            var vote2=post.picture.pic2.votes;

                                            //update reactions or push new reaction dependng on previous reaction of the user
                                            var found =0; //indicates if this user reacted to the post before
                                            var foundIndex =-1; //to grab the index should the user ever reacted
                                            for(var i=0;i<post.reactions.length;i++){
                                                if (userId==post.reactions[i].voter) {
                                                    found++;
                                                    foundIndex=i;
                                                    break;
                                                }
                                            }

                                            if(found > 0 && foundIndex > -1){
                                                post.reactions[foundIndex].like1Status = "Like";
                                                post.reactions[foundIndex].like2Status = "Unlike";
                                            }else{
                                                post.reactions.push({voter: userId,like1Status: "Like",like2Status: "Unlike"});
                                            }

                                            //save the status of like 1 and like 2
                                            post.save(function(err){
                                                console.log(votex.ok);

                                                var like1="Like";
                                                var like2="Unlike";
                                                var clientData={
                                                    likeType:2,
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
            }//end of else of if(likeType)
        }//end of if (poster,post,likeType)

        //res.json();
        //res.json(clientData);
    },
    userLogout:function(req,res){
        req.session.destroy();
        req.logout();
        res.redirect("/");
    }
}