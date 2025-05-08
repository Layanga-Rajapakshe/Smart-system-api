const KPI = require('../models/KPImodel');
const Employee = require('../models/EmployeeModel');
const KPIParameter = require('../models/KpiParametermodel');
const logger = require('../utils/Logger');

// Create KPI
const createKPI = async (req, res) => {
    try {
        const { employeeId, notes, month, comment, parameterId, Total_Kpi } = req.body;

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        const kpiParameter = await KPIParameter.findById(parameterId);
        if (!kpiParameter) {
            return res.status(404).json({ message: 'KPI parameters not found.' });
        }

        const kpi = new KPI({
            employee: employeeId,
            parameterId,
            Total_Kpi,
            notes,
            month,
            comment,
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
            .populate('parameterId')
            .populate('employee', 'name employeeId');

        if (!kpis.length) {
            return res.status(404).json({ message: `No KPIs found for employee ${employeeId}` });
        }

        res.status(200).json(kpis);
    } catch (error) {
        logger.error(`Failed to fetch KPIs: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// Get a specific KPI by ID
const getKPIById = async (req, res) => {
    try {
        const { id } = req.params;

        const kpi = await KPI.findById(id)
            .populate('employee', 'name employeeId')
            .populate('parameterId');
            
        if (!kpi) {
            return res.status(404).json({ message: 'KPI not found' });
        }

        res.status(200).json(kpi);
    } catch (error) {
        logger.error(`Failed to fetch KPI: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// Update a specific KPI record
const updateKPI = async (req, res) => {
    try {
        const { id } = req.params;
        const { notes, comment, Total_Kpi, parameterId } = req.body;

        const kpi = await KPI.findById(id);
        if (!kpi) {
            return res.status(404).json({ message: 'KPI not found' });
        }

        // Update fields if provided
        if (notes !== undefined) kpi.notes = notes;
        if (comment !== undefined) kpi.comment = comment;
        if (Total_Kpi !== undefined) kpi.Total_Kpi = Total_Kpi;
        if (parameterId !== undefined) kpi.parameterId = parameterId;

        await kpi.save();
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
            return res.status(404).json({ message: 'KPI not found' });
        }

        await kpi.deleteOne();
        res.status(200).json({ message: 'KPI deleted successfully.' });
    } catch (error) {
        logger.error(`Failed to delete KPI: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

// Get all KPIs (admin function)
const getAllKPIs = async (req, res) => {
    try {
        const kpis = await KPI.find()
            .populate('employee', 'name employeeId')
            .populate('parameterId')
            .sort('-createdAt');

        res.status(200).json(kpis);
    } catch (error) {
        logger.error(`Failed to fetch all KPIs: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createKPI,
    getEmployeeKPIs,
    getKPIById,
    updateKPI,
    deleteKPI,
    getAllKPIs
};