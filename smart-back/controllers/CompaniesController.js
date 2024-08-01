const Company = require('../models/CompaniesModel');


const getCompanies = async (req, res) => {
    try {
        const company = await Company.find({});
        res.status(200).json(company);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
}
const getCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findById(id);
        if (!company) {
            return res.status(404).json({ message: `Company not found with id ${id}` });
        }
        res.status(200).json(company);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
}
const createCompany =async (req, res) => {
    try {
        const company = await Company.create(req.body);
        res.status(201).json(company);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
}
const updateCompany = async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
        if (!company) {
            return res.status(404).json({ message: `Company not found with id ${id}` });
        }
        res.status(200).json(company);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
}
const deleteCompany =  async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findByIdAndDelete(id);
        if (!company) {
            return res.status(404).json({ message: `Company not found with id ${id}` });
        }
        res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
}
module.exports = {
    getCompanies,
    getCompany,
    createCompany,
    updateCompany,
    deleteCompany
}