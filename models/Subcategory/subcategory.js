var mongoose = require('mongoose');
var SubcategorySchema = new mongoose.Schema({
    name: String,
    description: String,
    parent_id:String,
    user: [{//this is the user that created the Subcategory
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }]
   
    	
},{
    timestamps: true//this will automatically add the createdAt and the updatedAt field for us
});

module.exports = mongoose.model('Subcategory', SubcategorySchema);
