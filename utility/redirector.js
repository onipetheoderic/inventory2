// import User from '../models/user';
import {encrypt, decrypt} from './encryptor'


// exports.redirector = (req, res) =>{
// 	if(!req.session.user_id){
// 	    res.redirect('/login');
// 	}   
// }
// // to be used after the redirector module
// exports.admin_checker_redirector = (req, res) => {
// 	let decrypted_user_id = decrypt(req.session.user_id)
// 	console.log("this is the decrypted user id: ",decrypted_user_id)
// 	 User.findOne({_id: decrypted_user_id}, function(err, user) {
// 	 	if(user.isAdmin==false){
// 	 		res.redirect('/login')
// 	 	}
// 	 })
// }