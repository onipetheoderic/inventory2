import express from 'express';


import InventoryController from '../controllers/inventory';
import AuthDashboard from '../controllers/auth';
import Department from '../models/Department/department';

const router = express.Router();



router.route('/')
    .get(InventoryController.home)

router.route('/create_department')
    .get(InventoryController.create_department)
    .post(InventoryController.create_department_post)

router.route('/confirmation/:id')
    .get(InventoryController.confirmation)
    .post(InventoryController.confirmation_post)

router.route('/create_subcategory')
    .post(InventoryController.create_subcategory)

router.route('/product_options')
    .get(InventoryController.product_options)

router.route('/add_to_existing')
    .get(InventoryController.add_to_existing)
    .post(InventoryController.add_to_existing_post)

router.route('/request_product')
    .get(InventoryController.request_product)

router.route('/incomplete_authentication')
    .get(InventoryController.incomplete_authentication)
//generate_report_form

router.route('/generate_report_form/:id')
    .post(InventoryController.generate_report_form)

router.route('/report_page/:id')
    .get(InventoryController.report_page)

router.route('/create_category')
    .get(InventoryController.create_category)
    .post(InventoryController.create_category_post)

router.route('/create_user')
    .get(InventoryController.create_user)
    .post(InventoryController.create_user_post)
    
router.route('/create_product')
    .get(InventoryController.create_product)
    .post(InventoryController.create_product_post)


export default router;