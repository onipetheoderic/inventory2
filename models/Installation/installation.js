var mongoose = require('mongoose');
var InstallationSchema = new mongoose.Schema({
    default_installation:{type:Boolean, default:false}
},{
    timestamps: true//this will automatically add the createdAt and the updatedAt field for us
});

module.exports = mongoose.model('Installation', InstallationSchema);
