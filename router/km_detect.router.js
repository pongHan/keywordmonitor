const express = require('express');
const router = express.Router();
const kmDetectDataController = require('../controllers/km_detect.controller');

// CRUD Routes
router.post('/', kmDetectDataController.create);
router.get('/', kmDetectDataController.getAll);
router.get('/:id', kmDetectDataController.getById);
router.put('/:id', kmDetectDataController.update);
router.delete('/:id', kmDetectDataController.delete);

module.exports = router;