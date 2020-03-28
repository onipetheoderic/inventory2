var mongoose = require('mongoose');
var RequestSchema = new mongoose.Schema({
    dept_director: [{//this is the user that created the Request
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
    dept_director_verified: {type:Boolean, default:false},
    dept_unit: Number,
    registrar_confirm_must:{type:Boolean, default:false},
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
    unit: Number,//main unit
    adjusted_unit:Number,
  
    
    store_1_verifier: String,
    store_2_verifier: String,
    registrar_verifier: String,
    admin_1_verifier: String,

    store_1_verified: {type:Boolean, default:false},
    store_2_verified: {type:Boolean, default:false},
    registrar_verified: {type:Boolean, default:false},
    admin_1_verified: {type:Boolean, default:false},


    rejected: {type:Boolean, default:false}
},{
    timestamps: true//this will automatically add the createdAt and the updatedAt field for us
});

module.exports = mongoose.model('Request', RequestSchema);
