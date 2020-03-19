var mongoose = require('mongoose');
var StoreSchema = new mongoose.Schema({
    product: [{//this is the user that created the Store
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }],
    unit: Number,
},{
    timestamps: true//this will automatically add the createdAt and the updatedAt field for us
});

module.exports = mongoose.model('Store', StoreSchema);
