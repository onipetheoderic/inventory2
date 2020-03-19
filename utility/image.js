const path = require("path");

exports.imagePlacerAndNamer = (req, res, the_file)=>{
    let file_name = Date.now()+ the_file.name
    the_file.mv('Views/public/uploads/' + file_name, function(err) {
   });
    return file_name
}