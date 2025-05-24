//**********************************************/
//   @Project : keywordmonitor
//   @File : km_job_log.router.js
//   @Desc : Job log router
//   @Author : modeller77@gmail.com
//**********************************************/

const kmJobLogController = require("../controllers/km_job_log.controller.js");
const router = require("express").Router();
const userAuth = require('../middlewares/auth.js').userAuth;

router.route('/getLogs')
      .get(userAuth, kmJobLogController.getLogs)
      .post(userAuth, kmJobLogController.postLogs);

router.route('/getLog')
      .get(userAuth, kmJobLogController.getLog);

router.route('/viewLog')
      .post(userAuth, kmJobLogController.viewLog);

router.route('/addLog')
      .post(userAuth, kmJobLogController.addLog);

router.route('/updateLog')
      .patch(userAuth, kmJobLogController.updateLog);

router.route('/deleteLog/:log_id')
      .delete(userAuth, kmJobLogController.deleteLog);

router.route('/listLogs')
      .get(userAuth, kmJobLogController.listLogs);

router.route('/selectLog/:log_id')
      .get(userAuth, kmJobLogController.selectLog);

module.exports = router;
