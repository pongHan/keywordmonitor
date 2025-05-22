const kmDetectController = require("../controllers/km_detect.controller.js");
const router = require("express").Router();
const userAuth = require('../middlewares/auth.js').userAuth;

router.route('/getDetects')
      .get(userAuth, kmDetectController.getDetects)
      .post(userAuth, kmDetectController.postDetects)

router.route('/getDetect')
      .get(userAuth, kmDetectController.getDetect)
router.route('/viewDetect')
      .post(userAuth, kmDetectController.viewDetect)
router.route('/deleteDetect/:detect_id')
      .delete(userAuth, kmDetectController.deleteDetect)
router.route('/listDetects')
      .get(userAuth, kmDetectController.listDetects)
router.route('/selectDetect/:detect_id')
      .get(userAuth, kmDetectController.selectDetect)
router.route('/deleteDetectAll')
      .delete(userAuth, kmDetectController.deleteDetectAll)
router.route('/screenshot/:detect_id')
      .get(userAuth, kmDetectController.screenshotDetection);

module.exports = router;