var mongoose = require('mongoose');
var RoleToResourceSchema = new mongoose.Schema({
    role_id: String,
    resource_id: String,
    parent_id: String,
    role_name: String,
    resource_name:String,
    status: {type:Boolean, default:true}
   
},{
    timestamps: true//this will automatically add the createdAt and the updatedAt field for us
});

module.exports = mongoose.model('RoleToResource', RoleToResourceSchema);

//datasheet_id: [{ type: Schema.Types.ObjectId, ref: 'CompletedDatasheet' }],