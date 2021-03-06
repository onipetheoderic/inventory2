var mongoose = require('mongoose');
var CategorySchema = new mongoose.Schema({
    name: String,
    description: String,  
    ref_name: String,
    category_code: Number,
    user: [{//this is the user that created the Category
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
   
    	
},{
    timestamps: true//this will automatically add the createdAt and the updatedAt field for us
});

module.exports = mongoose.model('Category', CategorySchema);
