const express = require('express');
const { showSalaryParameters,editSalaryParameters } = require('../controllers/SalaryManagementController');

const router = express.Router();

router.get('/show',showSalaryParameters);
router.patch('/edit',editSalaryParameters);
module.exports = router;