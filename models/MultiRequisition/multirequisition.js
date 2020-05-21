var mongoose = require('mongoose');
var MultiRequisitionSchema = new mongoose.Schema({
    requester: [{//this is the user that created the MultiRequisition
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comment_array:Array,//{comment_type, comment, product_name, product_id,fullname,department, position}
    requisitions: Array,//{rejected:Bool, product_id, store_id, qty, registrar_needed:Bool}
    requester_id: String,
    requester_department:[{//this is the user that created the MultiRequisition
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    }],
    requester_fullname:String,
    requester_position:String,
    srsiv_no: Number,
    bincard_id:String,
    store_1_verifier: String,
    store_2_verifier: String,
    registrar_verifier: String,
    admin_1_verifier: String,
    registrar_confirm_must: {type:Boolean, default:false},
    dept_director: String,
    store_1_verified: {type:Boolean, default:false},
    store_2_verified: {type:Boolean, default:false},
    registrar_verified: {type:Boolean, default:false},
    admin_1_verified: {type:Boolean, default:false},
    dept_director_verified: {type:Boolean, default:false},
},{
    timestamps: true//this will automatically add the createdAt and the updatedAt field for us
});

module.exports = mongoose.model('MultiRequisition', MultiRequisitionSchema);
