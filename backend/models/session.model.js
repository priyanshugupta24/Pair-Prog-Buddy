var mongoose = require('mongoose');

var codingEnvSchema = new mongoose.Schema({
    session_id : String,
    people_user_id : Array,
    room_logs : Array,
    no_of_joinees : Array,
});

const codingEnv =  mongoose.model("codingEnvSchema",codingEnvSchema);

module.exports = { codingEnv };