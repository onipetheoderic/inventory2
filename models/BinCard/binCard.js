var mongoose = require('mongoose');

var BinCardSchema = new mongoose.Schema({
    product: [{//this is the user that created the Subcategory
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    sv_number: Number,
    siv_number: Number,
    stock_balance: String,
    quantity: Number,
    requester: String,
    
},{
    timestamps: true//this will automatically add the createdAt and the updatedAt field for us
});


module.exports = mongoose.model('BinCard', BinCardSchema);