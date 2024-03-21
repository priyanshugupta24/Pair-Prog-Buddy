var mongoose = require('mongoose');

var codingEnvSchema = new mongoose.Schema({
    sessionId : String,
    participantsId : {
        type : [String],
        default : []
    },
    sessionLogs : {
        type : [String],
        default : []
    },
});

const codingEnv =  mongoose.model("codingEnvSchema",codingEnvSchema);

module.exports = { codingEnv };