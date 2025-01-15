const KPIParameter = require('../models/KPIParametermodel');

// Add KPI parameters
const createKPIParameter = async (req, res) => {
    try {
        const kpiParameter = new KPIParameter(req.body);
        await kpiParameter.save();
        res.status(201).json(kpiParameter);
    } catch (error) {
        res.status(400).json({ error: error.message });
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
