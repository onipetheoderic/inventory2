var mongoose = require('mongoose');
var ResourceSchema = new mongoose.Schema({
    resource_id: String,
    title: String,
   
},{
    timestamps: true//this will automatically add the createdAt and the updatedAt field for us
});

module.exports = mongoose.model('Resource', ResourceSchema);