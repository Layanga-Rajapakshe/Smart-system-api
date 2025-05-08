const KPIParameter = require('../models/KpiParametermodel');

// Add KPI parameters
const createKPIParameter = async (req, res) => {
    try {
        // Extract the sections from the request body
        const { sections } = req.body;

        // Validation: Ensure sections object exists
        if (!sections) {
            return res.status(400).json({ error: "Sections object is required." });
        }

        // Define required sections
        const requiredSections = ['attitude', 'habits', 'skills', 'performance', 'knowledge'];

        // Validate each section
        for (const section of requiredSections) {
            if (!sections[section]) {
                return res.status(400).json({ error: `Section '${section}' is required.` });
            }

            // Validate each parameter in the section
            for (const item of sections[section]) {
                if (!item.parameter || item.weight === undefined ) {
                    return res.status(400).json({
                        error: `Each item in the '${section}' section must include 'parameter', 'weight', and 'value'.`
                    });
                }
                
                if (item.value < 0 || item.value > 10) {
                    return res.status(400).json({
                        error: `Value in '${section}' section must be between 0 and 10.`
                    });
                }
            }
        }

        // Create a new KPI Parameter document
        const kpiParameter = new KPIParameter({ sections });

        // Save the document in the database
        await kpiParameter.save();

        // Return the created document as the response
        res.status(201).json(kpiParameter);
    } catch (error) {
        // Handle any server error
        res.status(500).json({ error: error.message });
    }
};

const addParameterToSection = async (req, res) => {
    try {
        const { id, sectionName } = req.params;
        const { parameter, weight } = req.body;

        // Validate section
        const validSections = ['attitude', 'habits', 'skills', 'performance', 'knowledge'];
        if (!validSections.includes(sectionName)) {
            return res.status(400).json({ error: "Invalid section name." });
        }

        // Validate data
        if (!parameter || weight === undefined) {
            return res.status(400).json({ error: "Both 'parameter' and 'weight' are required." });
        }
        if (weight < 0 || weight > 1) {
            return res.status(400).json({ error: "Weight must be between 0 and 1." });
        }

        // Find the KPI document
        const kpi = await KPIParameter.findById(id);
        if (!kpi) {
            return res.status(404).json({ error: "KPI document not found." });
        }

        // Check if sections object and the specific section array exist
        if (!kpi.sections) {
            kpi.sections = {};
        }
        
        if (!kpi.sections[sectionName]) {
            kpi.sections[sectionName] = [];
        }

        // Add the new parameter object to the selected section
        kpi.sections[sectionName].push({ parameter, weight });
        
        // Save the updated document
        await kpi.save();

        res.status(200).json({ 
            message: `Parameter added to ${sectionName}.`, 
            data: kpi 
        });
    } catch (error) {
        console.error('Error adding parameter:', error);
        res.status(500).json({ error: error.message });
    }
};


// Update KPI parameters
const updateKPIParameter = async (req, res) => {
    try {
        const kpiParameter = await KPIParameter.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!kpiParameter) {
            return res.status(404).json({ message: 'KPI parameters not found' });
        }
        res.status(200).json(kpiParameter);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};
const getAllKPIParameters = async (req, res) => {
    try {
        const kpiParameters = await KPIParameter.find();
        res.status(200).json(kpiParameters);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
const deleteKPIParameter = async (req, res) => {
    try {
        const kpiParameter = await KPIParameter.findByIdAndDelete(req.params.id);
        if (!kpiParameter) {
            return res.status(404).json({ message: 'KPI parameter not found' });
        }
        res.status(200).json({ message: 'KPI parameter deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Add a parameter to an existing KPI section
const addParametersToSection = async (req, res) => {
    try {
        const { sections } = req.body;

        if (!sections || typeof sections !== 'object') {
            return res.status(400).json({ error: 'Invalid or missing "sections" object in request body.' });
        }

        const kpi = await KPIParameter.findById(req.params.id);
        if (!kpi) {
            return res.status(404).json({ error: 'KPI parameter set not found.' });
        }

        for (const [section, items] of Object.entries(sections)) {
            if (!Array.isArray(items)) {
                return res.status(400).json({ error: `Section '${section}' must be an array.` });
            }

            if (!kpi.sections[section]) {
                return res.status(400).json({ error: `Section '${section}' does not exist.` });
            }

            for (const item of items) {
                const { parameter, weight } = item;
                if (!parameter || weight === undefined) {
                    return res.status(400).json({
                        error: 'Each item must include parameter and weight.'
                    });
                }

                kpi.sections[section].push({
                    parameter,
                    weight,
                    value: item.value || 0 // default value if not provided
                });
            }
        }

        await kpi.save();
        res.status(200).json(kpi);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getKPIParameterById = async (req, res) => {
    try {
        const kpiParameter = await KPIParameter.findById(req.params.id);
        if (!kpiParameter) {
            return res.status(404).json({ message: 'KPI parameter set not found' });
        }
        res.status(200).json(kpiParameter);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


module.exports = {
    createKPIParameter,
    addParameterToSection,
    updateKPIParameter,
    getAllKPIParameters,
    deleteKPIParameter,
    addParametersToSection,
    getKPIParameterById
};
