import Department from '../../models/Department/department';
import User from '../../models/User/user';
import Category from '../../models/Category/category';
import {encrypt, decrypt, BASEURL} from '../../utility/encryptor'
import Product from '../../models/Product/product';
import AuditorLog from '../../models/AuditorLog/auditorLog';
import Subcategory from '../../models/Subcategory/subcategory';
import Store from '../../models/Store/store';
import Request from '../../models/Request/request';
import Installation from '../../models/Installation/installation';
import BinCard from '../../models/BinCard/binCard';
import Verifier from '../../models/Verifier/verifier';
import MultipleBinCard from '../../models/MultipleBinCard/mulitplebincard';
import MultiRequisition from '../../models/MultiRequisition/multirequisition';
import overall_config from '../../config/overall_config.json'
var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var transporter = nodemailer.createTransport(smtpTransport({
  service: 'gmail',
  host: 'smtp.gmail.com',
  auth: {
    user: 'onipetheoderic@gmail.com',
    pass: 't1t2t3t4'
  }
}));



var rn = require('random-number');
var options = {
  min:  1000
, integer: true
}

//sub_category

const filePlacerAndNamer = (req, res, the_file) => {
    // let file_name = the_file.name
    let file_name = Date.now()+ the_file.name;
    
    the_file.mv('views/public/uploads/' + file_name, function(err) {
   });
    return file_name
}

function collectionInherit(){
    var categories = []
    var departments = []    
    Department.find({}, function(err, department){
        Category.find({}, function(err, category){                
            Subcategory.find({}, function(err, sub_category){ 
                console.log(sub_category)
                              
                for(var i in category){
                    let sub_categories = [];
                    for(var k in sub_category){                               
                        if(category[i]._id == sub_category[k].parent_id){
                            console.log("true")                                    
                            sub_categories.push({
                                name:sub_category[k].name
                            })
                        }
                        
                    }
                    categories.push({name:category[i].name, ref_name:category[i].ref_name,  _id:category[i]._id, sub_category:sub_categories})
                    
                }
                for(var i in department){
                    departments.push(department[i])
                }
               
            });
        
        })
    })
    return {category:categories, department:departments}
}

exports.verifiers = function(req, res){
    
    Verifier.findOne({}).exec(function(err, verifier){
        console.log("this is the verifier", verifier)
        if(verifier==null){
            User.find({}).populate("department").exec(function(err, users){      
                res.render('inventory/verifiers', {layout: "layout/inventory", verifier:verifier, users:users})
            })
        }
        else if(verifier!=null){
            User.find({}).populate("department").exec(function(err, users){      
                res.render('inventory/edit_verifier', {layout: "layout/inventory", verifier:verifier, users:users})
            })
        }        
    })
}

exports.verifier_post = function(req, res){
    Verifier.find({}).exec(function(err, verifier){
        const store_1_verifier = req.body.store_1_verifier.split("|")
        const store_2_verifier = req.body.store_2_verifier.split("|") 
        const registrar_verifier = req.body.registrar_verifier.split("|") 
        const admin_1_verifier = req.body.admin_1_verifier.split("|")
        if(verifier.length<1){             
            let verifier = new Verifier();
            verifier.store_1_verifier = store_1_verifier[0]
            verifier.store_2_verifier = store_2_verifier[0];
            verifier.registrar_verifier = registrar_verifier[0];
            verifier.admin_1_verifier = admin_1_verifier[0];
            verifier.store_1_verifier_email = store_1_verifier[1]
            verifier.store_2_verifier_email = store_2_verifier[1];
            verifier.registrar_verifier_email = registrar_verifier[1];
            verifier.admin_1_verifier_email = admin_1_verifier[1];
            verifier.store_1_verifier_full_name = store_1_verifier[2];
            verifier.store_2_verifier_full_name = store_2_verifier[2];
            verifier.registrar_verifier_full_name  = registrar_verifier[2];
            verifier.admin_1_verifier_full_name = admin_1_verifier[2];
            verifier.auditor_id = req.body.auditor_id;
            verifier.save(function(err,saved_verifier){
                if(err){
                    console.log(err)
                }
                else {
                    res.redirect('/')
                }
            })
        }
        
        else if(verifier.length>=1) {
            Verifier.findOne({}, function(err, verifier){
                Verifier.findByIdAndUpdate(verifier.id, {
                    store_1_verifier:store_1_verifier[0],
                    store_2_verifier:store_2_verifier[0],
                    registrar_verifier:registrar_verifier[0],
                    admin_1_verifier: admin_1_verifier[0],
                    store_1_verifier_email:store_1_verifier[1],
                    store_2_verifier_email:store_2_verifier[1],
                    registrar_verifier_email: registrar_verifier[1],
                    admin_1_verifier_email: admin_1_verifier[1],
                    store_1_verifier_full_name: store_1_verifier[2],
                    store_2_verifier_full_name: store_2_verifier[2],
                    registrar_verifier_full_name: registrar_verifier[2],
                    admin_1_verifier_full_name:admin_1_verifier[2],
                    auditor_id:req.body.auditor_id
                   
                })
                .exec(function(err, updated_store){
                    if(err){
                        console.log(err)
                    }else {
                        res.redirect(`/`)
                    }
                })
            })
        }
    })
}


exports.home = function(req, res){
    if(!req.session.hasOwnProperty("user_id")){
       
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
        console.log("its working", req.session.user_id)
    let decrypted_user_id = decrypt(req.session.user_id, req, res)
    let decrypted_user_role = decrypt(req.session.role, req, res)
    const isDirector = decrypted_user_role =="director"?true:false;

    Verifier.findOne({}, function(err, verifier){
        if(verifier!=null){
            const store_1_verifier = verifier.store_1_verifier;
            const store_2_verifier = verifier.store_2_verifier;
            const registrar_verifier = verifier.registrar_verifier;
            const admin_1_verifier = verifier.admin_1_verifier;
            const auditor_id = verifier.auditor_id;
    
            User.findOne({_id:store_1_verifier}, function(err, store_1_guy){
                const store_1_verifier_assigned_user = store_1_guy.user_detail;
            User.findOne({_id:store_2_verifier}, function(err, store_2_guy){
                const store_2_verifier_assigned_user = store_2_guy.user_detail;
            User.findOne({_id:registrar_verifier}, function(err, registrar_guy){
                const registrar_verifier_assigned_user = registrar_guy.user_detail;
            User.findOne({_id:admin_1_verifier}, function(err, admin_1_guy){
                const admin_assigned_user = admin_1_guy.user_detail;
            
            User.findOne({_id:decrypted_user_id}, function(err, user){
                let assigned_user = user.user_detail[0] == undefined ? null: user.user_detail[0].toString();
           
            MultiRequisition.findOne({$or:[{dept_director:decrypted_user_id, 
                dept_director_verified:false}, 
                {dept_director:assigned_user, dept_director_verified:false}]})
                .exec(function(err, reqs){
                    console.log("E dey work", reqs)              
                    const isReq = reqs==null?false:true;
    
    
                
                if(isReq){
                    MultiRequisition.find({dept_director_verified:false})
                    .populate("director")
                    .populate("requester")
                    .populate("product")
                    .exec(function(err, requests){
                        console.log("FFFFFFRRRROOM dept_director",requests)                                    
                        Department.find({}, function(err, department){
                            Category.find({}, function(err, category){                
                                Subcategory.find({}, function(err, sub_category){ 
                                   
                                    let categories = []                   
                                    for(var i in category){
                                        let sub_categories = [];
                                        for(var k in sub_category){                               
                                            if(category[i]._id == sub_category[k].parent_id){
                                                                                    
                                                sub_categories.push({
                                                    name:sub_category[k].name
                                                })
                                            }
                                            
                                        }
                                        categories.push({name:category[i].name, ref_name:category[i].ref_name,  _id:category[i]._id, sub_category:sub_categories})
                                        
                                    }
                                    User.find({}, function(err, users){
                                        User.findOne({_id:decrypted_user_id}, function(err, user){   
                                            let superAdmin = user.userType=="superAdmin"?true:false;  
                                            Product.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(function(err, product) { 
                                                res.render('inventory/home', {layout: "layout/inventory", isDirector:isDirector, superAdmin:superAdmin, requests:requests, product:product, users:users, category:categories, department:department, data:{category:category, department:department}})
                                            })
                                        })
                                    });
                                });
                            
                            })
                        })
                    })
                }
                else if(store_1_verifier==decrypted_user_id || store_1_verifier_assigned_user==decrypted_user_id){
                    console.log("XXXXXXXXXXXXX")
                    MultiRequisition.find({dept_director_verified:true, store_1_verified:false})
                                .populate("director")
                                .populate("requester")
                                .populate("product")
                                .exec(function(err, requests){
                                    console.log("from adm dept",requests)                                    
                                    Department.find({}, function(err, department){
                                        Category.find({}, function(err, category){                
                                            Subcategory.find({}, function(err, sub_category){ 
                                                console.log(sub_category)
                                                let categories = []                   
                                                for(var i in category){
                                                    let sub_categories = [];
                                                    for(var k in sub_category){                               
                                                        if(category[i]._id == sub_category[k].parent_id){
                                                            console.log("true")                                    
                                                            sub_categories.push({
                                                                name:sub_category[k].name
                                                            })
                                                        }
                                                        
                                                    }
                                                    categories.push({name:category[i].name, ref_name:category[i].ref_name,  _id:category[i]._id, sub_category:sub_categories})
                                                    
                                                }
                                                User.find({}, function(err, users){
                                                    User.findOne({_id:decrypted_user_id}, function(err, user){   
                                                        let superAdmin = user.userType=="superAdmin"?true:false;  
                                                        Product.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(function(err, product) { 
                                                            res.render('inventory/home', {layout: "layout/inventory", isDirector:isDirector, superAdmin:superAdmin, requests:requests, product:product, users:users, category:categories, department:department, data:{category:category, department:department}})
                                                        })
                                                    })
                                                });
                                            });
                                        
                                        })
                                    })
                                })
                }
                else if(store_2_verifier==decrypted_user_id || store_2_verifier_assigned_user==decrypted_user_id){
                    MultiRequisition.find({dept_director_verified:true, store_2_verified:false})
                                .populate("director")
                                .populate("requester")
                                .populate("product")
                                .exec(function(err, requests){
                                    console.log("from store2 guy",requests)                                    
                                    Department.find({}, function(err, department){
                                        Category.find({}, function(err, category){                
                                            Subcategory.find({}, function(err, sub_category){ 
                                               
                                                let categories = []                   
                                                for(var i in category){
                                                    let sub_categories = [];
                                                    for(var k in sub_category){                               
                                                        if(category[i]._id == sub_category[k].parent_id){
                                                                                                
                                                            sub_categories.push({
                                                                name:sub_category[k].name
                                                            })
                                                        }
                                                        
                                                    }
                                                    categories.push({name:category[i].name, ref_name:category[i].ref_name,  _id:category[i]._id, sub_category:sub_categories})
                                                    
                                                }
                                                User.find({}, function(err, users){
                                                    User.findOne({_id:decrypted_user_id}, function(err, user){   
                                                        let superAdmin = user.userType=="superAdmin"?true:false;  
                                                        Product.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(function(err, product) { 
                                                            res.render('inventory/home', {layout: "layout/inventory", isDirector:isDirector, superAdmin:superAdmin, requests:requests, product:product, users:users, category:categories, department:department, data:{category:category, department:department}})
                                                        })
                                                    })
                                                });
                                            });
                                        
                                        })
                                    })
                                })
                }
                else if(registrar_verifier==decrypted_user_id || 
                    registrar_verifier_assigned_user==decrypted_user_id){
                    console.log("TTTTTTTTTT Registrar")
                    MultiRequisition.find({dept_director_verified:true, 
                        admin_1_verified:true, registrar_verified:false, 
                        registrar_confirm_must:true})
                                .populate("director")
                                .populate("requester")
                                .populate("product")
                                .exec(function(err, requests){
                                    console.log("Registrar",requests)                                    
                                    Department.find({}, function(err, department){
                                        Category.find({}, function(err, category){                
                                            Subcategory.find({}, function(err, sub_category){ 
                                                console.log(sub_category)
                                                let categories = []                   
                                                for(var i in category){
                                                    let sub_categories = [];
                                                    for(var k in sub_category){                               
                                                        if(category[i]._id == sub_category[k].parent_id){
                                                                                             
                                                            sub_categories.push({
                                                                name:sub_category[k].name
                                                            })
                                                        }
                                                        
                                                    }
                                                    categories.push({name:category[i].name, ref_name:category[i].ref_name,  _id:category[i]._id, sub_category:sub_categories})
                                                    
                                                }
                                                User.find({}, function(err, users){
                                                    User.findOne({_id:decrypted_user_id}, function(err, user){   
                                                        let superAdmin = user.userType=="superAdmin"?true:false;  
                                                        Product.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(function(err, product) { 
                                                            res.render('inventory/home', {layout: "layout/inventory", isDirector:isDirector, superAdmin:superAdmin, requests:requests, product:product, users:users, category:categories, department:department, data:{category:category, department:department}})
                                                        })
                                                    })
                                                });
                                            });
                                        
                                        })
                                    })
                                })
                }
                else if(admin_1_verifier==decrypted_user_id || admin_assigned_user==decrypted_user_id){
                    console.log("TTTTTTTTTT Admin User")
                    MultiRequisition.find({dept_director_verified:true, store_1_verified:true, store_2_verified:true, registrar_verified:false, admin_1_verified:false})
                                .populate("director")
                                .populate("requester")
                                .populate("product")
                                .exec(function(err, requests){
                                    console.log("from adm dept",requests)                                    
                                Department.find({}, function(err, department){
                                    Category.find({}, function(err, category){                
                                        Subcategory.find({}, function(err, sub_category){ 
                                            
                                            let categories = []                   
                                            for(var i in category){
                                                let sub_categories = [];
                                                for(var k in sub_category){                               
                                                    if(category[i]._id == sub_category[k].parent_id){
                                                                                  
                                                        sub_categories.push({
                                                            name:sub_category[k].name
                                                        })
                                                    }
                                                    
                                                }
                                                categories.push({name:category[i].name, ref_name:category[i].ref_name,  _id:category[i]._id, sub_category:sub_categories})
                                                
                                            }
                                    User.find({}, function(err, users){
                                        User.findOne({_id:decrypted_user_id}, function(err, user){   
                                            let superAdmin = user.userType=="superAdmin"?true:false;  
                                            Product.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(function(err, product) { 
                                                res.render('inventory/home', {layout: "layout/inventory", isDirector:isDirector, superAdmin:superAdmin, requests:requests, product:product, users:users, category:categories, department:department, data:{category:category, department:department}})
                                            })
                                        })
                                    });
                                });
                                        
                            })
                        })
                    })
                }
                else if(auditor_id==decrypted_user_id){
                                                   
                    Department.find({}, function(err, department){
                        Category.find({}, function(err, category){                
                            Subcategory.find({}, function(err, sub_category){ 
                                console.log(sub_category)
                                let categories = []                   
                                for(var i in category){
                                    let sub_categories = [];
                                    for(var k in sub_category){                               
                                        if(category[i]._id == sub_category[k].parent_id){
                                            console.log("true")                                    
                                            sub_categories.push({
                                                name:sub_category[k].name
                                            })
                                        }
                                        
                                    }
                                    categories.push({name:category[i].name, ref_name:category[i].ref_name,  _id:category[i]._id, sub_category:sub_categories})
                                    
                                }
                        User.find({}, function(err, users){
                            User.findOne({_id:decrypted_user_id}, function(err, user){   
                                let superAdmin = user.userType=="superAdmin"?true:false;  
                                let isAudit = true
                                AuditorLog.find({seen:false}, function(err, auditor_log){
                                    Product.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(function(err, product) { 
                                        res.render('inventory/home', {layout: "layout/inventory", auditor_log_count:auditor_log.length, auditor_log:auditor_log, isAudit:isAudit, superAdmin:superAdmin, product:product, users:users, category:categories, department:department, data:{category:category, department:department}})
                                    })
                                })
                            })
                        });
                    });
                            
                })
            })
               
                }
                else {
                                              
                                Department.find({}, function(err, department){
                                    Category.find({}, function(err, category){                
                                        Subcategory.find({}, function(err, sub_category){ 
                                            console.log(sub_category)
                                            let categories = []                   
                                            for(var i in category){
                                                let sub_categories = [];
                                                for(var k in sub_category){                               
                                                    if(category[i]._id == sub_category[k].parent_id){
                                                        console.log("true")                                    
                                                        sub_categories.push({
                                                            name:sub_category[k].name
                                                        })
                                                    }
                                                    
                                                }
                                                categories.push({name:category[i].name, ref_name:category[i].ref_name,  _id:category[i]._id, sub_category:sub_categories})
                                                
                                            }
                                    User.find({}, function(err, users){
                                        User.findOne({_id:decrypted_user_id}, function(err, user){   
                                            let superAdmin = user.userType=="superAdmin"?true:false;  
                                            Product.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(function(err, product) { 
                                                res.render('inventory/home', {layout: "layout/inventory", isDirector:isDirector, superAdmin:superAdmin, product:product, users:users, category:categories, department:department, data:{category:category, department:department}})
                                            })
                                        })
                                    });
                                });
                                        
                            })
                        })
                  
                }
    
            })
        
            })
            })
            
            })
        })
    })
        }
        else if(verifier==null) {
            Department.find({}, function(err, department){
                Category.find({}, function(err, category){                
                    Subcategory.find({}, function(err, sub_category){ 
                        console.log(sub_category)
                        let categories = []                   
                        for(var i in category){
                            let sub_categories = [];
                            for(var k in sub_category){                               
                                if(category[i]._id == sub_category[k].parent_id){
                                    console.log("true")                                    
                                    sub_categories.push({
                                        name:sub_category[k].name
                                    })
                                }
                                
                            }
                            categories.push({name:category[i].name, ref_name:category[i].ref_name,  _id:category[i]._id, sub_category:sub_categories})
                            
                        }
                User.find({}, function(err, users){
                    User.findOne({_id:decrypted_user_id}, function(err, user){   
                        let superAdmin = user.userType=="superAdmin"?true:false;  
                        Product.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(function(err, product) { 
                            res.render('inventory/home', {layout: "layout/inventory", isDirector:isDirector, superAdmin:superAdmin, product:product, users:users, category:categories, department:department, data:{category:category, department:department}})
                        })
                    })
                });
            });
                    
        })
    })
        }
        
})
}
}

function registrar_notifier(product_id){
    Product.findOne({_id:product_id}).populate('category').exec(function(err, prod){
        let registrars_category1 = 22020301;
        let registrars_category2 = 22020401;
        let category_code = prod.category[0].category_code
        const product_registrar = category_code==registrars_category1?true:category_code==registrars_category2?true:false
    })
}

function deductifier(store_id, qty){
    Store.findOne({_id:store_id}, function(err, store_item){
        let previous_unit = store_item.unit;
        let current_unit = qty
        
        let final_unit = parseInt(previous_unit-current_unit)
        Store.findByIdAndUpdate(store_id, {unit:final_unit})
        .exec(function(err, updated_store){
            if(err){
                console.log(err)
            }else {
                console.log("success", updated_store)
            }               
        })
    })
}


exports.request_many_products_post = function(req, res){
    if(!req.session.hasOwnProperty("user_id")){
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
    let decrypted_user_id = decrypt(req.session.user_id, req, res)
   let cartItems = req.body
   console.log("cart items",cartItems)

   Verifier.findOne({}, function(err, verifier){
    const store_1_verifier = verifier.store_1_verifier;
    const store_2_verifier = verifier.store_2_verifier;
    const registrar_verifier = verifier.registrar_verifier;
    const admin_1_verifier = verifier.admin_1_verifier;

    const store_1_verifier_email = verifier.store_1_verifier_email;
    const store_2_verifier_email = verifier.store_2_verifier_email;
    const registrar_verifier_email = verifier.registrar_verifier_email;
    const admin_1_verifier_email = verifier.admin_1_verifier_email;

    const store_1_verifier_full_name = verifier.store_1_verifier_full_name;
    const store_2_verifier_full_name = verifier.store_2_verifier_full_name;
    const registrar_verifier_full_name = verifier.registrar_verifier_full_name;
    const admin_1_verifier_full_name = verifier.admin_1_verifier_full_name;


    User.findOne({_id:decrypted_user_id}, function(err, requester){
        let requester_department_id = requester.department[0]
        let requesters_full_name = requester.firstName + " " + requester.lastName
        let requesters_position = requester.position;

        console.log("this is the requester", requester_department_id)

        if(requester_department_id!=undefined){
            User.findOne({ $or: [{position:"registrar/ce", 
            department:requester_department_id.toString()},
            {position:"director", department:requester_department_id.toString()}]}, 
                function(err, requester_director){
                    console.log("the requester Director", requester_director._id)
                const requesters_director = requester_director._id; 
                const user_fullname = requester_director.firstName + " " + requester_director.lastName
                let formattedItems = []
                for(var i in cartItems){
                    if(cartItems[i].category_code==22020301 || cartItems[i].category_code==22020401 )
                    {
                        let obj = {
                            rejected:false,
                            dept_director_verified:false,
                            admin_verified:false,
                            store_1_verified:false,
                            store_2_verified:false,
                            registrar_verified:false,
                            product_id:cartItems[i].product_id,
                            store_id: cartItems[i].store_id,
                            quantity: cartItems[i].qty,
                            registrar_needed:true,
                            category_code: cartItems[i].category_code,
                            description: cartItems[i].description,
                            product_name: cartItems[i].name,
                            requester_name: requesters_full_name,
                            requester_position:requesters_position,
                            registrar_needed:true
                        }
                        formattedItems.push(obj)
                    }
                    else {
                        let obj = {
                            rejected:false,
                            dept_director_verified:false,
                            admin_verified:false,
                            store_1_verified:false,
                            store_2_verified:false,
                            registrar_verified:false,
                            product_id:cartItems[i].product_id,
                            store_id: cartItems[i].store_id,
                            quantity: cartItems[i].qty,
                            registrar_needed:false,
                            category_code: cartItems[i].category_code,
                            description: cartItems[i].description,
                            product_name: cartItems[i].name,
                            requester_name: requesters_full_name,
                            requester_position:requesters_position,
                            registrar_needed:false
                        }
                        formattedItems.push(obj)
                    }
                    
                }
                let registra_needed_data = []
                for(var i in formattedItems){
                    registra_needed_data.push(formattedItems[i].registrar_needed) 
                    deductifier(formattedItems[i].store_id, formattedItems[i].quantity)
                }
                let product_registrar = registra_needed_data.length<1?false:true
                console.log("this is the registra", product_registrar)
                MultipleBinCard.find({}, function(err, cards){   
                    
                    let binCard = new MultipleBinCard;
                    binCard.items = formattedItems;
                    binCard.requester_name = requesters_full_name;
                    binCard.sv_number = parseInt(cards.length+1);
                    binCard.requester = decrypted_user_id
                    binCard.save(function(err, card){
                        if(err){
                            console.log(err)
                        }
                        else {
                            let request = new MultiRequisition();
                            request.registrar_confirm_must = product_registrar;
                            request.store_1_verifier = store_1_verifier;
                            request.store_2_verifier = store_2_verifier;
                            request.registrar_verifier = registrar_verifier;
                            request.admin_1_verifier = admin_1_verifier;                     
                            request.dept_director = requesters_director;
                            request.requester = decrypted_user_id;
                            request.requester_position = requesters_position
                            request.requester_fullname = requesters_full_name
                            request.requester_department = requester_department_id
                            request.requisitions = formattedItems;
                            request.srsiv_no = card.sv_number;
                            request.bincard_id = card._id;
                            
                            request.save(function(err, request){
                                if(err){
                                    console.log(err)
                                }
                                else {
                                    var storeOptions = {
                                        from: 'onipetheoderic@gmail.com',
                                        to: store_1_verifier_email,
                                        subject: 'Requisition Request',
                                        text: 'You have a Requisition request that needs your authentication!!, Login to Authenticate it'
                                    };
                                    var auditOptions = {
                                        from: 'onipetheoderic@gmail.com',
                                        to: store_2_verifier_email,
                                        subject: 'Requisition Request',
                                        text: 'You have a Requisition request that needs your authentication!!, Login to Authenticate it'
                                    };
                                    var registrarOptions = {
                                        from: 'onipetheoderic@gmail.com',
                                        to: registrar_verifier_email,
                                        subject: 'Requisition Request',
                                        text: 'You have a Requisition request that needs your authentication!!, Login to Authenticate it'
                                    };
                                    var adminOptions = {
                                        from: 'onipetheoderic@gmail.com',
                                        to: admin_1_verifier_email,
                                        subject: 'Requisition Request',
                                        text: 'You have a Requisition request that needs your authentication!!, Login to Authenticate it'
                                    };
                                    transporter.sendMail(storeOptions, function(error, info){
                                        if (error) {
                                            console.log(error);
                                        } else {
                                            console.log('Email sent: ' + info.response);
                                        }
                                    });
                                    transporter.sendMail(auditOptions, function(error, info){
                                        if (error) {
                                            console.log(error);
                                        } else {
                                            console.log('Email sent: ' + info.response);
                                        }
                                    });
                                    transporter.sendMail(adminOptions, function(error, info){
                                        if (error) {
                                            console.log(error);
                                        } else {
                                            console.log('Email sent: ' + info.response);
                                        }
                                    });
                                    if(product_registrar){
                                        transporter.sendMail(registrarOptions, function(error, info){
                                            if (error) {
                                                console.log(error);
                                            } else {
                                                console.log('Email sent: ' + info.response);
                                            }
                                        });  transporter.sendMail(registrarOptions, function(error, info){
                                            if (error) {
                                                console.log(error);
                                            } else {
                                                console.log('Email sent: ' + info.response);
                                            }
                                        });
                                    }
                                    res.json({success:true, msg:`requesition has been sent to ${user_fullname}`})                                
                                }
                            })     
                        }

                    })
                })
            })
        }
    })
})
}
}

exports.request_many_products = function(req, res){
    if(!req.session.hasOwnProperty("user_id")){
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
        let decrypted_user_id = decrypt(req.session.user_id, req, res)
        Store.find({})
        .populate({
            path:'product',			
            populate: { path: 'category', model: 'Category' }
        })
        .exec(function(err, products){
            console.log("this are the products",products)
            res.render('inventory/request_many_products', {layout:"layout/inventory", products:products})
        })
    }
}


exports.auditlogs = function(req, res){
    AuditorLog.find({}).populate('product')
    .exec(function(err, auditor_logs){
        res.render('inventory/auditlogs', {layout: "layout/inventory", auditor_logs:auditor_logs})
    })
}

exports.view_auditlog = function(req, res){
    console.log("this is the report page", req.params.id)
    AuditorLog.findOne({product:req.params.id}, function(err, store){
        
        Product.findOne({_id:req.params.id}).populate('category').exec(function(err, product){
            console.log(product.unit)
            
            BinCard.findOne({product:req.params.id}, function(err, binCard){
                AuditorLog.findByIdAndUpdate(store._id, {
                    seen:true
                })
                .exec(function(err, updated_store){
                    if(err){
                        console.log(err)
                    }else {
                        console.log(updated_store)
                        res.render('inventory/report_page', {          
                            layout: "layout/table", binCard:binCard, product:product, value:product.price*product.unit
                            }
                        )
                    }
                })
                
            })
        })           
    })
}

exports.default_config = function(req, res){
    if(!req.session.hasOwnProperty("user_id")){
        console.log("its working", req.session.user_id)
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
        let decrypted_user_id = decrypt(req.session.user_id, req, res)
        let decrypted_user_role = decrypt(req.session.role, req, res)
        Installation.find({}, function(err, installation){
            if(installation.length===0){
                let installer = new Installation();
                installer.default_installation = true;
                installer.save(function(err, install){
                    if(err){
                        console.log(err);
                    }
                    else {
                        for(var i in overall_config){
                            let department = new Department();
                            department.name = overall_config[i].name;
                            department.description = overall_config[i].description;
                            department.ref_name = overall_config[i].ref_name;
                            department.save(function(err, saved_department){
                                if(err){
                                    return;
                                }
                                else{
                                    console.log(saved_department)
                                }
                            })
                        
                        }
                        res.redirect('/');
                    }
                })
                
            }
            else {
                res.redirect('/');
            }
        })
        
    }
}

function binCardEditor(item_position, bincard_id, stock_balance){
    MultipleBinCard.findOne({_id:bincard_id})
    .exec(function(err, binCard){
        if(err){

        }
        else{
            let itemArray = binCard.items
            itemArray[parseInt(item_position)].stock_balance = stock_balance;
            MultipleBinCard.findByIdAndUpdate(bincard_id, {
                items:itemArray,
            }).exec(function(err, updated_bin){
                if(err){
                    console.log("BIn card not saved")
                }
                else {
                    console.log("Bin Card saved")
                }
            })
        }
        
    })
   
}

exports.request_overall_truthifier = function(req, res){
    if(!req.session.hasOwnProperty("user_id")){
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
        let decrypted_user_id = decrypt(req.session.user_id, req, res)
    let requisition_id = req.params.id;
    User.findOne({_id:decrypted_user_id})
        .exec(function(err, user){
                console.log("the user is legit")
                let user_full_name = user.firstName + " " + user.lastName
                let assigned_user = user.user_detail[0] == undefined ? null: user.user_detail[0].toString();
                
    MultiRequisition.findOne({_id:requisition_id}).exec(function(err, multi_reqs){
        
        MultiRequisition.findOne({$or:[{dept_director:decrypted_user_id, 
            _id:requisition_id},
            {dept_director: assigned_user, _id:requisition_id}] })
            .exec(function(err, reqs){                            
                const isReq = reqs==null?false:true;
                console.log("IS req", isReq)
                Verifier.findOne({}, function(err, verifier){
                    const store_1_verifier = verifier.store_1_verifier;
                    const store_2_verifier = verifier.store_2_verifier;
                    const registrar_verifier = verifier.registrar_verifier;
                    const admin_1_verifier = verifier.admin_1_verifier;
                    console.log(store_1_verifier, store_2_verifier)
                    User.findOne({_id:store_1_verifier}, function(err, store_1_guy){
                        const store_1_verifier_assigned_user = store_1_guy.user_detail;
                    User.findOne({_id:store_2_verifier}, function(err, store_2_guy){
                        const store_2_verifier_assigned_user = store_2_guy.user_detail;
                    User.findOne({_id:registrar_verifier}, function(err, registrar_guy){
                        const registrar_verifier_assigned_user = registrar_guy.user_detail;
                    User.findOne({_id:admin_1_verifier}, function(err, admin_1_guy){
                        const admin_assigned_user = admin_1_guy.user_detail;    
                    
                        if(isReq){
                            let truthifiedRequisitions = []
                            for(var i in multi_reqs.requisitions){
                                console.log("multi-requs", multi_reqs.requisitions[i])
                                
                                multi_reqs.requisitions[i].dept_director_verified = true;
                                truthifiedRequisitions.push(multi_reqs.requisitions[i])
                                
                                
                            }
                            console.log("YYYY is the dept director", truthifiedRequisitions)
                            MultiRequisition.findByIdAndUpdate(requisition_id, {
                                dept_director_verified:true
                            }).exec(function(err, updated){
                                if(err){
                                    console.log(err)
                                }
                                else {
                                     res.redirect(`/`)
                                }
                            })
                        }
                        else if(store_1_verifier==decrypted_user_id||store_1_verifier_assigned_user==decrypted_user_id){
                            let truthifiedRequisitions = []
                            for(var i in multi_reqs.requisitions){
                                console.log("multi-requs", multi_reqs.requisitions[i])
                                
                                multi_reqs.requisitions[i].store_1_verified = true;
                                truthifiedRequisitions.push(multi_reqs.requisitions[i])
                            }
                            console.log("YYYY is the dept director", truthifiedRequisitions)
                            MultiRequisition.findByIdAndUpdate(requisition_id, {
                                store_1_verified:true
                            }).exec(function(err, updated){
                                if(err){
                                    console.log(err)
                                }
                                else {
                                     res.redirect(`/`)
                                }
                            })
                        }
                        else if(store_2_verifier==decrypted_user_id|| 
                            store_2_verifier_assigned_user==decrypted_user_id){
                            let truthifiedRequisitions = []
                            for(var i in multi_reqs.requisitions){
                                console.log("multi-requs", multi_reqs.requisitions[i])
                                
                                multi_reqs.requisitions[i].store_2_verified = true;
                                truthifiedRequisitions.push(multi_reqs.requisitions[i])
                            }
                            console.log("YYYY is the dept director", truthifiedRequisitions)
                            MultiRequisition.findByIdAndUpdate(requisition_id, {
                                store_2_verified:true
                            }).exec(function(err, updated){
                                if(err){
                                    console.log(err)
                                }
                                else {
                                     res.redirect(`/`)
                                }
                            })
                        }
                        else if(registrar_verifier==decrypted_user_id || 
                            registrar_verifier_assigned_user==decrypted_user_id){
                            let truthifiedRequisitions = []
                            for(var i in multi_reqs.requisitions){
                                console.log("multi-requs", multi_reqs.requisitions[i])
                                
                                multi_reqs.requisitions[i].registrar_verified = true;
                                truthifiedRequisitions.push(multi_reqs.requisitions[i])
                            }
                            console.log("YYYY is the dept director", truthifiedRequisitions)
                            MultiRequisition.findByIdAndUpdate(requisition_id, {
                                registrar_verified:true
                            }).exec(function(err, updated){
                                if(err){
                                    console.log(err)
                                }
                                else {
                                     res.redirect(`/`)
                                }
                            })
                        }
                        else if(admin_1_verifier==decrypted_user_id || admin_assigned_user==decrypted_user_id){
                            let truthifiedRequisitions = []
                            for(var i in multi_reqs.requisitions){
                                console.log("multi-requs", multi_reqs.requisitions[i])
                                
                                multi_reqs.requisitions[i].admin_verified = true;
                                truthifiedRequisitions.push(multi_reqs.requisitions[i])
                            }
                            console.log("YYYY is the dept director", truthifiedRequisitions)
                            MultiRequisition.findByIdAndUpdate(requisition_id, {
                                admin_verified:true
                            }).exec(function(err, updated){
                                if(err){
                                    console.log(err)
                                }
                                else {
                                     res.redirect(`/`)
                                }
                            })
                        }
                    
                    })
                    })
                })
            })
        })
    })
})
    })
}
}
               

exports.verify_request = function(req, res){
    if(!req.session.hasOwnProperty("user_id")){
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
        let decrypted_user_id = decrypt(req.session.user_id, req, res)
        console.log("XXXXXXXX",req.body)
        let {requisition_id, obj_index, quantity, comment, acceptance, previous_qty} = req.body;
        User.findOne({_id:decrypted_user_id})
        .exec(function(err, user){
            if(user!=null){
                console.log("the user is legit")
                let user_full_name = user.firstName + " " + user.lastName
                let assigned_user = user.user_detail[0] == undefined ? null: user.user_detail[0].toString();
                MultiRequisition.findOne({_id:requisition_id}).exec(function(err, multi_reqs){
                    console.log("the multiReq", multi_reqs);
                    let selectedReq = multi_reqs.requisitions[parseInt(obj_index)]
                    let bincard_id = multi_reqs.bincard_id

                    Store.findOne({_id:selectedReq.store_id}).exec(function(err, store){
                        let store_unit = store.unit
                        const final_unit_request = parseInt(previous_qty)-parseInt(quantity)
                        const store_current_unit_d = parseInt(store_unit) + final_unit_request;         
                        const store_current_unit = store_current_unit_d<0?0:store_current_unit_d;
                        const store_rejected_unit = parseInt(store_unit)+parseInt(previous_qty)
                        //now we have gotten the details we need for the store
                        //now lets allow the dept director to verify the rpoduct
                        MultiRequisition.findOne({$or:[{dept_director:decrypted_user_id, 
                            _id:requisition_id},
                            {dept_director: assigned_user, _id:requisition_id}] })
                            .exec(function(err, reqs){                            
                                const isReq = reqs==null?false:true;
                                console.log("IS req", isReq)
                                Verifier.findOne({}, function(err, verifier){
                                    const store_1_verifier = verifier.store_1_verifier;
                                    const store_2_verifier = verifier.store_2_verifier;
                                    const registrar_verifier = verifier.registrar_verifier;
                                    const admin_1_verifier = verifier.admin_1_verifier;
                                    console.log(store_1_verifier, store_2_verifier)
                                    User.findOne({_id:store_1_verifier}, function(err, store_1_guy){
                                        const store_1_verifier_assigned_user = store_1_guy.user_detail;
                                    User.findOne({_id:store_2_verifier}, function(err, store_2_guy){
                                        const store_2_verifier_assigned_user = store_2_guy.user_detail;
                                    User.findOne({_id:registrar_verifier}, function(err, registrar_guy){
                                        const registrar_verifier_assigned_user = registrar_guy.user_detail;
                                    User.findOne({_id:admin_1_verifier}, function(err, admin_1_guy){
                                        const admin_assigned_user = admin_1_guy.user_detail;    
                                    //selected
                                    console.log("point reached before checking isReq")
                                    // selectedReq.dept_director_verified = true;
                                    //&& selectedReq.dept_director_verified==false
                                    if(isReq && selectedReq.dept_director_verified==false){
                                        console.log("YYYY is the dept director")
                                            if(acceptance=="accept"){
                                                let previousReqs = multi_reqs.requisitions;
                                                let previousComment = multi_reqs.comment_array
                                                previousReqs[parseInt(obj_index)].dept_director_verified = true;
                                                previousReqs[parseInt(obj_index)].quantity = quantity;
                                                let commentObj = {
                                                    name:user_full_name,
                                                    comment:comment
                                                }
                                                let newCommentArray = previousComment.concat(commentObj)
                                                MultiRequisition.findByIdAndUpdate(requisition_id, {
                                                    requisitions:previousReqs,
                                                    comment_array:newCommentArray
                                                })
                                                .exec(function(err, updated_store){
                                                    if(err){
                                                        console.log(err)
                                                    }else {
                                                        console.log(updated_store)                                            
                                                        Store.findByIdAndUpdate(selectedReq.store_id, {
                                                            unit:store_current_unit
                                                        })
                                                        .exec(function(err, updated_unit){
                                                            if(err){
                                                                console.log(err)
                                                            }else {
                                                                binCardEditor(obj_index, bincard_id, store_current_unit)
                                                                console.log("the updated Store unit after accept",updated_unit)
                                                                MultiRequisition.findOne({_id:requisition_id})
                                                                .exec(function(err, updated_requisition){
                                                                    let all_updated_reqs = []
                                                                    for(var i in updated_requisition.requisitions){
                                                                       all_updated_reqs.push(updated_requisition.requisitions[i].dept_director_verified) 
                                                                    }
                                                                    const falsifier = all_updated_reqs.includes(false)
                                                                     console.log("falsifier",falsifier)
                                                                    if(falsifier!=true){

                                                                        MultiRequisition.findByIdAndUpdate(requisition_id, {
                                                                            dept_director_verified:true
                                                                        }).exec(function(err, updated){
                                                                            if(err){
                                                                                console.log(err)
                                                                            }
                                                                            else {
                                                                                 res.redirect(`/`)
                                                                            }
                                                                        })
                                                                    }
                                                                    else {
                                                                        MultiRequisition.findByIdAndUpdate(requisition_id, {
                                                                            dept_director_verified:false
                                                                        }).exec(function(err, updated){
                                                                            if(err){
                                                                                console.log(err)
                                                                            }
                                                                            else {
                                                                                res.redirect(`/`)
                                                                            }
                                                                        })
                                                                    }
                                                                })
                                                               
                                                            }
                                                        })
                                                    }
                                                })
                                            }
                                            else if(acceptance=="reject"){
                                                let previousReqs = multi_reqs.requisitions;
                                                let previousComment = multi_reqs.comment_array
                                                previousReqs[parseInt(obj_index)].dept_director_verified = true;
                                                previousReqs.splice(parseInt(obj_index),1)
                                                let commentObj = {
                                                    name:user_full_name,
                                                    comment:comment
                                                }
                                                let newCommentArray = previousComment.concat(commentObj)
                                                MultiRequisition.findByIdAndUpdate(requisition_id, {
                                                    requisitions:previousReqs,
                                                    comment_array:newCommentArray
                                                })
                                                .exec(function(err, updated_store){
                                                    if(err){
                                                        console.log(err)
                                                    }else {
                                                        console.log(updated_store)                                            
                                                        Store.findByIdAndUpdate(selectedReq.store_id, {
                                                            unit:store_rejected_unit
                                                        })
                                                        .exec(function(err, updated_unit){
                                                            if(err){
                                                                console.log(err)
                                                            }else {
                                                                console.log(updated_unit)
                                                                res.redirect(`/`)
                                                            }
                                                        })
                                                    }
                                                })
                                            }

                                    }
                                    else if(store_1_verifier==decrypted_user_id|| 
                                        store_1_verifier_assigned_user==decrypted_user_id){
                                        console.log("store 1 guy")
                                        if(acceptance=="accept"){
                                            let previousReqs = multi_reqs.requisitions;
                                            let previousComment = multi_reqs.comment_array
                                            previousReqs[parseInt(obj_index)].store_1_verified = true;
                                            previousReqs[parseInt(obj_index)].quantity = quantity;
                                            let commentObj = {
                                                name:user_full_name,
                                                comment:comment
                                            }
                                            let newCommentArray = previousComment.concat(commentObj)
                                            MultiRequisition.findByIdAndUpdate(requisition_id, {
                                                requisitions:previousReqs,
                                                comment_array:newCommentArray
                                            })
                                            .exec(function(err, updated_store){
                                                if(err){
                                                    console.log(err)
                                                }else {
                                                    console.log(updated_store)    
                                                    binCardEditor(obj_index, bincard_id, store_current_unit)                                        
                                                    MultiRequisition.findOne({_id:requisition_id})
                                                        .exec(function(err, updated_requisition){
                                                            let all_updated_reqs = []
                                                            for(var i in updated_requisition.requisitions){
                                                                all_updated_reqs.push(updated_requisition.requisitions[i].store_1_verified) 
                                                            }
                                                            const falsifier = all_updated_reqs.includes(false)
                                                                console.log("falsifier store",falsifier)
                                                            if(falsifier!=true){
                                                                MultiRequisition.findByIdAndUpdate(requisition_id, {
                                                                    store_1_verified:true
                                                                }).exec(function(err, updated){
                                                                    if(err){
                                                                        console.log(err)
                                                                    }
                                                                    else {
                                                                        res.redirect(`/`)
                                                                    }
                                                                })
                                                            }
                                                            else {
                                                                MultiRequisition.findByIdAndUpdate(requisition_id, {
                                                                    store_1_verified:false
                                                                }).exec(function(err, updated){
                                                                    if(err){
                                                                        console.log(err)
                                                                    }
                                                                    else {
                                                                        res.redirect(`/`)
                                                                    }
                                                                })
                                                            }
                                                        })
                                                }
                                            })
                                        }
                                        else if(acceptance=="reject"){
                                            let previousReqs = multi_reqs.requisitions;
                                            let previousComment = multi_reqs.comment_array
                                            previousReqs[parseInt(obj_index)].store_1_verified = true;
                                            previousReqs.splice(parseInt(obj_index),1)
                                            let commentObj = {
                                                name:user_full_name,
                                                comment:comment
                                            }
                                            let newCommentArray = previousComment.concat(commentObj)
                                            MultiRequisition.findByIdAndUpdate(requisition_id, {
                                                requisitions:previousReqs,
                                                comment_array:newCommentArray
                                            })
                                            .exec(function(err, updated_store){
                                                if(err){
                                                    console.log(err)
                                                }else {
                                                    console.log(updated_store)                                            
                                                    Store.findByIdAndUpdate(selectedReq.store_id, {
                                                        unit:store_rejected_unit
                                                    })
                                                    .exec(function(err, updated_unit){
                                                        if(err){
                                                            console.log(err)
                                                        }else {
                                                            console.log(updated_unit)
                                                            res.redirect(`/`)
                                                        }
                                                    })
                                                }
                                            })
                                        }
        
                                    }
                                    else if(store_2_verifier==decrypted_user_id|| 
                                        store_2_verifier_assigned_user==decrypted_user_id){
                                        console.log("store 2 guy")
                                        if(acceptance=="accept"){
                                            let previousReqs = multi_reqs.requisitions;
                                            
                                            let previousComment = multi_reqs.comment_array
                                            previousReqs[parseInt(obj_index)].store_2_verified = true;
                                            previousReqs[parseInt(obj_index)].quantity = quantity;
                                            let commentObj = {
                                                name:user_full_name,
                                                comment:comment
                                            }
                                            let newCommentArray = previousComment.concat(commentObj)
                                            MultiRequisition.findByIdAndUpdate(requisition_id, {
                                                requisitions:previousReqs,
                                                comment_array:newCommentArray
                                            })
                                            .exec(function(err, updated_store){
                                                if(err){
                                                    console.log(err)
                                                }else {
                                                    console.log(updated_store)    
                                                    binCardEditor(obj_index, bincard_id, store_current_unit)                                        
                                                    MultiRequisition.findOne({_id:requisition_id})
                                                        .exec(function(err, updated_requisition){
                                                            let all_updated_reqs = []
                                                            for(var i in updated_requisition.requisitions){
                                                                all_updated_reqs.push(updated_requisition.requisitions[i].store_2_verified) 
                                                            }
                                                            const falsifier = all_updated_reqs.includes(false)
                                                                console.log("falsifier",falsifier)
                                                            if(falsifier!=true){
                                                                MultiRequisition.findByIdAndUpdate(requisition_id, {
                                                                    store_2_verified:true
                                                                }).exec(function(err, updated){
                                                                    if(err){
                                                                        console.log(err)
                                                                    }
                                                                    else {
                                                                        res.redirect(`/`)
                                                                    }
                                                                })
                                                            }
                                                            else {
                                                                MultiRequisition.findByIdAndUpdate(requisition_id, {
                                                                    store_2_verified:false
                                                                }).exec(function(err, updated){
                                                                    if(err){
                                                                        console.log(err)
                                                                    }
                                                                    else {
                                                                        res.redirect(`/`)
                                                                    }
                                                                })
                                                            }
                                                        })
                                                }
                                            })
                                        }
                                        else if(acceptance=="reject"){
                                            let previousReqs = multi_reqs.requisitions;
                                            let previousComment = multi_reqs.comment_array
                                            previousReqs[parseInt(obj_index)].store_2_verified = true;
                                            previousReqs.splice(parseInt(obj_index),1)
                                            let commentObj = {
                                                name:user_full_name,
                                                comment:comment
                                            }
                                            let newCommentArray = previousComment.concat(commentObj)
                                            MultiRequisition.findByIdAndUpdate(requisition_id, {
                                                requisitions:previousReqs,
                                                comment_array:newCommentArray
                                            })
                                            .exec(function(err, updated_store){
                                                if(err){
                                                    console.log(err)
                                                }else {
                                                    console.log(updated_store)                                            
                                                    
                                                    Store.findByIdAndUpdate(selectedReq.store_id, {
                                                        unit:store_rejected_unit
                                                    })
                                                    .exec(function(err, updated_unit){
                                                        if(err){
                                                            console.log(err)
                                                        }else {
                                                            console.log(updated_unit)
                                                            res.redirect(`/`)
                                                        }
                                                    })
                                                }
                                            })
                                        }
        
                                    }
                                    else if(registrar_verifier==decrypted_user_id || 
                                        registrar_verifier_assigned_user==decrypted_user_id){
                                        console.log("registrar guy")
                                        if(acceptance=="accept"){
                                            let previousReqs = multi_reqs.requisitions;
                                            let previousComment = multi_reqs.comment_array
                                            previousReqs[parseInt(obj_index)].registrar_verified = true;
                                            previousReqs[parseInt(obj_index)].quantity = quantity;
                                            let commentObj = {
                                                name:user_full_name,
                                                comment:comment
                                            }
                                            let newCommentArray = previousComment.concat(commentObj)
                                            MultiRequisition.findByIdAndUpdate(requisition_id, {
                                                requisitions:previousReqs,
                                                comment_array:newCommentArray
                                            })
                                            .exec(function(err, updated_store){
                                                if(err){
                                                    console.log(err)
                                                }else {
                                                    console.log(updated_store)        
                                                    binCardEditor(obj_index, bincard_id, store_current_unit)                                    
                                                    MultiRequisition.findOne({_id:requisition_id})
                                                        .exec(function(err, updated_requisition){
                                                            let all_updated_reqs = []
                                                            for(var i in updated_requisition.requisitions){
                                                                all_updated_reqs.push(updated_requisition.requisitions[i].registrar_verified) 
                                                            }
                                                            const falsifier = all_updated_reqs.includes(false)
                                                                console.log("falsifier",falsifier)
                                                            if(falsifier!=true){
                                                                MultiRequisition.findByIdAndUpdate(requisition_id, {
                                                                    registrar_verified:true
                                                                }).exec(function(err, updated){
                                                                    if(err){
                                                                        console.log(err)
                                                                    }
                                                                    else {
                                                                        res.redirect(`/`)
                                                                    }
                                                                })
                                                            }
                                                            else {
                                                                MultiRequisition.findByIdAndUpdate(requisition_id, {
                                                                    registrar_verified:false
                                                                }).exec(function(err, updated){
                                                                    if(err){
                                                                        console.log(err)
                                                                    }
                                                                    else {
                                                                        res.redirect(`/`)
                                                                    }
                                                                })
                                                            }
                                                        })
                                                }
                                            })
                                        }
                                        else if(acceptance=="reject"){
                                            let previousReqs = multi_reqs.requisitions;
                                            let previousComment = multi_reqs.comment_array
                                            previousReqs[parseInt(obj_index)].registrar_verified = true;
                                            previousReqs.splice(parseInt(obj_index),1)
                                            let commentObj = {
                                                name:user_full_name,
                                                comment:comment
                                            }
                                            let newCommentArray = previousComment.concat(commentObj)
                                            MultiRequisition.findByIdAndUpdate(requisition_id, {
                                                requisitions:previousReqs,
                                                comment_array:newCommentArray
                                            })
                                            .exec(function(err, updated_store){
                                                if(err){
                                                    console.log(err)
                                                }else {
                                                    console.log(updated_store)                                            
                                                    Store.findByIdAndUpdate(selectedReq.store_id, {
                                                        unit:store_rejected_unit
                                                    })
                                                    .exec(function(err, updated_unit){
                                                        if(err){
                                                            console.log(err)
                                                        }else {
                                                            console.log(updated_unit)
                                                            res.redirect(`/`)
                                                        }
                                                    })
                                                }
                                            })
                                        }
        
                                    }

                                    else if(admin_1_verifier==decrypted_user_id || admin_assigned_user==decrypted_user_id){
                                        console.log("admin guy guy")
                                        if(acceptance=="accept"){
                                            let previousReqs = multi_reqs.requisitions;
                                            let previousComment = multi_reqs.comment_array
                                            previousReqs[parseInt(obj_index)].admin_verified = true;
                                            previousReqs[parseInt(obj_index)].quantity = quantity;
                                            let commentObj = {
                                                name:user_full_name,
                                                comment:comment
                                            }
                                         
                                            let newCommentArray = previousComment.concat(commentObj)
                                                                                     
                                            MultiRequisition.findByIdAndUpdate(requisition_id, {
                                                requisitions:previousReqs,
                                                comment_array:newCommentArray
                                            })
                                            .exec(function(err, updated_store){
                                                if(err){
                                                    console.log(err)
                                                }else {
                                                    console.log(updated_store)   
                                                    binCardEditor(obj_index, bincard_id, store_current_unit)                                         
                                                    MultiRequisition.findOne({_id:requisition_id})
                                                        .exec(function(err, updated_requisition){
                                                            let all_updated_reqs = []
                                                            for(var i in updated_requisition.requisitions){
                                                                all_updated_reqs.push(updated_requisition.requisitions[i].admin_verified) 
                                                            }
                                                            const falsifier = all_updated_reqs.includes(false)
                                                                console.log("falsifier",falsifier)
                                                            if(falsifier!=true){
                                                                MultiRequisition.findByIdAndUpdate(requisition_id, {
                                                                    admin_1_verified:true
                                                                }).exec(function(err, updated){
                                                                    if(err){
                                                                        console.log(err)
                                                                    }
                                                                    else {
                                                                        res.redirect(`/`)
                                                                    }
                                                                })
                                                            }
                                                            else {                                                                
                                                                MultiRequisition.findByIdAndUpdate(requisition_id, {
                                                                    admin_1_verified:false
                                                                }).exec(function(err, updated){
                                                                    if(err){
                                                                        console.log(err)
                                                                    }
                                                                    else {
                                                                        res.redirect(`/`)
                                                                    }
                                                                })                                                                
                                                            }
                                                        })
                                                }
                                            })
                                        }
                                        else if(acceptance=="reject"){
                                            let previousReqs = multi_reqs.requisitions;
                                            let previousComment = multi_reqs.comment_array
                                            previousReqs[parseInt(obj_index)].admin_1_verifier = true;
                                            previousReqs.splice(parseInt(obj_index),1)
                                            let commentObj = {
                                                name:user_full_name,
                                                comment:comment
                                            }
                                           
                                                let newCommentArray = previousComment.concat(commentObj)
                                        
                                            MultiRequisition.findByIdAndUpdate(requisition_id, {
                                                requisitions:previousReqs,
                                                comment_array:newCommentArray
                                            })
                                            .exec(function(err, updated_store){
                                                if(err){
                                                    console.log(err)
                                                }else {
                                                    console.log(updated_store)                                            
                                                    Store.findByIdAndUpdate(selectedReq.store_id, {
                                                        unit:store_rejected_unit
                                                    })
                                                    .exec(function(err, updated_unit){
                                                        if(err){
                                                            console.log(err)
                                                        }else {
                                                            console.log(updated_unit)
                                                            res.redirect(`/`)
                                                        }
                                                    })
                                                }
                                            })
                                        }
        
                                    }

                                    




                                    })
                                    })
                                    })
                                })
                            })
                        })

                    })
                })
            }
            else {
                console.log("the user is not legit")
            }
        
        })
           
    }
   
}
/*

exports.verify_request = function(req, res){
    if(!req.session.hasOwnProperty("user_id")){
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
        let decrypted_user_id = decrypt(req.session.user_id, req, res)
        let request_id = req.body.request_id;
        let current_unit = req.body.unit;
        let initial_unit = req.body.initial_unit;
        let acceptance = req.body.acceptance;
        let passcode= req.body.passcode;
        //lets get the users department_user
      
       Request.findOne({_id:request_id}).exec(function(err, reqy){
        Store.findOne({product:reqy.product}).exec(function(err, store){
            console.log("The storre Valueee",store)
        const store_id = store._id;
        console.log("directors Request", reqy, decrypted_user_id)              
     
       
        const requested_units = reqy.unit;
        const final_unit_request = parseInt(requested_units)-parseInt(current_unit)
        const store_current_unit = parseInt(store.unit) + final_unit_request
        const store_rejected_unit = parseInt(store.unit)+parseInt(requested_units)
        console.log("reeeeequessted units", reqy.unit);
      
      
        User.findOne({_id:decrypted_user_id, passcode:passcode})
        .exec(function(err, user){
           
            if(user!=null){
                let assigned_user = user.user_detail[0] == undefined ? null: user.user_detail[0].toString();
               
                Request.findOne({$or:[{dept_director:decrypted_user_id,_id:request_id},
                    {dept_director: assigned_user, _id:request_id}] })
                .exec(function(err, reqs){
                    
                    const isReq = reqs==null?false:true;
                    console.log("IS req", isReq, reqy)

                    Verifier.findOne({}, function(err, verifier){
                        const store_1_verifier = verifier.store_1_verifier;
                        const store_2_verifier = verifier.store_2_verifier;
                        const registrar_verifier = verifier.registrar_verifier;
                        const admin_1_verifier = verifier.admin_1_verifier;
                      console.log(store_1_verifier, store_2_verifier)
                        User.findOne({_id:store_1_verifier}, function(err, store_1_guy){
                            const store_1_verifier_assigned_user = store_1_guy.user_detail;
                        User.findOne({_id:store_2_verifier}, function(err, store_2_guy){
                            const store_2_verifier_assigned_user = store_2_guy.user_detail;
                        User.findOne({_id:registrar_verifier}, function(err, registrar_guy){
                            const registrar_verifier_assigned_user = registrar_guy.user_detail;
                        User.findOne({_id:admin_1_verifier}, function(err, admin_1_guy){
                            const admin_assigned_user = admin_1_guy.user_detail;                           
                            
                            
                            if(isReq && reqs.dept_director_verified==false){
                                console.log("YYYY dept director")
                                if(acceptance=="accept"){
                                    Request.findByIdAndUpdate(request_id, {
                                        dept_director_verified:true,
                                        dept_unit: current_unit,
                                        unit:current_unit
                                    })
                                    .exec(function(err, updated_store){
                                        if(err){
                                            console.log(err)
                                        }else {
                                            console.log(updated_store)                                            
                                            Store.findByIdAndUpdate(store_id, {
                                                unit:store_current_unit
                                            })
                                            .exec(function(err, updated_unit){
                                                if(err){
                                                    console.log(err)
                                                }else {
                                                    console.log(updated_unit)
                                                    res.redirect(`/`)
                                                }
                                            })
                                        }
                                    })
                                }
                                else if(acceptance=="reject"){
                                    Request.findByIdAndUpdate(request_id, {
                                        rejected:true
                                    })
                                    .exec(function(err, updated_store){
                                        if(err){
                                            console.log(err)
                                        }else {
                                            console.log(updated_store)
                                            Store.findByIdAndUpdate(store_id, {
                                                unit:store_rejected_unit
                                            })
                                            .exec(function(err, updated_unit){
                                                if(err){
                                                    console.log(err)
                                                }else {
                                                    Store.findByIdAndUpdate(store_id, {
                                                        unit:store_current_unit
                                                    })
                                                    .exec(function(err, updated_unit){
                                                        if(err){
                                                            console.log(err)
                                                        }else {
                                                            console.log(updated_unit)
                                                            res.redirect(`/`)
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }
                                
                            }
                            else if(store_1_verifier==decrypted_user_id|| 
                                store_1_verifier_assigned_user==decrypted_user_id){
                                console.log("store 1 guy")
                                if(acceptance=="accept"){
                                    Request.findByIdAndUpdate(request_id, {
                                        store_1_verified:true,
                                        dept_unit: current_unit,
                                        unit:current_unit
                                    })
                                    .exec(function(err, updated_store){
                                        if(err){
                                            console.log(err)
                                        }else {
                                            console.log(updated_store)                                            
                                            Store.findByIdAndUpdate(store_id, {
                                                unit:store_current_unit
                                            })
                                            .exec(function(err, updated_unit){
                                                if(err){
                                                    console.log(err)
                                                }else {
                                                    console.log(updated_unit)
                                                    res.redirect(`/`)
                                                }
                                            })
                                        }
                                    })
                                }
                                else if(acceptance=="reject"){
                                    Request.findByIdAndUpdate(request_id, {
                                        rejected:true
                                    })
                                    .exec(function(err, updated_store){
                                        if(err){
                                            console.log(err)
                                        }else {
                                            console.log(updated_store)
                                            Store.findByIdAndUpdate(store_id, {
                                                unit:store_rejected_unit
                                            })
                                            .exec(function(err, updated_unit){
                                                if(err){
                                                    console.log(err)
                                                }else {
                                                    console.log(updated_store)                                            
                                                    Store.findByIdAndUpdate(store_id, {
                                                        unit:store_current_unit
                                                    })
                                                    .exec(function(err, updated_unit){
                                                        if(err){
                                                            console.log(err)
                                                        }else {
                                                            console.log(updated_unit)
                                                            res.redirect(`/`)
                                                        }
                                                    })
                                                }
                                            })
                                        }
                                    })
                                }

                            }
                            else if(store_2_verifier==decrypted_user_id || 
                                store_2_verifier_assigned_user==decrypted_user_id){
                                console.log("store 2 guy")
                                if(acceptance=="accept"){
                                    Request.findByIdAndUpdate(request_id, {
                                        store_2_verified:true,
                                        dept_unit: current_unit,
                                        unit:current_unit
                                    })
                                    .exec(function(err, updated_store){
                                        if(err){
                                            console.log(err)
                                        }else {
                                            console.log(updated_store)                                            
                                            Store.findByIdAndUpdate(store_id, {
                                                unit:store_current_unit
                                            })
                                            .exec(function(err, updated_unit){
                                                if(err){
                                                    console.log(err)
                                                }else {
                                                    console.log(updated_unit)
                                                    res.redirect(`/`)
                                                }
                                            })
                                        }
                                    })
                                }
                                else if(acceptance=="reject"){
                                    Request.findByIdAndUpdate(request_id, {
                                        rejected:true
                                    })
                                    .exec(function(err, updated_store){
                                        if(err){
                                            console.log(err)
                                        }else {
                                            console.log(updated_store)
                                            Store.findByIdAndUpdate(store_id, {
                                                unit:store_rejected_unit
                                            })
                                            .exec(function(err, updated_unit){
                                                if(err){
                                                    console.log(err)
                                                }else {
                                                    console.log(updated_unit)
                                                    res.redirect(`/`)
                                                }
                                            })
                                        }
                                    })
                                }
                            }
                            else if(registrar_verifier==decrypted_user_id || 
                                registrar_verifier_assigned_user==decrypted_user_id){
                               console.log("registrar guy, right",reqs, "the current Unit", current_unit)
                               Request.findOne({_id:request_id}).exec(function(err, reque){
                                   console.log("single request",reque)
                               })
                                if(acceptance=="accept"){
                                    Request.findByIdAndUpdate(request_id, {
                                        registrar_verified:true,
                                        dept_unit: current_unit,
                                        unit:current_unit
                                    })
                                    .exec(function(err, updated_store){
                                        if(err){
                                            console.log(err)
                                        }else {
                                            console.log(updated_store)                                            
                                            Store.findByIdAndUpdate(store_id, {
                                                unit:store_current_unit
                                            })
                                            .exec(function(err, updated_unit){
                                                if(err){
                                                    console.log(err)
                                                }else {
                                                    console.log(updated_unit)
                                                    res.redirect(`/`)
                                                }
                                            })
                                        }
                                    })
                                }
                                else if(acceptance=="reject"){
                                    Request.findByIdAndUpdate(request_id, {
                                        rejected:true
                                    })
                                    .exec(function(err, updated_store){
                                        if(err){
                                            console.log(err)
                                        }else {
                                            console.log(updated_store)
                                            Store.findByIdAndUpdate(store_id, {
                                                unit:store_rejected_unit
                                            })
                                            .exec(function(err, updated_unit){
                                                if(err){
                                                    console.log(err)
                                                }else {
                                                    console.log(updated_unit)
                                                    res.redirect(`/`)
                                                }
                                            })
                                        }
                                    })
                                }
                                
                            }
                            else if(admin_1_verifier==decrypted_user_id || admin_assigned_user==decrypted_user_id){
                                console.log("admin guy")
                                if(acceptance=="accept"){
                                    Request.findByIdAndUpdate(request_id, {
                                        admin_1_verified:true,
                                        dept_unit: current_unit,
                                        unit:current_unit
                                    })
                                    .exec(function(err, updated_store){
                                        if(err){
                                            console.log(err)
                                        }else {
                                            console.log(updated_store)                                            
                                            Store.findByIdAndUpdate(store_id, {
                                                unit:store_current_unit
                                            })
                                            .exec(function(err, updated_unit){
                                                if(err){
                                                    console.log(err)
                                                }else {
                                                    console.log(updated_unit)
                                                    res.redirect(`/`)
                                                }
                                            })
                                        }
                                    })
                                }
                                else if(acceptance=="reject"){
                                    Request.findByIdAndUpdate(request_id, {
                                        rejected:true
                                    })
                                    .exec(function(err, updated_store){
                                        if(err){
                                            console.log(err)
                                        }else {
                                            console.log(updated_store)
                                            Store.findByIdAndUpdate(store_id, {
                                                unit:store_rejected_unit
                                            })
                                            .exec(function(err, updated_unit){
                                                if(err){
                                                    console.log(err)
                                                }else {
                                                    console.log(updated_unit)
                                                    res.redirect(`/`)
                                                }
                                            })
                                        }
                                    })
                                }
                            }
    
                        })
                    
                        })
                        })
                        
                        })
                    })
                })
            }
        })
    })
})
            }
            else{
                console.log("the user is not legit")
            }

}
*/


//incomplete_authentication.hbs
exports.incomplete_authentication = function(req, res){
    
      
    Product.find({}, function(err, products){
        let all_products_incomplete = [];
        for(var i in products){
            if(products[i].audit_verified==false || products[i].user_verified==false || products[i].user_verified==false || products[i].admin_verified==false){
                all_products_incomplete.push(products[i])
            }
        }
        console.log(all_products_incomplete)
        res.render('inventory/incomplete_authentication', {layout: "layout/inventory", data:{all_products_incomplete:all_products_incomplete}})
    })
}


exports.confirmation = function(req, res){
    Department.find({}, function(err, department){
        Category.find({}, function(err, category){
            User.find({}, function(err, users){
    const _id = req.params.id
    Product.findOne({_id:_id}, function(err, product){
        if(product==null){
            res.render('inventory/confirmation', {layout: "layout/inventory", users:users, category:category, department:department,data:{id:_id}})
        }
        else {
            const overall_confirmation = product.admin_verified===true && product.store_verified===true && product.audit_verified===true && product.user_verified ===true ?"enabled":"disabled";
            console.log(product)
            console.log(overall_confirmation)
            res.render('inventory/confirmation', {
                layout: "layout/inventory",
                users:users, category:category, department:department,
                data:{
                    id:_id,
                    overall_confirmation:overall_confirmation,
                    admin_verified:product.admin_verified,
                    store_verified:product.store_verified,
                    audit_verified:product.audit_verified,
                    user_verified: product.user_verified,
                }
            })
        }
    })
});
})
})
}


function confirmation_redirector(req, res, msg){
    Product.findOne({_id:req.params.id}, function(err, product){
        // res.redirect(`/confirmation/${req.params.id}`)
            const overall_confirmation = product.admin_verified===true && product.store_verified===true && product.audit_verified===true && product.user_verified ===true ?"enabled":"disabled";
            res.render('inventory/confirmation', {
            layout: "layout/inventory",

            message:{error:msg},
            data:{
            id:req.params.id,

            overall_confirmation:overall_confirmation,
            admin_verified:product.admin_verified,
            store_verified:product.store_verified,
            audit_verified:product.audit_verified,
            user_verified: product.user_verified,
            }
            })
        });
}

function user_redirector(req, res, msg){
    var categories = [];
    var departments = [];
    Department.find({}, function(err, department){
        Category.find({}, function(err, category){
            User.find({}, function(err, users){    
                Subcategory.find({}, function(err, sub_category){ 
                    console.log(sub_category)
                                  
                    for(var i in category){
                        let sub_categories = [];
                        for(var k in sub_category){                               
                            if(category[i]._id == sub_category[k].parent_id){
                                console.log("true")                                    
                                sub_categories.push({
                                    name:sub_category[k].name
                                })
                            }
                            
                        }
                        categories.push({name:category[i].name, ref_name:category[i].ref_name,  _id:category[i]._id, sub_category:sub_categories})
                        
                    }
                    for(var i in department){
                        departments.push(department[i])
                    }
                   
               
        res.render('inventory/home', {layout: "layout/inventory", message:{error:msg}, users:users, category:categories, sub_category:sub_category, department:department, data:{department:department}})
    })
});
})
})
}


function home_redirector(req, res, msg){
    Department.find({}, function(err, department){
        Category.find({}, function(err, category){
            User.find({}, function(err, users){    
        res.render('inventory/home', {layout: "layout/inventory", message:{error:msg}, users:users, category:category, department:department, data:{department:department}})
    })
})
})
}

exports.assign_position = function(req, res){
    if(!req.session.hasOwnProperty("user_id")){
        console.log("its working", req.session.user_id)
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
        let decrypted_user_id = decrypt(req.session.user_id, req, res)
        let decrypted_user_role = decrypt(req.session.role, req, res)
        console.log("this is the current role", decrypted_user_role)
        if(decrypted_user_role==="director"){
            User.findOne({_id:decrypted_user_id})
            .exec(function(err, user){
                console.log("this is the user",user.department[0])
                User.find({department:user.department[0], position: { "$ne": "director" }})
                .populate('department')
                .exec(function(err, userz){
                    console.log("this is the assignable", userz)
                    res.render('inventory/assign_page', {          
                        layout: "layout/inventory", assignable_users:userz
                        }
                    )
                })
            })
          
        }
        else {
            res.render('inventory/assign_page', {          
                layout: "layout/inventory",  message:{error:"you are not a director"},
                }
            )
        }
    }
}


exports.assign_position_post = function(req, res){
    if(!req.session.hasOwnProperty("user_id")){
        console.log("its working", req.session.user_id)
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
        let decrypted_user_id = decrypt(req.session.user_id, req, res)
        let decrypted_user_role = decrypt(req.session.role, req, res)
        console.log("this is thte incomnig,", req.body.user_id)
        //a one to one relationship btwn the director and dthe user
        User.findByIdAndUpdate(decrypted_user_id, 
            {user_detail:req.body.user_id})
        .exec(function(err, updated_user){
            if(err){
                console.log(err)
            }else {
                User.findByIdAndUpdate(req.body.user_id, 
                    {director_assigned:true, user_detail:decrypted_user_id})
                .exec(function(err, updated_user){
                    if(err){
                        console.log(err)
                    }else {
                        console.log(updated_user)
                        let msg="Position successfully assigned"
                        user_redirector(req, res, msg)         
                    }
                })
               
            }
        })
        
    }
}



exports.report_page = function(req, res){
    console.log("this is the report page", req.params.id)
    Store.findOne({product:req.params.id}, function(err, store){
        Product.findOne({_id:req.params.id}).populate('category').exec(function(err, product){
            console.log(product.unit)
            BinCard.findOne({product:req.params.id}, function(err, binCard){
                res.render('inventory/report_page', {          
                    layout: "layout/table", binCard:binCard, product:product, value:product.price*product.unit
                    }
                )
            })
        })           
    })
}
exports.generate_bin_card = function(req, res){
    console.log("this is the generate card page");
    res.render('inventory/generation_page', {          
        layout: "layout/inventory", }
    )
}

exports.generate_bin = function(req, res){
    console.log("this is the generate card page");
    res.render('inventory/generate_bin', {          
        layout: "layout/inventory", }
    )
}
exports.generate_ledger = function(req, res){
    console.log("this is the generate card page");
    res.render('inventory/generate_ledger', {          
        layout: "layout/inventory", }
    )
}

exports.generate_report_form = function(req, res){
    console.log(req.params.id)
    Product.findOne({_id:req.params.id}).populate('category').exec(function(err, product){
        // let unit = product.unit
    const product_id = product.parent_id == undefined || product.parent_id=="" ? req.params.id : product.parent_id
       console.log(product)
        
        Store.findOne({product:product_id}, function(err, stores){
        if(stores==null){
            let store = new Store();
            store.product = product._id;
            store.unit = product.unit
            store.save(function(err, store){
                if(err){
                    console.log(err)
                }
                else {
                    //ppppp
                    let auditorlog = new AuditorLog();
                    auditorlog.product = product._id;
                    auditorlog.unit = product.unit;
                    auditorlog.save(function(err, auditorlog){
                        if(err){
                            console.log(err)
                        }
                        else{
                            
                      
                    Product.findByIdAndUpdate(req.params.id, {stored:true})
                    .exec(function(err, updated_staff){
                        if(err){
                            console.log(err)
                        }else { 

                            BinCard.find({}, function(err, cards){ 
                               
                                let binCard = new BinCard;
                                binCard.product = product._id
                                binCard.stock_balance = product.unit
                                binCard.siv_number = parseInt(cards.length+1)
                                binCard.quantity = product.unit;
                                binCard.save(function(err, card){
                                    if(err){
                                        console.log(err)
                                    }
                                    else {
                                        res.redirect(`/report_page/${req.params.id}`)
                                    }
                                })
                            })                          
                        }

                    })
                }
            })
                }
            })
        } 
        else {
            const prev_unit = stores.unit==undefined?0:stores.unit;
            let unit = parseInt(product.unit + prev_unit)
            Store.findByIdAndUpdate(stores._id, {unit:unit})
            .exec(function(err, updated_staff){
                if(err){
                    console.log(err)
                }else {
                    BinCard.find({}, function(err, cards){   
                                                                                 
                        let binCard = new BinCard;
                        binCard.product = product._id;
                        binCard.stock_balance = unit
                        binCard.siv_number = parseInt(cards.length+1)
                        binCard.quantity = prev_unit;
                        binCard.save(function(err, card){
                            if(err){
                                console.log(err)
                            }
                            else {
                                res.redirect(`/report_page/${req.params.id}`);
                            }
                        })
                    })    
                   
                }
            })
           
        }
    })
    })
}

exports.confirmation_post = function(req, res){
    console.log(req.params.id)
    if(req.body.current_department=="admin"){
        User.findOne({email:req.body.admin_email}, function(err, user){
            if(user!=null && user.passcode==req.body.admin_password){
                Department.findOne({_id:user.department}, function(err, department){
                    if(department.ref_name=="admin_department"){
                        Product.findByIdAndUpdate(req.params.id, {admin_verified:true})
                        .exec(function(err, updated_staff){
                            if(err){
                                console.log(err)
                            }else {
                                res.redirect(`/confirmation/${req.params.id}`)
                            }
                        })
                    }
                    else{
                        let msg = "You dont belong to the Admin department"
                        confirmation_redirector(req, res, msg)
                       //PPPPPPPP
                    }
                    
                })
            }
            else {
                let msg = "Password dont match with Email"
                confirmation_redirector(req, res, msg)
            }
        })
    }
    else if(req.body.current_department=="store"){
        User.findOne({email:req.body.store_email}, function(err, user){
            if(user!=null && user.passcode==req.body.store_password){
                Department.findOne({_id:user.department}, function(err, department){
                    console.log("this si the de", department)
                    if(department.ref_name=="store_department"){
                        Product.findByIdAndUpdate(req.params.id, {store_verified:true})
                        .exec(function(err, updated_staff){
                            if(err){
                                console.log(err)
                            }else {
                                res.redirect(`/confirmation/${req.params.id}`)
                            }
                        })
                    }
                    else{
                        let msg = "You dont belong to the Store department"
                        confirmation_redirector(req, res, msg)
                       //PPPPPPPP
                    }
                    
                })
            }
            else {
                let msg = "Password dont match with Email"
                confirmation_redirector(req, res, msg)
            }
        })
    }
    else if(req.body.current_department=="audit"){
        console.log("this is the right department")
        User.findOne({email:req.body.audit_email}, function(err, user){
            if(user!=null && user.passcode==req.body.audit_password){
                console.log("the passwords match")
                Department.findOne({_id:user.department}, function(err, department){
                    console.log("this is the dep", department)
                    if(department.ref_name=="audit_department"){
                        Product.findByIdAndUpdate(req.params.id, {audit_verified:true})
                        .exec(function(err, updated_staff){
                            if(err){
                                console.log(err)
                            }else {
                                res.redirect(`/confirmation/${req.params.id}`)
                            }
                        })
                    }
                    else{
                        let msg = "You dont belong to the Audit department"
                        confirmation_redirector(req, res, msg)
                       //PPPPPPPP
                    }
                    
                })
            }
            else {
                let msg = "Password dont match with Email"
                confirmation_redirector(req, res, msg)
            }
        })
    }
           
    else if(req.body.current_department=="user"){
        User.findOne({email:req.body.user_email}, function(err, user){
            console.log("this is the user", user)
            if(user!=null && user.passcode==req.body.user_password){
                Department.findOne({_id:user.department}, function(err, department){
                    console.log("this is the deparetment", department)
                    // if(department.ref_name !="admin_department" && department.ref_name != "store_department" && department.ref_name != "audit_department"){
                        Product.findByIdAndUpdate(req.params.id, {user_verified:true})
                        .exec(function(err, updated_staff){
                            if(err){
                                console.log(err)
                            }else {
                                res.redirect(`/confirmation/${req.params.id}`)
                            }
                        })
                    // }
                    // else{
                    //     let msg = "You dont belong to the user department"
                    //     confirmation_redirector(req, res, msg)
                    //    //PPPPPPPP
                    // }
                    
                })
            }
            else {
                let msg = "Password dont match with Email"
                confirmation_redirector(req, res, msg)
            }
            
        })
    }
}

//submit final 
exports.submit_final_confirmation = function(req, res){
    let final_product = req.params.id;
    Product.findOne({_id:final_product}, function(err, product){
    let store = new Store();
    store.product = product.id;
    store.unit = product.unit
    })
  
}


//Get method of create department
exports.create_department = function(req, res){
    res.render('inventory/create_department', {layout: "layout/inventory"})
}
//post method of create deparment handled with the same route name
exports.create_department_post = function(req, res){
   
    let department = new Department();
    department.name = req.body.name;
    department.description = req.body.description;
    department.ref_name = req.body.ref_name;
    department.save(function(err, saved_department){
        if(err){
            console.log(err)
        }
        else {
            res.redirect('/')
        }
    })
}



exports.create_category = function(req, res){
    Department.find({}, function(err, department){
        Category.find({}, function(err, category){
            User.find({}, function(err, users){
                res.render('inventory/create_category', {layout: "layout/inventory", users:users, category:category, department:department})
            })
        })
    })
}
exports.create_category_post = function(req, res){    
    let category = new Category();
    category.name = req.body.name;
    category.description = req.body.description;
    category.code = req.body.category_code;
    category.save(function(err, saved_category){
        if(err){
            console.log(err)
        }
        else {
            res.redirect('/')
        }
    })

   
}


exports.create_user_normal = function(req, res){
    var categories = [];
    var departments = [];
    Department.find({}, function(err, department){
        Category.find({}, function(err, category){
            User.find({}, function(err, users){    
                Subcategory.find({}, function(err, sub_category){ 
                    console.log(sub_category)
                                  
                    for(var i in category){
                        let sub_categories = [];
                        for(var k in sub_category){                               
                            if(category[i]._id == sub_category[k].parent_id){
                                console.log("true")                                    
                                sub_categories.push({
                                    name:sub_category[k].name
                                })
                            }
                            
                        }
                        categories.push({name:category[i].name, ref_name:category[i].ref_name,  _id:category[i]._id, sub_category:sub_categories})
                        
                    }
                    for(var i in department){
                        departments.push(department[i])
                    }
                   
               
        res.render('inventory/create_user_normal', {layout: "layout/inventory", users:users, category:categories, sub_category:sub_category, department:department, data:{department:department}})
    })
});
})
})
}


exports.create_user = function(req, res){
    Department.find({}, function(err, department){
        Category.find({}, function(err, category){
            User.find({}, function(err, users){    
        res.render('inventory/create_user', {layout: "layout/inventory", users:users, category:category, department:department, data:{department:department}})
    })
})
})
}


exports.create_user_post = function(req, res){
    User.findOne({email:req.body.email}, function(err, user){
        console.log(user);
        const position = req.body.position.split(' ').join('_').toLowerCase() ==="registrar" ? "registrar": req.body.position.split(' ').join('_').toLowerCase() === "registrar/ce"?"registrar":req.body.position.split(' ').join('_').toLowerCase();
        if(user==null){            
            let user = new User();
            user.email = req.body.email;
            user.firstName = req.body.firstName;
            user.lastName = req.body.lastName;
            user.passcode = req.body.passcode;
            user.position = position;
            user.department = req.body.department;
            user.staff_number = req.body.staff_number;
            user.save(function(err, saved_user){
                if(err){
                    console.log(err)
                }
                else {
                    res.redirect('/')
                }
            })
        }
        else{
            let msg = "Email is not available"
            user_redirector(req, res, msg)
        }
    })
    
}

exports.create_product = function(req, res){
    Department.find({}, function(err, department){        
        User.find({}, function(err, users){    
            Category.find({}, function(err, category){
                Subcategory.find({}, function(err, subs){
        res.render('inventory/create_product', {layout: "layout/inventory", subs:JSON.stringify(subs), users:users, category:category, department:department,data:{category:category}})
    }) }) })    })
}
exports.product_options = function(req, res) {
    Department.find({}, function(err, department){        
        User.find({}, function(err, users){    
            Category.find({}, function(err, category){
                Subcategory.find({}, function(err, subs){
    res.render('inventory/product_options', {layout: "layout/inventory", subs:JSON.stringify(subs), users:users, category:category, department:department,data:{category:category}})
}) }) })    })
}

exports.add_to_existing = function(req, res) {
    Department.find({}, function(err, department){        
        User.find({}, function(err, users){    
            Category.find({}, function(err, category){
                Subcategory.find({}, function(err, subs){
                    Store.find({}).populate('product').exec(function(err, products){
                        console.log(products)
                        res.render('inventory/add_to_existing', {layout: "layout/inventory", subs:JSON.stringify(subs), users:users, category:category, department:department,data:{category:category, products:products}})
                    }) 
                }) 
            })    
        })
    })
}

exports.request_product = function(req, res){
    if(!req.session.hasOwnProperty("user_id")){
        console.log("its working", req.session.user_id)
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
    let decrypted_user_id = decrypt(req.session.user_id, req, res)
        Store.find({}).populate('product')
        .exec(function(err, products){
            console.log("this are the products",products)
            res.render('inventory/request_a_product', {layout:"layout/inventory", products:products})
        })
    }
}


exports.view_requests = function(req, res){
    MultiRequisition.find({})
    .populate('requester_department')
    .populate('requester')
    .exec(function(err, requests){
        console.log("bf", requests)

        let all_requests = [];
        for(var i in requests){
            if(requests[i].admin_1_verified == true && requests[i].store_2_verified == true && requests[i].store_1_verified == true){
                all_requests.push(requests[i])
            }
        }
        // console.log("this are all the requests",all_requests)
        res.render('inventory/view_requests', {layout:"layout/inventory", data:{all_requests:all_requests}})
    })
}
exports.single_requisition = function(req, res){
    MultiRequisition.findOne({_id:req.params.id})
    .populate('requester_department')
    .populate('requester')
    .exec(function(err, all_requisitions){
        res.render('inventory/single_requisition', {layout: "layout/table", all_requisitions:all_requisitions})
    })
}

exports.request_product_post = function(req, res){
    if(!req.session.hasOwnProperty("user_id")){
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
        let decrypted_user_id = decrypt(req.session.user_id, req, res)
        let decrypted_department = decrypt(req.session.role, req, res)
        let store_id = req.body.store_id
        let product_id = req.body.product_id
        Verifier.findOne({}, function(err, verifier){
            const store_1_verifier = verifier.store_1_verifier;
            const store_2_verifier = verifier.store_2_verifier;
            const registrar_verifier = verifier.registrar_verifier;
            const admin_1_verifier = verifier.admin_1_verifier;

            const store_1_verifier_email = verifier.store_1_verifier_email;
            const store_2_verifier_email = verifier.store_2_verifier_email;
            const registrar_verifier_email = verifier.registrar_verifier_email;
            const admin_1_verifier_email = verifier.admin_1_verifier_email;

            const store_1_verifier_full_name = verifier.store_1_verifier_full_name;
            const store_2_verifier_full_name = verifier.store_2_verifier_full_name;
            const registrar_verifier_full_name = verifier.registrar_verifier_full_name;
            const admin_1_verifier_full_name = verifier.admin_1_verifier_full_name;
                // lets get the current user details
// "ref_name" : "Office_Equipment",
// "ref_name" : "motor_vehicle",

        User.findOne({_id:decrypted_user_id}, function(err, requester){
            let requester_department_id = requester.department[0]
            let requesters_full_name = requester.firstName + " " + requester.lastName
            console.log("this is the requester", requester_department_id)

            if(requester_department_id!=undefined){
                User.findOne({ $or: [{position:"registrar/ce", department:requester_department_id.toString()},{position:"director", department:requester_department_id.toString()}]}, 
                function(err, requester_director){
                const requesters_director = requester_director._id; 
                const user_fullname = requester_director.firstName + " " + requester_director.lastName
                let unit = req.body.request_unit;
                Store.findOne({_id:store_id}, function(err, store_item){
                    let previous_unit = store_item.unit;
                    let current_unit = req.body.request_unit;
                    
                    let final_unit = parseInt(previous_unit-current_unit)
                    Store.findByIdAndUpdate(store_id, {unit:final_unit})
                    .exec(function(err, updated_staff){
                        if(err){
                            console.log(err)
                        }else {
                            Product.findOne({_id:product_id}).populate('category').exec(function(err, prod){
                                let registrars_category1 = 22020301;
                                let registrars_category2 = 22020401;
                                let category_code = prod.category[0].category_code
                                const product_registrar = category_code==registrars_category1?true:category_code==registrars_category2?true:false
                                
                                BinCard.find({}, function(err, cards){                                                              
                                let binCard = new BinCard;
                                binCard.product = prod._id;
                                binCard.stock_balance = final_unit
                                binCard.sv_number = parseInt(cards.length+1);
                                binCard.quantity = current_unit;
                                binCard.requester = requesters_full_name;
                                binCard.save(function(err, card){
                                    if(err){
                                        console.log(err)
                                    }
                                    else {
                                        let request = new Request();
                                        request.store_1_verifier = store_1_verifier;
                                        request.store_2_verifier = store_2_verifier;
                                        request.registrar_verifier = registrar_verifier;
                                        request.registrar_confirm_must = product_registrar;
                                        request.admin_1_verifier = admin_1_verifier;                     
                                        request.dept_director = requesters_director==""?[]:requester_director
                                        request.requester = decrypted_user_id
                                        request.product = product_id;
                                        request.unit = unit;
                                        request.adjusted_unit = unit;
                                        request.srsiv_no = card.sv_number;
                                        request.save(function(err, request){
                                            if(err){
                                                console.log(err)
                                            }                          
                                            else {
                                                //notification starts here
                                                var storeOptions = {
                                                    from: 'onipetheoderic@gmail.com',
                                                    to: store_1_verifier_email,
                                                    subject: 'Requisition Request',
                                                    text: 'You have a Requisition request that needs your authentication!!, Login to Authenticate it'
                                                };
                                                var auditOptions = {
                                                    from: 'onipetheoderic@gmail.com',
                                                    to: store_2_verifier_email,
                                                    subject: 'Requisition Request',
                                                    text: 'You have a Requisition request that needs your authentication!!, Login to Authenticate it'
                                                };
                                                var registrarOptions = {
                                                    from: 'onipetheoderic@gmail.com',
                                                    to: registrar_verifier_email,
                                                    subject: 'Requisition Request',
                                                    text: 'You have a Requisition request that needs your authentication!!, Login to Authenticate it'
                                                };
                                                var adminOptions = {
                                                    from: 'onipetheoderic@gmail.com',
                                                    to: admin_1_verifier_email,
                                                    subject: 'Requisition Request',
                                                    text: 'You have a Requisition request that needs your authentication!!, Login to Authenticate it'
                                                };
                                                transporter.sendMail(storeOptions, function(error, info){
                                                    if (error) {
                                                        console.log(error);
                                                    } else {
                                                        console.log('Email sent: ' + info.response);
                                                    }
                                                });
                                                transporter.sendMail(auditOptions, function(error, info){
                                                    if (error) {
                                                        console.log(error);
                                                    } else {
                                                        console.log('Email sent: ' + info.response);
                                                    }
                                                });
                                                transporter.sendMail(adminOptions, function(error, info){
                                                    if (error) {
                                                        console.log(error);
                                                    } else {
                                                        console.log('Email sent: ' + info.response);
                                                    }
                                                });
                                                if(product_registrar){
                                                    transporter.sendMail(registrarOptions, function(error, info){
                                                        if (error) {
                                                            console.log(error);
                                                        } else {
                                                            console.log('Email sent: ' + info.response);
                                                        }
                                                    });  transporter.sendMail(registrarOptions, function(error, info){
                                                        if (error) {
                                                            console.log(error);
                                                        } else {
                                                            console.log('Email sent: ' + info.response);
                                                        }
                                                    });
                                                }
                                            
                                                let msg = `Requisition form has been sent to ${user_fullname}`
                                                home_redirector(req, res, msg)
                                                
                                            }
                                        })                                
                                    }
                                })
                            })                                
                            })
                        }
                    })
                })                
            })
        }
        else{
            Store.find({}).populate('product')
                .exec(function(err, products){
                    console.log("this are the products",products)
                    res.render('inventory/request_a_product', {layout:"layout/inventory", products:products, message:{error:"You dont belong to any Department, so you cannot request for a Product"}})
                })
            }            
        })
    })
}
}


exports.generate_bin_card_post = function(req, res){
    let start_date = req.body.start;
    let end_date = req.body.end;
    res.redirect(`/generate_bin_card_range/${start_date}/${end_date}`)
    
}

exports.generate_ledger_post = function(req, res){
    let start_date = req.body.start;
    let end_date = req.body.end;
    res.redirect(`/generate_ledger_range/${start_date}/${end_date}`)
    
}
exports.generate_bin_card_range = function(req, res){
    let start_date = req.params.start_date;
    let end_date = req.params.end_date;
    MultipleBinCard.find({ createdAt: { $gte: start_date, $lte: end_date} }).
      sort({ createdAt: 1 }).populate({
        path:'requester',			
        populate: { path: 'department', model: 'Department' }
    }).exec(function(err, cards){
        console.log(cards)
        res.render('inventory/generate_bin_card_range', {layout:"layout/table", cards:cards})
    })    
}

exports.generate_ledger_range = function(req, res){
    let start_date = req.params.start_date;
    let end_date = req.params.end_date;
    MultipleBinCard.find({ createdAt: { $gte: start_date, $lte: end_date} }).
      sort({ createdAt: 1 }).populate({
        path:'requester',			
        populate: { path: 'department', model: 'Department' }
    }).exec(function(err, cards){
        console.log(cards)
        res.render('inventory/generate_ledger_range', {layout:"layout/table", cards:cards})
    })    
}
exports.add_to_existing_post = function(req, res){
    //here we are dealing with product from the store
    console.log(req.body)
  
    Product.findOne({_id:req.body.product_id}, function(err, product){
        console.log(product)
        let new_product = new Product();
        new_product.parent_id = product._id;
        new_product.sub_category = product.sub_category;
        new_product.category = product.category;
        new_product.name = product.name;
        new_product.description = product.description;
        new_product.unit = parseInt(req.body.unit);
        new_product.price = parseInt(req.body.unit_price);
       
        new_product.save(function(err, saved_product){
            if(err){
                console.log(err);
            }
            else {
                res.redirect(`/confirmation/${saved_product.id}`)
            }
        })
    })
    // Store.findOne({_id:req.body.product_id}, function(err, store){
    //     console.log("product fromt eh store",store)
    //     let previous_unit = store.unit===undefined?0:store.unit;
    //     let new_unit = req.body.unit + previous_unit;
    //     let current_unit_price = req.body.unit_price;
        
        // Store.findByIdAndUpdate(req.body.product_id, {unit:new_unit})
        // .exec(function(err, updated_staff){
        //     if(err){
        //         console.log(err)
        //     }else {
        //         res.redirect(`/report_page/${req.body.product_id}`)
        //     }
        // })
    // });
}

exports.login = function(req, res){
    res.render('inventory/login', {layout:false})
}

exports.register_super = function(req, res){
    console.log("this is the route")
    res.render('inventory/register', {layout:false})
}
exports.logout = function(req, res){
    req.session.destroy();  
    res.redirect('/login')     
}

/*
router.route('/view_all_category')
    .get(InventoryController.view_all_category)

router.route('/view_all_department')
    .get(InventoryController.view_all_department)

router.route('/view_all_product')
    .get(InventoryController.view_all_product)
*/ 
exports.view_all_category = function(req, res){
    if(!req.session.hasOwnProperty("user_id")){
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
        let decrypted_user_id = decrypt(req.session.user_id, req, res)
        Category.find({}).exec(function(err, category){
            let objs = collectionInherit()
            res.render('inventory/view_all_category', {layout:"layout/inventory",objs, category:category})
        });
    }
}

exports.view_all_department = function(req, res){
    if(!req.session.hasOwnProperty("user_id")){
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
        let decrypted_user_id = decrypt(req.session.user_id, req, res)
      
    Department.find({}).exec(function(err, department){
        let objs = collectionInherit()
        console.log("all objjs",objs)
        res.render('inventory/view_all_department', {layout:"layout/inventory", objs, department:department})
    });
}
}

exports.view_all_product = function(req, res){
    // if(!req.session.hasOwnProperty("user_id")){
    //     console.log("its working", req.session.user_id)
    //     res.redirect('/login')
    // }
    // else if(req.session.hasOwnProperty("user_id")){
    // let decrypted_user_id = decrypt(req.session.user_id, req, res)
    //     Store.find({}).populate('product')
    //     .exec(function(err, products){
    //         console.log("this are the products",products)
    //         res.render('inventory/view_all_product', {layout:"layout/inventory", product:product})
    //     })
    // }
    if(!req.session.hasOwnProperty("user_id")){
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
        let decrypted_user_id = decrypt(req.session.user_id, req, res)
    Product.find({}).exec(function(err, product){
        res.render('inventory/view_all_product', {layout:"layout/inventory", product:product})
    });
}

}

exports.edit_product = function(req, res){
    if(!req.session.hasOwnProperty("user_id")){
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
       
   
        let decrypted_user_id = decrypt(req.session.user_id, req, res)
    Product.findOne({_id:req.params.id}).exec(function(err, product){
        res.render('inventory/edit_product', {layout:"layout/inventory", product:product})
    })
}
}



exports.view_all_users = function(req, res) {
    if(!req.session.hasOwnProperty("user_id")){
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
        let decrypted_user_id = decrypt(req.session.user_id, req, res)
        let role = decrypt(req.session.role, req, res)
        var isSuperAdmin = role=="superAdmin"?true:false;
        console.log("current_role",role);
    var categories = [];
    var departments = [];

    Department.find({}, function(err, department){
        Category.find({}, function(err, category){
            User.find({}).populate('department').exec(function(err, user){    
                Subcategory.find({}, function(err, sub_category){ 
                    console.log(sub_category)
                                  
                    for(var i in category){
                        let sub_categories = [];
                        for(var k in sub_category){                               
                            if(category[i]._id == sub_category[k].parent_id){
                                console.log("true")                                    
                                sub_categories.push({
                                    name:sub_category[k].name
                                })
                            }
                            
                        }
                        categories.push({name:category[i].name, ref_name:category[i].ref_name,  _id:category[i]._id, sub_category:sub_categories})
                        
                    }
                    for(var i in department){
                        departments.push(department[i])
                    }
                   
                    var users = [];
                        for(var i in user){
                            if(user[i].position!="superAdmin"){
                                users.push(user[i]);
                            }
                        }
        res.render('inventory/view_all_users', {layout: "layout/inventory", isSuperAdmin:isSuperAdmin, users:users, user:users, category:categories, sub_category:sub_category, department:department, data:{department:department}})
    })
});
})
})
    }
}
exports.delete_a_user_get = function(req, res) {
    if(!req.session.hasOwnProperty("user_id")){
        console.log("its working", req.session.user_id)
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
        User.findByIdAndRemove({_id:req.params.id},
            function(err, comps){
                if(err){
                    console.log(err)
                }
                else {
                    res.redirect('/view_all_users')
                }
        })
    }
}

exports.delete_a_product_get = function(req, res) {

    if(!req.session.hasOwnProperty("user_id")){
        console.log("its working", req.session.user_id)
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
        Product.findByIdAndRemove({_id:req.params.id},
            function(err, comps){
                if(err){
                    console.log(err)
                }
                else {
                    res.redirect('/view_all_product')
                }
        })
    }
}


exports.delete_a_department_get = function(req, res) {
    if(!req.session.hasOwnProperty("user_id")){
        console.log("its working", req.session.user_id)
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
        Department.findByIdAndRemove({_id:req.params.id},
            function(err, comps){
                if(err){
                    console.log(err)
                }
                else {
                    res.redirect('/view_all_department')
                }
        })
    }
}


exports.delete_a_category_get = function(req, res) {
    if(!req.session.hasOwnProperty("user_id")){
        console.log("its working", req.session.user_id)
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
        Category.findByIdAndRemove({_id:req.params.id},
            function(err, comps){
                if(err){
                    console.log(err)
                }
                else {
                    res.redirect('/view_all_category')
                }
        })
    }
}


exports.edit_category = function(req, res){
    Category.findOne({_id:req.params.id}).exec(function(err, category){
        res.render('inventory/edit_category', {layout:"layout/inventory", category:category})
    })
}

exports.edit_department = function(req, res){
    Department.findOne({_id:req.params.id}).exec(function(err, department){
        res.render('inventory/edit_department', {layout:"layout/inventory", department:department})
    })
}

exports.edit_product_post = function(req, res){
   
    Product.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        sub_category: req.body.sub_category,
        price: req.body.price,
        unit_price: req.body.price
    })
    .exec(function(err, updated_staff){
        if(err){
            console.log(err)
        }else {
            res.redirect(`/view_all_product`)
        }
    })
}

exports.edit_department_post = function(req, res){
    Department.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description: req.body.description,
    })
    .exec(function(err, updated_staff){
        if(err){
            console.log(err)
        }else {
            res.redirect(`/view_all_department`)
        }
    })
}

exports.edit_category_post = function(req, res){
    Category.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        description: req.body.description,
        category_code: req.body.category_code
    })
    .exec(function(err, updated_staff){
        if(err){
            console.log(err)
        }else {
            res.redirect(`/view_all_category`)
        }
    })
}


exports.register_super_post = function(req, res) {
    User.findOne({email: req.body.email}, function(err, vals){
        if (vals==null) { 
            console.log("username not taken")
            let user = new User();
            user.email = req.body.email;
            user.firstName = req.body.first_name;
            user.lastName = req.body.last_name;
            user.passcode = req.body.password;
            user.userType = "superAdmin"; 
            user.position = "superAdmin";
            user.save(function(err, auth_details){       
            if(err){
                res.render('inventory/register', {layout: false, message:{error: "Error occured during user registration"} })
                return;
            } else {                    
                res.redirect('/login')
            }
        });
        }
        else if(vals !=null){            
            // console.log("username taken")
            res.render('inventory/register', {layout: false, message:{error: "Email has already been taken"} })
        }
     })   

}



exports.login_post = function(req, res) {
    let email = req.body.email;
    let password = req.body.password;
    User.findOne({email: new RegExp(`^${email}$`, 'i')}, function(err, user) {
       if(user == null)
        {
           res.render('inventory/login', {layout: false, message:{error: "Email not registered"}})
        }
        else{
            let user_id = user.id
            if (user.passcode == password){
                console.log('User connected');
                console.log(user.position)
                  let encId = encrypt(user_id)
                  let encRole = encrypt(user.position)
                  req.session.user_id = encId;
                  req.session.role = encRole;
                  res.redirect("/")
             
            }else{
                  res.render('inventory/login', {layout: false, message:{error: "invalid Email Address or password"}})
            }
        }

    })
}




exports.create_product_post = function(req, res){
    if(!req.session.hasOwnProperty("user_id")){
        console.log("its working", req.session.user_id)
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
    let decrypted_user_id = decrypt(req.session.user_id, req, res)
    
    console.log(req.body)
    let product = new Product();
    product.name = req.body.name;
    product.description = req.body.description;
    product.category = req.body.category;
    product.sub_category = req.body.sub_category;
    product.price = req.body.price;
    product.company_name = req.body.company_name;
    product.unit_price = req.body.price;
    product.unit = req.body.unit;
    product.source_fund = req.body.source_fund;
   //lets append it to existing product
    product.save(function(err, saved_product){
        if(err){
            console.log(err)
        }
        else {
            res.redirect(`/confirmation/${saved_product.id}`)
        }
    })
}
}

exports.create_subcategory = function(req, res){
console.log(req.body)
    let subcategory = new Subcategory();
    subcategory.name = req.body.sub_category_name;
    subcategory.description = req.body.sub_category_description;
    subcategory.parent_id = req.body.parent_id;
    subcategory.save(function(err, savedSub){
        if(err){
            console.log(err)
        }
        else {
            res.redirect("back")
        }
    })
}

// this is the outgoing aspect

exports.send_authentication_department = function(req, res){
    // we will need requester_id, product_id, quantity
}
