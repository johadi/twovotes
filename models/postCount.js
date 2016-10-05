var mongoose=require("mongoose");
var Schema=mongoose.Schema;

var postCountSchema=new Schema({
    counter: {type: String,default: "post"},
    count: {type: Number, default: 1000}
});
module.exports=mongoose.model("PostCount",postCountSchema);
