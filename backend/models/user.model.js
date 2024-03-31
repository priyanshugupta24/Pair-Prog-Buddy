var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    name : String,
    username : String,
    email : String,
    password : String,
    pfp : { 
        type:String, 
        default:"" 
    },
    // session : Boolean,
    // logs : String,
    links : {
        github: { 
            type:String, 
            default:"" 
        }, 
        linkedin: { 
            type:String, 
            default:"" 
        },
        twitter: { 
            type:String, 
            default:"" 
        },
        leetcode : { 
            type:String, 
            default:"" 
        },
        resume : {
            type : String,
            default : ""
        }
    },
    region : {
        country : { 
            type:String, 
            default:"America" 
        },
        state : { 
            type:String, 
            default:"New Mexico" 
        },
        city : { 
            type:String, 
            default:"Negra Arroyo Lane  , Albuquerque" 
        }
    },
    skills : {
        type : [String],
        default : []
    },
    stack  : {
        type : [String],
        default : []
    },
    timeToCode : {
        type : String,
        default : ""
    },
    accountPrivacy : {
        type : String,
        default : "private"
    },
    friends : {
        type : [String],
        default : []
    },
    followers : {
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