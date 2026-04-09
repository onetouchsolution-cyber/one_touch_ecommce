const express = require('express');
const router = express.Router();
const { searchGlobal } = require('../controllers/searchController');

router.get('/', searchGlobal);

module.exports = router;
