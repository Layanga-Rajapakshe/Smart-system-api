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
            employeeMap[emp._id] = {
                singleOtRate: emp.single_ot || 0,
                doubleOtRate: emp.double_ot || 0,
                poyaOtRate: emp.double_ot || 0,
                basicRate: (emp.agreed_basic || 0) / 30,
                reRate: (emp.re_allowance || 0) / 30,
                basic: emp.agreed_basic||0,
                reallowance: emp.re_allowance||0,
                isEPF: emp.isEPF,
                mealAdvance: emp.mealAdvance || 0,
               

            };
        });

        //const employeeIds = employees.map(emp => emp._id.valueOf());
        //

    
        const { ObjectId } = require('mongoose').Types;

        const employeeIds = employees.map(emp => new ObjectId(emp._id));

        console.log(employeeIds); // Ensure they are ObjectId objects

        const attendanceRecords = await Attendance.find({
            UserId: { $in: employeeIds },
            Date: { $gte: startDate, $lt: endDate }
        });

//console.log(attendanceRecords);

        const otSummary = {};
        attendanceRecords.forEach(record => {
            const userId = record.UserId;
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
                    nopaydays_ot:0,
                   
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
            const totalNP = summary.totalNoPayDays;// no pay, coming from leaves
            summary.OTEarnings =
                singleOtHrs * empRates.singleOtRate +
                doubleOtHrs * empRates.doubleOtRate +
                poyaOtHrs * empRates.poyaOtRate;
            summary.nopaydays_ot = shortHrs/24;
            summary.totalNPdays = totalNP +summary.nopaydays_ot;
            //summary.otDeduction = shortHrs * empRates.singleOtRate;
            summary.noPayBasicDeduction =  summary.totalNPdays* empRates.basicRate;
            summary.noPayREDeduction = summary.totalNPdays * empRates.reRate;
            summary.newBasic = empRates.basic + summary.noPayBasicDeduction;
            summary.newRE = empRates.reallowance + summary.noPayREDeduction;
            summary.totalIncomeForTheMonth =  summary.newBasic  +summary.OTEarnings +summary.newRE;
            if(empRates.isEPF){
                summary.EPF_deduction = summary.newBasic*0.08;
                summary.EPF_company = summary.newBasic*0.12;
            }
            console.log(userId);
        }
        
        // Update salary records
        for (const [userId, summary] of Object.entries(otSummary)) {
            // Find existing salary record
            const existingSalary = await SalaryModel.findOne({ userId, month });
        
            // Get previous deductions (if salary record exists)
            const salaryAdvance = existingSalary?.sallaryAdvance || 0;//implement the controller to add salary advances and other deductions, also the logic for the update whenever somthing is changed
            const mealAdvance = existingSalary?.mealAdvance || 0;
            const otherDeductions = existingSalary?.otherDeductions || 0;
        
            // Calculate Final Salary correctly
            const finalSalary = summary.totalIncomeForTheMonth - salaryAdvance - mealAdvance - otherDeductions;
        
            await SalaryModel.findOneAndUpdate(
                { userId, month },
                {
                    totalExtraWorkingHrs: secondsToTimeString(summary.totalExtraWorkingHrs),
                    totalShortWorkingHrs: secondsToTimeString(summary.totalShortWorkingHrs),
                    totalSingleOt: secondsToTimeString(summary.totalSingleOt),
                    totalDoubleOt: secondsToTimeString(summary.totalDoubleOt),
                    totalPoyaOt: secondsToTimeString(summary.totalPoyaOt),
                    OtEarnings: summary.OTEarnings,
                    //OtDeduction: summary.otDeduction,
                    nopaydays_ot: summary.nopaydays_ot,
                    nopaydays: summary.totalNoPayDays,
                    totalNPdays: summary.totalNPdays,
                    noPayDeductionBasic: summary.noPayBasicDeduction,
                    noPayDeductionREallowance: summary.noPayREDeduction,
                    totalIncomeForTheMonth: summary.totalIncomeForTheMonth,
                    newBasic: summary.newBasic,
                    newRE: summary.newRE,
                    EPF_employee: summary.EPF_deduction,
                    EPF_employer: summary.EPF_company,
                    FinalSalary: finalSalary
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

const showsalarysheet = async (req, res) => {
    try {
        const { userId, month } = req.body;

        if (!userId || !month) {
            return res.status(400).json({ error: "Missing required parameters: userId or month." });
        }

        // Find the employee using the provided userId
        const employee = await Employee.findOne({ _id: userId }); // Ensure correct field matching
        if (!employee) {
            console.error(`Employee not found for ID: ${userId}`);
            return res.status(404).json({ error: "Employee not found." });
        }

        // Fetch salary details using employee ID and month
        const salaryDetails = await SalaryModel.findOne({ userId: employee._id, month });

        if (!salaryDetails) {
            return res.status(404).json({ error: "Salary details not found for the given user and month." });
        }

        return res.status(200).json({ employee, salaryDetails });
    } catch (error) {
        console.error("Error fetching salary details:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};





module.exports = { calculateSalary,showsalarysheet };

