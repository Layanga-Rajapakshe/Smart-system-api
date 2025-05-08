const KPI = require('../models/KPImodel');
const Employee = require('../models/EmployeeModel');
const KPIParameter = require('../models/KpiParametermodel');
const logger = require('../utils/Logger');

// Create KPI
const createKPI = async (req, res) => {
    try {
        const { employeeId, notes, month, comment } = req.body;
        const { parameterId } = '67dbb5bbe73f44694fb87ea1'; // KPI Parameter ID from request
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found.' });
        }

        // Fetch KPIParameter
        const kpiParameter = await KPIParameter.findById(parameterId);
        if (!kpiParameter) {
            return res.status(404).json({ message: 'KPI parameters not found.' });
        }

        // Extract values from request or initialize them
        const sectionValues = req.body.sections || {};
        
        // Process values and calculate total KPI
        let totalKpi = 0;
        const processedValues = []; // 2D array to store values for each section
        
        // Process each section
        const sectionNames = ['attitude', 'habits', 'skills', 'performance', 'knowledge'];
        
        for (const sectionName of sectionNames) {
            const sectionParameters = kpiParameter.sections[sectionName] || [];
            const sectionScores = [];
            
            // For each parameter in this section
            for (let i = 0; i < sectionParameters.length; i++) {
                const parameter = sectionParameters[i];
                // Get value from request or default to 0
                const value = sectionValues[sectionName]?.[i]?.value || 0;
                
                // Calculate weighted score
                const weightedScore = value * parameter.weight;
                totalKpi += weightedScore;
                
                // Store the value in our 2D array
                sectionScores.push(value);
            }
            
            processedValues.push(sectionScores);
        }

        // Create the KPI document with the calculated totalKpi
        const kpi = new KPI({
            employee: employeeId,
            supervisor: req.user._id,
            values: processedValues, // Store as 2D array as per schema
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
        const { notes, comment, sections } = req.body;

        const kpi = await KPI.findById(id);
        if (!kpi) {
            return res.status(404).json({ message: 'KPI not found' });
        }

        // Only allow the supervisor who created the KPI to update it
        if (kpi.supervisor.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to update this KPI' });
        }

        // Get the associated KPI parameters to get weights
        const parameterId = req.body.parameterId;
        const kpiParameter = await KPIParameter.findById(parameterId);
        if (!kpiParameter) {
            return res.status(404).json({ message: 'KPI parameters not found.' });
        }

        // If sections are provided, recalculate KPI
        if (sections) {
            let totalKpi = 0;
            const processedValues = []; // 2D array for values
            const sectionNames = ['attitude', 'habits', 'skills', 'performance', 'knowledge'];
            
            for (const sectionName of sectionNames) {
                const sectionParameters = kpiParameter.sections[sectionName] || [];
                const sectionScores = [];
                
                // For each parameter in this section
                for (let i = 0; i < sectionParameters.length; i++) {
                    const parameter = sectionParameters[i];
                    // Get value from request or keep existing value
                    const value = sections[sectionName]?.[i]?.value !== undefined 
                        ? sections[sectionName][i].value 
                        : (kpi.values[sectionNames.indexOf(sectionName)]?.[i] || 0);
                    
                    // Calculate weighted score
                    const weightedScore = value * parameter.weight;
                    totalKpi += weightedScore;
                    
                    // Store the value in our 2D array
                    sectionScores.push(value);
                }
                
                processedValues.push(sectionScores);
            }
            
            kpi.values = processedValues;
            kpi.Total_Kpi = totalKpi;
        }

        // Update other fields if provided
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