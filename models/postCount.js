const mongoose=require("mongoose");
const Schema=mongoose.Schema;

const postCountSchema=new Schema({
    counter: {type: String,default: "post"},
    count: {type: Number, default: 1000}
});
module.exports=mongoose.model("PostCount",postCountSchema);
