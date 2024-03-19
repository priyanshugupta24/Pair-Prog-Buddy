var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    // firstName : String,
    // lastName : String,
    // profileId : String,
    email : String,
    password : String,
    // session : Boolean,
    // logs : String,
    // region:String,
    // skills : String,
    // exp : String,
    // stack  : String,
    // timeToCode : String,
    accountPrivacy : {
        type : String,
        default : "Private"
    },
    friends : {
        type : [String],
        default : []
    },
    waitList : {
        type : [String],
        default : []
    },
    // chatLogs : String,
    // useCase : String,
});

const user = mongoose.model("User",userSchema);

module.exports = { user };