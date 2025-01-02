const KPI = require('../models/KPImodel');
const Employee = require('../models/EmployeeModel');
const logger = require('../utils/Logger');

// Create KPI
const createKPI = async (req, res) => {
    try {
        const { employeeId, sections, notes, month } = req.body;

        // Verify that the current user is the supervisor of the employee
        const employee = await Employee.findById(employeeId).populate('supervisor');

        if (!employee || employee.supervisor.toString() !== req.user._id.toString()) {
            logger.error(`Unauthorized KPI creation attempt by: ${req.user._id}`);
            return res.status(403).json({ message: 'You do not have permission to rate this employee.' });
        }

        const kpi = new KPI({
            employee: employeeId,
            supervisor: req.user._id,
            sections, // Dynamic sections with parameters
            notes,
            month,
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

        const kpis = await KPI.find({ employee: employeeId })
            .populate('supervisor', 'name email');

        if (!kpis || kpis.length === 0) {
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
        const { sections, notes } = req.body;

        const kpi = await KPI.findById(id);

        if (!kpi) {
            logger.error(`KPI not found: ${id}`);
            return res.status(404).json({ message: 'KPI not found' });
        }

        // Only allow the supervisor who created the KPI to update it
        if (kpi.supervisor.toString() !== req.user._id.toString()) {
            logger.error(`Unauthorized KPI update attempt by: ${req.user._id}`);
            return res.status(403).json({ message: 'You do not have permission to update this KPI.' });
        }

        // Update sections dynamically
        if (sections) {
            for (const section in sections) {
                if (kpi.sections[section]) {
                    kpi.sections[section] = sections[section];
                }
            }
        }

        kpi.notes = notes ?? kpi.notes;

        await kpi.save();
        logger.log(`KPI updated: ${id}`);
        res.status(200).json(kpi);
    } catch (error) {
        logger.error(`Failed to update KPI: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// Delete a specific KPI record
const deleteKPI = async (req, res) => {
    try {
        const { id } = req.params;

        const kpi = await KPI.findById(id);

        if (!kpi) {
            logger.error(`KPI not found: ${id}`);
            return res.status(404).json({ message: 'KPI not found' });
        }

        // Only allow the supervisor who created the KPI to delete it
        if (kpi.supervisor.toString() !== req.user._id.toString()) {
            logger.error(`Unauthorized KPI deletion attempt by: ${req.user._id}`);
            return res.status(403).json({ message: 'You do not have permission to delete this KPI.' });
        }

        await kpi.remove();
        logger.log(`KPI deleted: ${id}`);
        res.status(200).json({ message: 'KPI deleted successfully.' });
    } catch (error) {
        logger.error(`Failed to delete KPI: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createKPI,
    getEmployeeKPIs,
    updateKPI,
    deleteKPI,
};
