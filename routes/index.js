//files where main routers are defined
const express=require("express");
const router=express.Router();
const passport=require("passport");
require("../configuration/passport");

const mainCtrl=require("../controllers/main");
const userCtrl=require("../controllers/user");

//main routes
router.get("/",mainCtrl.indexPage);
router.post("/", mainCtrl.loginPost,
  passport.authenticate('local-login', {
    successRedirect: '/user/home',
    failureRedirect: '/',
    failureFlash: true })
);

router.get("/signup",mainCtrl.signupPage);
router.post("/signup",mainCtrl.singupPost);

router.get("/check",mainCtrl.checkingGet);
router.post("/check",mainCtrl.checkingPost);

//user routes
router.get("/user/home",userCtrl.userHomePage);
router.get("/user/posts",userCtrl.userPostsPage);

router.get("/user/post",userCtrl.userPost1Get);
router.post("/user/post",userCtrl.userPost1Post);

router.get("/user/post-2",userCtrl.userPost2Get);
router.post("/user/post-2",userCtrl.userPost2Post);

router.get("/user/post-all",userCtrl.userPostAllGet);
router.post("/user/post-all",userCtrl.userPostAllPost);

// user profile
router.get("/user/profile",userCtrl.userProfile);
router.get("/user/update-profile",userCtrl.updateUserGet);
router.post("/user/update-profile",userCtrl.updateUserPost);
router.post("/user/upload",userCtrl.userUpload);
router.post("/user/upload-2",userCtrl.userUpload2);

//from jquery ajax to process Like
router.post("/user/like",userCtrl.processLike);

// user profile
router.get("/logout",userCtrl.userLogout);




module.exports=router;
