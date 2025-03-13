const express = require('express');
const router = express.Router();
const { login, logout, updatePassword } = require('../controllers/AuthController');
const {authenticateUser} = require('../middleware/AuthenticateUser');

router.post('/login', login);
router.post('/logout', authenticateUser, logout);
router.post('/update-password', authenticateUser, updatePassword);

module.exports = router;
