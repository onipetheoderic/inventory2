var mongoose = require('mongoose');
var ProductSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    company_name: String,
    ref_name: String,
    unit: Number,
    parent_id:{type:String, default:""},
    category: [{//this is the user that created the Product
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      }],
    sub_category: [{//this is the user that created the Product
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory'
      }],
    admin_verified: {type:Boolean, default:false},
    store_verified: {type:Boolean, default: false},
    audit_verified: {type:Boolean, default: false},
    user_verified: {type:Boolean, default:false},
    stored: {type:Boolean, default:false},
    code: String,
    user: [{//this is the user that created the Product
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
   
    	
},{
    timestamps: true//this will automatically add the createdAt and the updatedAt field for us
});

module.exports = mongoose.model('Product', ProductSchema);
