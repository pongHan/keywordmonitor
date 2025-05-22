const express = require('express');
const path = require('path');
const userAuth = require('../middlewares/auth.js').userAuth;

console.log("user router..")

const router = express.Router();

const accountController = require('../controllers/account.controller.js');

global.appRoot = process.cwd();

//router.get('/', accountController.getHome); //home page 
router.get('/test', accountController.getTest); //home page 

router.get('/main', accountController.getMain); //home page 

router.route('/login')
       .get(accountController.getLogin)// post request for login
       .post(accountController.postLogin)// post request for login

router.route('/createaccount')
       .get(accountController.getCreateAccount)    //get request for create account   
       .post(accountController.postCreateAccount); //post request for create account   

router.get('/verify', accountController.verify);

router.route('/findpassword')
       .get(accountController.getfindPassword) // get request for login
       .post(accountController.postfindPassword)// post request for login

router.route('/resetpassword')
       .get(accountController.getresetPassword) // get request for login
       .post(accountController.postresetPassword)// post request for login

router.get('/viewManual', accountController.viewManual);

router.get('/viewAgreement/:type', accountController.viewAgreement);

router.get('/logout', accountController.logout); //logout       

router.route('/viewUser')
       .get(userAuth, accountController.viewUser)

router.route('/selectUser/:mb_id')
       .get(userAuth, accountController.selectUser)

router.route('/updateUser')
       .patch(userAuth, accountController.updateUser) //post request 
router.route('/changepassword')
       .get(userAuth, accountController.getChangePassword)

router.route('/changepassword')
       .post(userAuth, accountController.postChangePassword)

router.route('/getSession')
       .get(userAuth, accountController.getSession)

router.post('/check-google-account', accountController.checkGoogleAccount);

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