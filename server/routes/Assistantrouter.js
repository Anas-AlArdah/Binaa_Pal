const express = require('express');
const router = express.Router();
const { chat } = require('../controllers/Assistantcontroller');


router.post('/', chat);

module.exports = router;

