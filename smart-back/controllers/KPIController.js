const KPI = require('../models/KPImodel');
const Employee = require('../models/EmployeeModel');
const logger = require('../utils/Logger');

// Create KPI
const createKPI = async (req, res) => {
    try {
        const { employeeId, attitude, habits, skills, performance, knowledge, notes } = req.body;
        
        // Verify that the current user is the supervisor of the employee
        const employee = await Employee.findById(employeeId).populate('supervisor');
        
        if (!employee || employee.supervisor.toString() !== req.user._id.toString()) {
            logger.error(`Unauthorized KPI creation attempt by: ${req.user._id}`);
            return res.status(403).json({ message: 'You do not have permission to rate this employee.' });
        }

        const kpi = new KPI({
            employee: employeeId,
            supervisor: req.user._id,
            attitude,
            habits,
            skills,
            performance,
            knowledge,
            notes
        });

        await kpi.save();
        logger.log(`KPI created for employee: ${employeeId}`);
        res.status(201).json(kpi);
    } catch (error) {
        logger.error(`Failed to create KPI: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// Get all KPIs for an employee
const getEmployeeKPIs = async (req, res) => {
    try {
        const { employeeId } = req.params;
        const kpis = await KPI.find({ employee: employeeId }).populate('supervisor', 'name email');
        
        if (!kpis) {
            logger.error(`KPIs not found for employee: ${employeeId}`);
            return res.status(404).json({ message: `KPIs not found for employee with id ${employeeId}` });
        }

        res.status(200).json(kpis);
    } catch (error) {
        logger.error(`Failed to fetch KPIs: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// Update a specific KPI record
const updateKPI = async (req, res) => {
    try {
        const { id } = req.params;
        const { attitude, habits, skills, performance, knowledge, notes } = req.body;

        const kpi = await KPI.findById(id);
        
        if (!kpi) {
            return res.status(404).json({ message: 'KPI not found' });
        }

        // Only allow the supervisor who created the KPI to update it
        if (kpi.supervisor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to update this KPI.' });
        }

        kpi.attitude = attitude ?? kpi.attitude;
        kpi.habits = habits ?? kpi.habits;
        kpi.skills = skills ?? kpi.skills;
        kpi.performance = performance ?? kpi.performance;
        kpi.knowledge = knowledge ?? kpi.knowledge;
        kpi.notes = notes ?? kpi.notes;

        await kpi.save();
        logger.log(`KPI updated: ${id}`);
        res.status(200).json(kpi);
    } catch (error) {
        logger.error(`Failed to update KPI: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createKPI,
    getEmployeeKPIs,
    updateKPI
};
