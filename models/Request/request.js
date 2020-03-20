var mongoose = require('mongoose');
var RequestSchema = new mongoose.Schema({
    director: [{//this is the user that created the Request
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
    requester: [{//this is the user that created the Request
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
    signed: {type:Boolean, default:false},
    admin_signed: {type:Boolean, default:false},
    product: [{//this is the user that created the Request
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
      }],
    srsiv_no: Number,
    unit: Number,
    admin_director_verified:{type:Boolean, default:false},
    admin_registrar_verified: {type:Boolean, default:false},
    admin_director:[{//this is the user that created the Request
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    admin_registrar: [{//this is the user that created the Request
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
},{
    timestamps: true//this will automatically add the createdAt and the updatedAt field for us
});

module.exports = mongoose.model('Request', RequestSchema);
