const kmFinderRunController = require("../controllers/km_finder_run.controller.js");
const router = require("express").Router();
const userAuth = require('../middlewares/auth.js').userAuth;

router.route('/getRuns')
      .get(userAuth, kmFinderRunController.getRuns)
      .post(userAuth, kmFinderRunController.postRuns);

router.route('/getRun')
      .get(userAuth, kmFinderRunController.getRun);

router.route('/viewRun')
      .post(userAuth, kmFinderRunController.viewRun);

router.route('/addRun')
      .post(userAuth, kmFinderRunController.addRun);

router.route('/updateRun')
      .patch(userAuth, kmFinderRunController.updateRun);

router.route('/deleteRun/:run_id')
      .delete(userAuth, kmFinderRunController.deleteRun);

router.route('/listRuns')
      .get(userAuth, kmFinderRunController.listRuns);

router.route('/selectRun/:run_id')
      .get(userAuth, kmFinderRunController.selectRun);

module.exports = router;