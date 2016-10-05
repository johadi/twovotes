var mongoose=require("mongoose");
var Schema=mongoose.Schema;
var bcrypt=require("bcrypt-nodejs");
var crypto=require("crypto");

var userSchema=new Schema({
    username: {type: String,unique:true,lowercase:true,required: true},
    name: {
        fname: String,
        lname: String
    },
    password: {type: String,required: true},
    email:{type: String,unique:true,lowercase:true,required: true},
    sex: String,
    phone: {type:String,unique: true, required: true},
    reg_date : {type: Date,default: Date.now()}
});

userSchema.pre("save",function(next){
    var user=this;
    if(!user.isModified("password")) return next();//go to next operation if password is not given a value
    bcrypt.genSalt(10,function(err,salt){
        if(err) return next(err);
        bcrypt.hash(user.password,salt,null,function(err,hash){ //hash the password and return it as hash in the function parameter
            if(err) return next(err);
            user.password=hash; //assigning the hash value to password again which is now ready to be saved into the database
            next();
        });
    });
});

//comparing the password in the database and the one user types in
userSchema.methods.comparePassword=function(password){
    return bcrypt.compareSync(password,this.password);
}
module.exports=mongoose.model("User",userSchema);