var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    name : String,
    username : String,
    email : String,
    password : String,
    pfp : { 
        type:String, 
        default:"https://firebasestorage.googleapis.com/v0/b/pair-prog-buddy.appspot.com/o/PFP's%2FDefault%20PFP.jpg?alt=media&token=f344f23b-ee3e-4008-b22d-a1e27b27da8f" 
    },
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
            default:"India" 
        },
        state : { 
            type:String, 
            default:"Gujarat" 
        },
        city : { 
            type:String, 
            default:"Ahmedabad" 
        },
        iso2Country : {
            type : String,
            default : "IN"
        },
        iso2State : {
            type : String,
            default : "GJ"
        }
    },
    skills : {
        top3 : {
            type : [String],
            default : []
        },
        top3short : {
            type:[String],
            default : []
        },
        normal : {
            type : [String],
            default : []
        }
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
        type : [mongoose.Schema.Types.Mixed],
        default : []
    },
    waitList : {
        type : [String],
        default : []
    },
    sendTo : {
        type : [String],
        default : []
    },
    shortIntro : {
        type : String,
        default : ""
    },
    longIntro : {
        type : String,
        default : ""
    },
    subscription : {
        type : Boolean,
        default : false
    },
    prefer : {
        type : String,
        default : ""
    },
    friendScore : {
        type : [mongoose.Schema.Types.Mixed],
        default: []
    },
    gc : {
        type:[String],
        default : []
    }
});

const user = mongoose.model("User",userSchema);

module.exports = { user };