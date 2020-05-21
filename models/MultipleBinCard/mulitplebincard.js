var mongoose = require('mongoose');

var MultipleBinCardSchema = new mongoose.Schema({
    sv_number: Number,
    siv_number: Number,
    items:Array,
    stock_balance: String,
    quantity: Number,
    requester_name: String,
    requester_department:String,
    requester: [{//this is the user that created the MultiRequisition
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
},{
    timestamps: true//this will automatically add the createdAt and the updatedAt field for us
});


module.exports = mongoose.model('MultipleBinCard', MultipleBinCardSchema);