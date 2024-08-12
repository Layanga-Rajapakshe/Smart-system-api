const express = require('express');
const router = express.Router();
const { login, logout } = require('../controllers/AuthController');
const authenticateUser = require('../middleware/AuthenticateUser');

router.post('/login', login);
router.post('/logout', authenticateUser, logout);

module.exports = router;
