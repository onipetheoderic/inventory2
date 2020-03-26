var mongoose = require('mongoose');
var RequestSchema = new mongoose.Schema({
    dept_director: [{//this is the user that created the Request
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
    dept_director_verified: {type:Boolean, default:false},
    dept_unit: Number,
    
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
    admin_director_verified:{type:Boolean, default:false},
    store_director_verified: {type:Boolean, default:false},
    store_unit: Number,
    store_director: [{//this is the user that created the Request
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    audit_director_verified: {type:Boolean, default:false},
    audit_unit: Number,
    audit_director: [{//this is the user that created the Request
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    admin_unit: Number,
    store_registrar_verified: {type:Boolean, default:false},
    admin_director:[{//this is the user that created the Request
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    store_registrar: [{//this is the user that created the Request
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    rejected: {type:Boolean, default:false}
},{
    timestamps: true//this will automatically add the createdAt and the updatedAt field for us
});

module.exports = mongoose.model('Request', RequestSchema);
