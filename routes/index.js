//files where main routers are defined
const express=require("express");
const router=express.Router();
const passport=require("passport");
const configPassport=require("../configuration/passport");

const mainCtrl=require("../controllers/main");
const userCtrl=require("../controllers/user");

//main routes
router.get("/",mainCtrl.indexPage);

router.get("/signup",mainCtrl.signupPage);
router.post("/signup",mainCtrl.singupPost);

router.get("/login",mainCtrl.loginPage);
router.post("/login",
    passport.authenticate('local-login', {
        successRedirect: '/user/home',
        failureRedirect: '/login',
        failureFlash: true })
);
router.get("/check",mainCtrl.checkingGet);
router.post("/check",mainCtrl.checkingPost);

//user routes
router.get("/user/home",userCtrl.userPageGet);
router.post("/user/home",userCtrl.userPagePost);

router.get("/user/post",userCtrl.userPost1Get);
router.post("/user/post",userCtrl.userPost1Post);

router.get("/user/post-2",userCtrl.userPost2Get);
router.post("/user/post-2",userCtrl.userPost2Post);

router.get("/user/post-all",userCtrl.userPostAllGet);
router.post("/user/post-all",userCtrl.userPostAllPost);

router.get("/user/profile",userCtrl.userProfile);
router.get("/user/update-profile",userCtrl.userUpdate);
router.post("/user/upload",userCtrl.userUpload);
router.post("/user/upload-2",userCtrl.userUpload2);

//from jquery ajax to process Like
router.post("/user/like",userCtrl.processLike);

router.get("/logout",userCtrl.userLogout);




module.exports=router;
