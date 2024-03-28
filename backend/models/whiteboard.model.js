var mongoose = require('mongoose');

var whiteBoardSchema = new mongoose.Schema({
    unique_id : String,
    elements : {
        type:[mongoose.Schema.Types.Mixed],
        default : []
    },
});

const whiteBoard =  mongoose.model("whiteBoardSchema",whiteBoardSchema);

module.exports = { whiteBoard };