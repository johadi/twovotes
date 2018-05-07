const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const postSchema = new Schema({
  title: String,
  postId: {type: Number},
  poster: {type: Schema.Types.ObjectId, ref: "User"},
  picture: {
    pic1: {
      votes: {type: Number, default: 0},
      location: String
    },
    pic2: {
      votes: {type: Number, default: 0},
      location: String
    }
  },
  reactions: [{
    voter: {type: Schema.Types.ObjectId, ref: "User"},
    like1Status: String,
    like2Status: String
  }],
  date: {type: Date, default: Date.now()}
});
module.exports = mongoose.model("Post", postSchema);
