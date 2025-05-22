const express = require('express');
const path = require('path');
const userAuth = require('../middlewares/auth.js').userAuth;

console.log("user router..")

const router = express.Router();

const userController = require('../controllers/user.controller.js');

global.appRoot = process.cwd();


//router.route('/viewUser').get(userAuth, userController.viewUser)

router.route('/selectUser/:mb_id')
       .get(userAuth, userController.selectUser)

router.route('/updateUser')
       .patch(userAuth, userController.updateUser) //post request 



module.exports = router;