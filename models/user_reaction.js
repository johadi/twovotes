const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const reactionSchema=new Schema({
    poster: {type : Schema.Types.ObjectId, ref: "User"},
    voter: {type : Schema.Types.ObjectId, ref: "User"},
    post: {type : Schema.Types.ObjectId, ref: "Post"},
    vote_status: Number,
    date: {type: Date,default :Date.now()}
});
module.exports=mongoose.model("Reaction",reactionSchema);
