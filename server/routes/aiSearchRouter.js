const express = require('express');
const router = express.Router();
const { aiSearch } = require('../controllers/aiSearchController');
router.get('/', aiSearch);

module.exports = router;