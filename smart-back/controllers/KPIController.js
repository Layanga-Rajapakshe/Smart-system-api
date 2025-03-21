const KPI = require('../models/KPImodel');
const Employee = require('../models/EmployeeModel');
const KPIParameter = require('../models/KPIParametermodel');
const logger = require('../utils/Logger');

// Create KPI
const createKPI = async (req, res) => {
    try {
        const { employeeId, notes, month, comment, sectionId } = req.body;

        // Verify that the current user is the supervisor of the employee
        const employee = await Employee.findById(employeeId).populate('supervisor');

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        // Fetch KPIParameter
        const kpiParameter = await KPIParameter.findById(sectionId);
        if (!kpiParameter) {
            return res.status(404).json({ message: 'KPI parameters not found.' });
        }

        let totalKpi = 0; // To calculate the total KPI score

        // Loop through each section and calculate the value based on weight
        for (const sectionName in kpiParameter.sections) {
            const sectionValues = kpiParameter.sections[sectionName];
            
            // Loop through each parameter in the section
            sectionValues.forEach(param => {
                if (param.value && param.weight) {
                    // Multiply the parameter value by its weight and add to the total KPI score
                    totalKpi += param.value * param.weight;
                }
            });
        }

        // Create the KPI document with the calculated totalKpi
        const kpi = new KPI({
            employee: employeeId,
            supervisor: req.user._id,
            section: kpiParameter._id, // Reference to the KPIParameter
            values: kpiParameter.sections, // You can store the individual sections if necessary
            Total_Kpi: totalKpi,
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
            .populate('supervisor', 'name email');

        if (!kpis.length) {
            return res.status(404).json({ message: `No KPIs found for employee ${employeeId}` });
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
            return res.status(404).json({ message: 'KPI not found' });
        }

        // Only allow the supervisor who created the KPI to update it
        if (kpi.supervisor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to update this KPI' });
        }

        let totalKpi = 0;

        // Update values based on sections if provided
        if (sections) {
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                section.forEach(param => {
                    if (param.value && param.weight) {
                        // Multiply the parameter value by its weight and add to the total KPI score
                        totalKpi += param.value * param.weight;
                    }
                });
            }
        }

        kpi.Total_Kpi = totalKpi; // Set the updated total KPI
        kpi.notes = notes ?? kpi.notes;

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

        // Only allow the supervisor who created the KPI to delete it
        if (kpi.supervisor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to delete this KPI' });
        }

        await kpi.deleteOne();
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
