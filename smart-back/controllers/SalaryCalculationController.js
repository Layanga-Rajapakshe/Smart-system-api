const Employee = require('../models/EmployeeModel');
const Attendance = require('../models/AttendanceModel');
const SalaryModel = require('../models/SalaryModel'); // Corrected model name
const mongoose = require('mongoose');

// Convert "HH:MM:SS" to total seconds
const timeStringToSeconds = (timeString) => {
    if (!timeString) return 0;
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return (hours || 0) * 3600 + (minutes || 0) * 60 + (seconds || 0);
};

// Convert total seconds back to "HH:MM:SS"
const secondsToTimeString = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

};
function formatDateToCustomISO(date) {  
    // Get parts of the date  
    const year = date.getUTCFullYear();  
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // Month is zero-indexed  
    const day = String(date.getUTCDate()).padStart(2, '0');  
    
    // Set time to midnight  
    const hours = '00';  
    const minutes = '00';  
    const seconds = '00';  
    const milliseconds = '000';  

    // Format to required string  
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+00:00`;  
} 

const calculateSalary = async (req, res) => {
    try {
        const { posts, month } = req.body;
        if (!posts || !month) {
            return res.status(400).json({ error: "Missing required parameters: posts or month." });
        }

        const [year, monthNum] = month.split('-').map(Number);
        if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
            return res.status(400).json({ error: "Invalid month format. Expected 'YYYY-MM'." });
        }

        let startDate;
        let endDate;
        if (monthNum === 1) {
            startDate = new Date(year - 1, 11, 22); // December 21 of the previous year
        } else {
            startDate = new Date(year, monthNum - 1, 22);
            startDate.setMonth(startDate.getMonth() - 1);
        }
        endDate = new Date(year, monthNum - 1, 21);
         
        startDate = formatDateToCustomISO(startDate);
        endDate = formatDateToCustomISO(endDate);

        

        console.log(startDate);
        
       

        // Fetch employees
        const employees = await Employee.find({ post: { $in: posts } });
        //console.log(employees);
        if (!employees.length) {
            return res.status(404).json({ message: "No employees found for the given posts." });
        }

        // Map employees for quick access
        const employeeMap = {};
        employees.forEach(emp => {
            employeeMap[emp._id.toString()] = {
                singleOtRate: emp.single_ot || 0,
                doubleOtRate: emp.double_ot || 0,
                poyaOtRate: emp.double_ot || 0,
                basicRate: (emp.agreed_basic || 0) / 30,
                reRate: (emp.re_allowance || 0) / 30
            };
        });

        const employeeIds = employees.map(emp => emp._id.toString());
        console.log(employeeIds);
    
        

        // Fetch attendance records
        const attendanceRecords = await Attendance.find({
            userId: { $in: employeeIds },
            Date: { $gte: startDate, $lt: endDate }
            
        });
        //console.log({ $gte: startDate, $lt: endDate })
        console.log(attendanceRecords);

        const otSummary = {};
        attendanceRecords.forEach(record => {
            const userId = record.userId.toString();
            if (!otSummary[userId]) {
                otSummary[userId] = {
                    totalExtraWorkingHrs: 0,
                    totalShortWorkingHrs: 0,
                    totalSingleOt: 0,
                    totalDoubleOt: 0,
                    totalPoyaOt: 0,
                    totalNoPayDays: 0,
                    OTEarnings: 0,
                    noPayBasicDeduction: 0,
                    noPayREDeduction: 0,
                    otDeduction: 0
                };
            }

            otSummary[userId].totalExtraWorkingHrs += timeStringToSeconds(record.extraWorkingHrs);
            otSummary[userId].totalShortWorkingHrs += timeStringToSeconds(record.shortWorkingHrs);
            otSummary[userId].totalSingleOt += timeStringToSeconds(record.singleOt);
            otSummary[userId].totalDoubleOt += timeStringToSeconds(record.doubleOt);
            otSummary[userId].totalPoyaOt += timeStringToSeconds(record.poyaOt);
            otSummary[userId].totalNoPayDays += record.nopayday || 0;
        });

        for (const userId in otSummary) {
            const empRates = employeeMap[userId];
            const summary = otSummary[userId];

            const singleOtHrs = summary.totalSingleOt / 3600;
            const doubleOtHrs = summary.totalDoubleOt / 3600;
            const poyaOtHrs = summary.totalPoyaOt / 3600;
            const shortHrs = summary.totalShortWorkingHrs / 3600;
            const totalNP = summary.totalNoPayDays;

            summary.OTEarnings =
                singleOtHrs * empRates.singleOtRate +
                doubleOtHrs * empRates.doubleOtRate +
                poyaOtHrs * empRates.poyaOtRate;
            summary.otDeduction = shortHrs * empRates.singleOtRate;
            summary.noPayBasicDeduction = totalNP * empRates.basicRate;
            summary.noPayREDeduction = totalNP * empRates.reRate;
            console.log(userId);
        }
        
        // Update salary records
        for (const [userId, summary] of Object.entries(otSummary)) {
            await SalaryModel.findOneAndUpdate(
                { userId, month },
                {
                    totalExtraWorkingHrs: secondsToTimeString(summary.totalExtraWorkingHrs),
                    totalShortWorkingHrs: secondsToTimeString(summary.totalShortWorkingHrs),
                    totalSingleOt: secondsToTimeString(summary.totalSingleOt),
                    totalDoubleOt: secondsToTimeString(summary.totalDoubleOt),
                    totalPoyaOt: secondsToTimeString(summary.totalPoyaOt),
                    OtEarnings: summary.OTEarnings,
                    OtDeduction: summary.otDeduction,
                    noPayDeductionBasic: summary.noPayBasicDeduction,
                    noPayDeductionREallowance: summary.noPayREDeduction,
                    totalnopayDeductions: summary.otDeduction + summary.noPayBasicDeduction + summary.noPayREDeduction,
                    totalOtEarnings: summary.OTEarnings - summary.otDeduction,
                },
                { upsert: true, new: true }
            );
        }

        res.status(200).json({ message: `Salary calculations for ${month} saved successfully` });
    } catch (error) {
        console.error("Error calculating salary:", error);
        res.status(500).json({ error: "Internal server error. Please try again later." });
    }
};

module.exports = { calculateSalary };

