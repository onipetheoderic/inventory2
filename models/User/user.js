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
    staff_number: Number,
    director_assigned: {type:Boolean, default:false},
    user_detail:  [{//this is the user that created the Product
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }],
    department:  [{//this is the user that created the Product
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
      }],
    	
},{
    timestamps: true//this will automatically add the createdAt and the updatedAt field for us
});

module.exports = mongoose.model('User', UserSchema);