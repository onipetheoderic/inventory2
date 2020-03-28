var mongoose = require('mongoose');
var AuditorLogSchema = new mongoose.Schema({
    product: [{//this is the user that created the AuditorLog
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }],
    unit: Number,
},{
    timestamps: true//this will automatically add the createdAt and the updatedAt field for us
});

module.exports = mongoose.model('AuditorLog', AuditorLogSchema);
