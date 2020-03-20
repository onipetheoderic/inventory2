import Department from '../../models/Department/department';
import User from '../../models/User/user';
import Category from '../../models/Category/category';
import {encrypt, decrypt, BASEURL} from '../../utility/encryptor'
import Product from '../../models/Product/product';
import Subcategory from '../../models/Subcategory/subcategory';
import Store from '../../models/Store/store';
import Request from '../../models/Request/request';

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
/*
email: 'store_director@gmail.com',
firstName: 'store_director',
logo: '1584679118784elec.jpg',
passcode: '123456',
*/ 
exports.home = function(req, res){
    if(!req.session.hasOwnProperty("user_id")){
        console.log("its working", req.session.user_id)
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
    let decrypted_user_id = decrypt(req.session.user_id, req, res)
    let decrypted_user_role = decrypt(req.session.role, req, res)
    
        if(decrypted_user_role=="director" || decrypted_user_role=="registrar"){
            console.log("its the directore")
            User.findOne({_id:decrypted_user_id}, function(err, user){
                Department.findOne({_id:user.department}, function(err, department_user){
                    if(department_user.ref_name!="admin_department"){
                        Request.find({director:decrypted_user_id, signed:false})
                        .populate("director")
                        .populate("requester")
                        .populate("product")
                        .exec(function(err, requests){
                            console.log("this are the requests",requests)
                                
                            Department.find({}, function(err, department){
                                Category.find({}, function(err, category){                
                                    User.find({}, function(err, users){
                                        User.findOne({_id:decrypted_user_id}, function(err, user){                           
                                        Product.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(function(err, product) { 
                                            res.render('inventory/home', {layout: "layout/inventory", requests:requests, user:user, product:product, users:users, category:category, department:department, data:{category:category, department:department}})
                                        })
                                    })
                                    });
                                })
                            })
                        })
                    }
                    else if(department_user.ref_name=="admin_department"){
                        if(user.position=="director"){
                            Request.find({admin_director:decrypted_user_id, signed:true, admin_director_verified:false})
                            .populate("director")
                            .populate("requester")
                            .populate("product")
                            .exec(function(err, requests){
                                console.log("this are the requests",requests)
                                    
                                Department.find({}, function(err, department){
                                    Category.find({}, function(err, category){                
                                        User.find({}, function(err, users){
                                            User.findOne({_id:decrypted_user_id}, function(err, user){                           
                                            Product.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(function(err, product) { 
                                                res.render('inventory/home', {layout: "layout/inventory", requests:requests, user:user, product:product, users:users, category:category, department:department, data:{category:category, department:department}})
                                            })
                                        })
                                        });
                                    })
                                })
                            })
                        }
                        else if(user.position=="registrar"){
                            Request.find({admin_registrar:decrypted_user_id, signed:true, admin_director_verified:false, admin_registrar_verified:false})
                            .populate("director")
                            .populate("requester")
                            .populate("product")
                            .exec(function(err, requests){
                                console.log("this are the requests",requests)
                                    
                                Department.find({}, function(err, department){
                                    Category.find({}, function(err, category){                
                                        User.find({}, function(err, users){
                                            User.findOne({_id:decrypted_user_id}, function(err, user){                           
                                            Product.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(function(err, product) { 
                                                res.render('inventory/home', {layout: "layout/inventory", requests:requests, user:user, product:product, users:users, category:category, department:department, data:{category:category, department:department}})
                                            })
                                        })
                                        });
                                    })
                                })
                            })
                        }
                       
                    }
                })
            
            })
        }
        
        
        else {
            Department.find({}, function(err, department){
                Category.find({}, function(err, category){                
                    User.find({}, function(err, users){
                        
                        Product.findOne().sort({ field: 'asc', _id: -1 }).limit(1).exec(function(err, product) { 
                            res.render('inventory/home', {layout: "layout/inventory", product:product, users:users, category:category, department:department, data:{category:category, department:department}})
                        })
                    });
                })
            })
        }
        
    }
}


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
exports.report_page = function(req, res){
    console.log("this is the report page", req.params.id)
    Product.findOne({_id:req.params.id}, function(err, product){
        console.log(product.unit)
        res.render('inventory/report_page', {          
            layout: "layout/table", product:product, value:product.price*product.unit
            }
        )
    })
}

exports.generate_report_form = function(req, res){
    console.log(req.params.id)
    Product.findOne({_id:req.params.id}, function(err, product){
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
                    Product.findByIdAndUpdate(req.params.id, {stored:true})
                    .exec(function(err, updated_staff){
                        if(err){
                            console.log(err)
                        }else {
                            res.redirect(`/report_page/${req.params.id}`)
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
                    res.redirect(`/report_page/${req.params.id}`);
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
                    if(department.ref_name=="user_department"){
                        Product.findByIdAndUpdate(req.params.id, {user_verified:true})
                        .exec(function(err, updated_staff){
                            if(err){
                                console.log(err)
                            }else {
                                res.redirect(`/confirmation/${req.params.id}`)
                            }
                        })
                    }
                    else{
                        let msg = "You dont belong to the user department"
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
    let incoming_file_name = filePlacerAndNamer(req, res, req.files.logo);
    let department = new Department();
    department.name = req.body.name;
    department.description = req.body.description;
    department.logo = incoming_file_name;
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
    let incoming_file_name = filePlacerAndNamer(req, res, req.files.logo);
    let category = new Category();
    category.name = req.body.name;
    category.description = req.body.description;
    category.logo = incoming_file_name;
    category.ref_name = req.body.ref_name;
    category.save(function(err, saved_category){
        if(err){
            console.log(err)
        }
        else {
            res.redirect('/')
        }
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

function user_redirector(req, res, msg){
    Department.find({}, function(err, department){
        Category.find({}, function(err, category){
            User.find({}, function(err, users){    
        res.render('inventory/create_user', {layout: "layout/inventory", message:{error:msg}, users:users, category:category, department:department, data:{department:department}})
    })
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


exports.create_user_post = function(req, res){
    User.findOne({email:req.body.email}, function(err, user){
        console.log(user);
        if(user==null){
            let incoming_file_name = filePlacerAndNamer(req, res, req.files.logo);
 
            let user = new User();
            user.email = req.body.email;
            user.firstName = req.body.firstName;
            user.logo = incoming_file_name;
            user.passcode = req.body.passcode;
            user.position = req.body.position;
            user.department = req.body.department;
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
            res.render('inventory/request_a_product', {layout:"layout/inventory", products:products})
        })
    }
}

exports.verify_request = function(req, res){
    if(!req.session.hasOwnProperty("user_id")){
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
        let decrypted_user_id = decrypt(req.session.user_id, req, res)
        let request_id = req.body.request_id;
        let passcode= req.body.passcode;
        User.findOne({_id:decrypted_user_id, passcode:passcode})
        .exec(function(err, user){
            if(user!=null){
                console.log("this user is legit")
                Department.findOne({_id: user.department})
                .exec(function(err, department){  
                    if(department.ref_name!="admin_department"){
                        Request.findByIdAndUpdate(request_id, {signed:true})
                        .exec(function(err, updated_store){
                            if(err){
                                console.log(err)
                            }else {
                                res.redirect(`/`)
                            }
                        })
                    }
                    else {
                        if(user.position=="registrar"){
                            Request.findByIdAndUpdate(request_id, {admin_registrar_verified:true})
                            .exec(function(err, updated_store){
                                if(err){
                                    console.log(err)
                                }else {

                                    res.redirect(`/`)
                                }
                            })
                        }
                        else if(user.position=="director"){
                            Request.findByIdAndUpdate(request_id, {admin_director_verified:true})
                            .exec(function(err, updated_store){
                                if(err){
                                    console.log(err)
                                }else {
                                    res.redirect(`/`)
                                }
                            })
                        }
                    }      
                   
                })

            }
            else{
                console.log("the user is not legit")
            }
        });

    }
}

exports.view_requests = function(req, res){
    Request.find({signed:true})
    .populate('product')
    .populate('requester')
    .populate('director')
    .exec(function(err, requests){
        let all_requests = [];
        for(var i in requests){
            if(requests[i].admin_registrar_verified == true || requests[i].admin_director_verified == true){
                all_requests.push(requests[i])
            }
        }
        res.render('inventory/view_requests', {layout:"layout/inventory", data:{all_requests:all_requests}})
    })
}


exports.request_product_post = function(req, res){
    if(!req.session.hasOwnProperty("user_id")){
        res.redirect('/login')
    }
    else if(req.session.hasOwnProperty("user_id")){
        let decrypted_user_id = decrypt(req.session.user_id, req, res)
        let decrypted_department = decrypt(req.session.role, req, res)
        let store_id = req.body.store_id;
        // console.log(decrypted_department, decrypted_user_id, req.body.request_unit)
        User.findOne({_id:decrypted_user_id}, function(err, user){
           
                User.find({position:"director", department:user.department}, function(err, user_director){
                   Department.findOne({ref_name : "admin_department"}, function(err, admin_department){
                       if(err){
                           console.log(err)
                       }
                       else{
                        //    After the confirmation Requisition will be sent to the Registrar/Director Admin for Approval
                           let admin_department_id = admin_department.id
                           console.log("req,", admin_department_id)
                           //we get the director
                            User.findOne({department:admin_department_id, position:"director"})
                            .exec(function(err, user_admin_director){
                                User.findOne({department:admin_department_id, position: "registrar"})
                                .exec(function(err, user_admin_registrar){
                                    console.log("director",user_admin_director)
                                    console.log("registrar",user_admin_registrar)
                                    console.log(user_director[0])
                                    let srsiv_no = rn(options)
                                    let unit = req.body.request_unit;
                                    let product_id = req.body.product_id;
                                    let director_fullname = user_director[0].firstName + " " + user_director[0].lastName
                                    let request = new Request();
                                        request.director = user_director[0].id;
                                        request.requester = decrypted_user_id;
                                        request.admin_director = user_admin_director.id;
                                        request.admin_registrar = user_admin_registrar.id;
                                        request.product = product_id;
                                        request.unit = unit;
                                        request.srsiv_no = srsiv_no;
                                        request.save(function(err, request){
                                            if(err){
                                                console.log(err)
                                            }
                                            else {
                                                //hhh
                                                Store.findOne({_id:store_id}, function(err, store_item){
                                                    let previous_unit = store_item.unit;
                                                    let current_unit = req.body.unit
                                                    let final_unit = parseInt(previous_unit-current_unit)
                                                    Store.findByIdAndUpdate(store_id, {unit:final_unit})
                                                    .exec(function(err, updated_staff){
                                                        if(err){
                                                            console.log(err)
                                                        }else {
                                                            let msg = `Requisition form has been sent to ${director_fullname}`
                                                            home_redirector(req, res, msg)
                                                        }
                                                    })
                                                })
                                                
                                                
                                            }
                                        })                        
                                        console.log(user_director[0])
                                    })
                                })
                            }
                        })
                    })
            // })
        });
        
    }
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
        new_product.logo = product.logo
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
    User.findOne({email: email}, function(err, user) {
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
                  res.render('inventory/login', {layout: false, message:{error: "invalid Phone Number or password"}})
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
    let incoming_file_name = filePlacerAndNamer(req, res, req.files.logo);
    console.log(req.body)
    let product = new Product();
    product.name = req.body.name;
    product.description = req.body.description;
    product.logo = incoming_file_name;
    product.category = req.body.category;
    product.sub_category = req.body.sub_category;
    product.price = req.body.price;
    product.unit_price = req.body.price;
    product.unit = req.body.unit;
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
