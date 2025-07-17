const express = require('express');
const router = express.Router();
const { parseSentence } = require('../controllers/aiController');

router.post('/parse-ai', parseSentence);

module.exports = router; 