const KPI = require('../models/KPImodel');
const Employee = require('../models/EmployeeModel');
const KPIParameter = require('../models/KpiParametermodel');
const logger = require('../utils/Logger');

// Create KPI
const createKPI = async (req, res) => {
    try {
        const { employeeId, notes, month, comment, parameterId } = req.body;

        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        const kpiParameter = await KPIParameter.findById(parameterId);
        if (!kpiParameter) {
            return res.status(404).json({ message: 'KPI parameters not found.' });
        }

        const sectionValues = req.body.sections || {};
        let totalKpi = 0;
        const processedValues = [];

        const sectionNames = ['attitude', 'habits', 'skills', 'performance', 'knowledge'];

        for (const sectionName of sectionNames) {
            const sectionParameters = kpiParameter.sections[sectionName] || [];
            const sectionScores = [];

            for (let i = 0; i < sectionParameters.length; i++) {
                const parameter = sectionParameters[i];
                const value = sectionValues[sectionName]?.[i]?.value || 0;
                const weightedScore = value * parameter.weight;
                totalKpi += weightedScore;
                sectionScores.push(value);
            }

            processedValues.push(sectionScores);
        }

        const kpi = new KPI({
            employee: employeeId,
            values: processedValues,
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

        const kpis = await KPI.find({ employee: employeeId });

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
        const { notes, comment, sections, parameterId } = req.body;

        const kpi = await KPI.findById(id);
        if (!kpi) {
            return res.status(404).json({ message: 'KPI not found' });
        }

        const kpiParameter = await KPIParameter.findById(parameterId);
        if (!kpiParameter) {
            return res.status(404).json({ message: 'KPI parameters not found.' });
        }

        if (sections) {
            let totalKpi = 0;
            const processedValues = [];
            const sectionNames = ['attitude', 'habits', 'skills', 'performance', 'knowledge'];

            for (const sectionName of sectionNames) {
                const sectionParameters = kpiParameter.sections[sectionName] || [];
                const sectionScores = [];

                for (let i = 0; i < sectionParameters.length; i++) {
                    const parameter = sectionParameters[i];
                    const value = sections[sectionName]?.[i]?.value !== undefined
                        ? sections[sectionName][i].value
                        : (kpi.values[sectionNames.indexOf(sectionName)]?.[i] || 0);

                    const weightedScore = value * parameter.weight;
                    totalKpi += weightedScore;
                    sectionScores.push(value);
                }

                processedValues.push(sectionScores);
            }

            kpi.values = processedValues;
            kpi.Total_Kpi = totalKpi;
        }

        if (notes !== undefined) kpi.notes = notes;
        if (comment !== undefined) kpi.comment = comment;

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

module.exports = {
    createKPI,
    getEmployeeKPIs,
    updateKPI,
    deleteKPI,
};
