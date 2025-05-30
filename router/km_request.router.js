const kmRequestController = require("../controllers/km_request.controller.js");
const router = require("express").Router();
const userAuth = require('../middlewares/auth.js').userAuth;

router.route('/getRequests')
      .get(userAuth, kmRequestController.getRequests)
      .post(userAuth, kmRequestController.postRequests)

router.route('/getRequest')
      .get(userAuth, kmRequestController.getRequest)
router.route('/viewRequest')
      .post(userAuth, kmRequestController.viewRequest)
router.route('/addRequest')
      .post(userAuth, kmRequestController.addRequest)
router.route('/updateRequest')
      .patch(userAuth, kmRequestController.updateRequest)
router.route('/deleteRequest/:req_id')
      .delete(userAuth, kmRequestController.deleteRequest)
router.route('/listRequests')
      .get(userAuth, kmRequestController.listRequests)
router.route('/selectRequest/:req_id')
      .get(userAuth, kmRequestController.selectRequest)

module.exports = router;