var mongoose = require('mongoose');

var sessionEnvSchema = new mongoose.Schema({
    sessionId : Number,
    participantsId : {
        type : [String],
        default : []
    },
    sessionLogs : {
        type : [String],
        default : []
    },
    sessionElements : {
        type : [{object:String,unique_id:String}],
        default : []
    }
});

const sessionEnv =  mongoose.model("sessionEnvSchema",sessionEnvSchema);

module.exports = { sessionEnv };