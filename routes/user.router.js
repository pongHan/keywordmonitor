const express = require('express');
const path = require('path');
const userAuth = require('../middlewares/auth.js').userAuth;

console.log("user router..")

const router = express.Router();

const userController = require('../controllers/user.controller.js');

global.appRoot = process.cwd();

router.get('/', userController.getHome); //home page 
router.get('/test', userController.getTest); //home page 

router.get('/main', userController.getMain); //home page 

router.route('/login')
       .get(userController.getLogin)// post request for login
       .post(userController.postLogin)// post request for login

router.route('/createaccount')
       .get(userController.getCreateAccount)    //get request for create account   
       .post(userController.postCreateAccount); //post request for create account   

router.get('/verify', userController.verify);

router.route('/findpassword')
       .get(userController.getfindPassword) // get request for login
       .post(userController.postfindPassword)// post request for login

router.route('/resetpassword')
       .get(userController.getresetPassword) // get request for login
       .post(userController.postresetPassword)// post request for login

router.get('/viewManual', userController.viewManual);

router.get('/viewAgreement/:type', userController.viewAgreement);

router.get('/logout', userController.logout); //logout       

router.route('/viewUser')
       .get(userAuth, userController.viewUser)

router.route('/selectUser/:mb_id')
       .get(userAuth, userController.selectUser)

router.route('/updateUser')
       .patch(userAuth, userController.updateUser) //post request 

router.route('/changepassword')
       .get(userAuth, userController.getChangePassword)

router.route('/changepassword')
       .post(userAuth, userController.postChangePassword)

router.route('/getSession')
       .get(userAuth, userController.getSession)

/*
const UploadController = require('../../src/user/upload.controller.js');
router.get('/fileUpload', UploadController.getFileUpload);

//file upload
const multer = require('multer');
const upload = multer({
       dest: 'public/uploads/', // Folder WHERE uploaded files will be stored
       limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10 MB
});
router.post('/upload', upload.single('myfile'), UploadController.uploadFile);
*/

module.exports = router;