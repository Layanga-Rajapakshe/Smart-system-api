const KPIParameter = require('../models/KPIParametermodel');

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
                if (!item.parameter || item.weight === undefined || item.value === undefined) {
                    return res.status(400).json({
                        error: `Each item in the '${section}' section must include 'parameter', 'weight', and 'value'.`
                    });
                }
                if (item.weight < 0 || item.weight > 1) {
                    return res.status(400).json({
                        error: `Weight in '${section}' section must be between 0 and 1.`
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

module.exports = {
    createKPIParameter,
    updateKPIParameter,
    getAllKPIParameters,
    deleteKPIParameter
};
