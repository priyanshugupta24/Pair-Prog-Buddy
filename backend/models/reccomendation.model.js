var mongoose = require('mongoose');

var reccomendationSchema = new mongoose.Schema({
    regionBased : {
        lc : {
            type : [mongoose.Schema.Types.Mixed],
            default: []
        },
        dev : {
            type : [mongoose.Schema.Types.Mixed],
            default: []
        },
        both : {
            type : [mongoose.Schema.Types.Mixed],
            default : []
        }
    },
    skillBased : {
        lc : {
            type : [mongoose.Schema.Types.Mixed],
            default: []
        },
        dev : {
            type : [mongoose.Schema.Types.Mixed],
            default: []
        },
        both : {
            type : [mongoose.Schema.Types.Mixed],
            default : []
        }
    }
});

const reccomendation = mongoose.model("Reccomendation",reccomendationSchema);

module.exports = { reccomendation };