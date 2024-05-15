var mongoose = require('mongoose');

var gcSchema = new mongoose.Schema({
    lastUpdated : {
        type:Number,
        default:1728021000000
    },
    users : {
        type:[String],
        default : []
    },
    hosts : {
        type:[String],
        default:[]
    },
    chatIcon : {
        type:String,
        default : ""
    },
    chatName : {
        type:String,
        default : ""
    },
    chatLogs :  {
        type : [mongoose.Schema.Types.Mixed],
        default: []
    }
});

const groupchat = mongoose.model("GroupChat",gcSchema);

module.exports = { groupchat };