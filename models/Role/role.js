var mongoose = require('mongoose');
var RoleSchema = new mongoose.Schema({
    role_id: String,
    title: String,
   
},{
    timestamps: true//this will automatically add the createdAt and the updatedAt field for us
});

module.exports = mongoose.model('Role', RoleSchema);