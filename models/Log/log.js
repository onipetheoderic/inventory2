var mongoose = require('mongoose');
var LogSchema = new mongoose.Schema({
    event: {type:String, required: true},
    
},{
    timestamps: true//this will automatically add the createdAt and the updatedAt field for us
});

module.exports = mongoose.model('Log', LogSchema);