
//**********************************************/
//  @Project :KeywordMonitor (메타봇)
//  @File :org.router.js
//  @Desc :기관/회사 router
//  @Author :modeller77@gmail.com
//**********************************************/

const orgController = require("../controllers/org.controller.js");
const router = require("express").Router();
const userAuth = require('../middlewares/auth.js').userAuth;

router.route('/getOrgs')
      .get(userAuth,orgController.getOrgs) //get request
      .post(userAuth,orgController.postOrgs) //post request

router.route('/getOrg')
      .get(userAuth,orgController.getOrg) //get request

var needFileUpload = false

if (needFileUpload) {
      // router with file upload
      // Folder WHERE uploaded files = public/uploads
      // Limit file size to 10 MB
      // file element name = myfile
      const multer = require('multer');
      const upload = multer({
            dest: 'public/uploads/',
            limits: { fileSize: 10 * 1024 * 1024 },
      });
      router.route('/addOrg')
            .post(userAuth, upload.single('myfile'),orgController.addOrg) //post request 
      router.route('/updateOrg')
            .patch(userAuth, upload.single('myfile'),orgController.updateOrg) //post request 
} else {
      // router without file upload
      router.route('/addOrg')
            .post(userAuth,orgController.addOrg) //post request 
      router.route('/updateOrg')
            .patch(userAuth,orgController.updateOrg) //post request 
}

router.route('/viewOrg')
      .post(userAuth,orgController.viewOrg) 
router.route('/deleteOrg/:org_id')
      .delete(userAuth,orgController.deleteOrg) 
router.route('/manageOrg')
      .get(userAuth, orgController.manageOrg) 
router.route('/listOrg')
      .get(userAuth, orgController.listOrg) 
router.route('/selectOrg/:org_id')
      .delete(userAuth,orgController.selectOrg) 

module.exports = router;
