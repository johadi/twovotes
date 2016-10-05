var mongoose=require("mongoose");
var Schema=mongoose.Schema;

var reactionSchema=new Schema({
    poster: {type : Schema.Types.ObjectId, ref: "User"},
    voter: {type : Schema.Types.ObjectId, ref: "User"},
    post: {type : Schema.Types.ObjectId, ref: "Post"},
    vote_status: Number,
    date: {type: Date,default :Date.now()}
});
module.exports=mongoose.model("Reaction",reactionSchema);