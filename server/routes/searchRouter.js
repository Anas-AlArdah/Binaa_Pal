const express = require('express');
const router = express.Router();
const { searchWorkers } = require('../controllers/searchController');
router.get('/', searchWorkers);

module.exports = router;
