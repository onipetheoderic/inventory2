var mongoose = require('mongoose');
var UserSchema = new mongoose.Schema({
    email: {type:String, required: true},
    lastName: String,
    firstName: String,
    gender: String,
   	phoneNumber: String,	
   	passcode: String,
    userType: String,
    position: String,

    department:  [{//this is the user that created the Product
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
      }],
    	
},{
    timestamps: true//this will automatically add the createdAt and the updatedAt field for us
});

module.exports = mongoose.model('User', UserSchema);