const express = require('express');
const router = express.Router();
const craftController = require('../controllers/craftcontrollers');

router.get('/', craftController.getAllCrafts);
router.get('/:slug/workers', craftController.getWorkersByCraft);
router.get('/:slug', craftController.getCraftBySlug);

module.exports = router;
