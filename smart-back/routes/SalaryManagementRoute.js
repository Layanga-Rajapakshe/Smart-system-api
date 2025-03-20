const express = require('express');
const { showSalaryParameters,editSalaryParameters } = require('../controllers/SalaryManagementController');

const router = express.Router();

router.get('/show/:roleName',showSalaryParameters);
router.patch('/edit',editSalaryParameters);
module.exports = router;