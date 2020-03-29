var mongoose = require('mongoose');
var VerifierSchema = new mongoose.Schema({
    store_1_verifier: String,
    store_2_verifier: String,
    registrar_verifier: String,
    admin_1_verifier: String,
    store_1_verifier_email: String,
    store_2_verifier_email: String,
    registrar_verifier_email: String,
    admin_1_verifier_email: String,
    store_1_verifier_full_name: String,
    store_2_verifier_full_name: String,
    registrar_verifier_full_name: String,
    admin_1_verifier_full_name: String,
    auditor_id:String,
    	
},{
    timestamps: true//this will automatically add the createdAt and the updatedAt field for us
});

module.exports = mongoose.model('Verifier', VerifierSchema);