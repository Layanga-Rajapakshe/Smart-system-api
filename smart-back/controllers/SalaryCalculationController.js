const Employee = require('../model/EmployeeModel');
const Attendance = require('../models/AttendanceModel');
const salsketch = require('../models/SalaryModel'); // Import the new model

// Convert "HH:MM:SS" to total seconds
const timeStringToSeconds = (timeString) => {
    if (!timeString) return 0; // Handle null or empty values
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

const calculateSalary = async (req, res) => {
    try {
        const { posts, month } = req.body;
        const [year, monthNum] = month.split('-').map(Number);

        let startDate, endDate;

        if (monthNum === 1) {
            startDate = new Date(year - 1, 11, 22); // December 22 of the previous year
        } else {
            startDate = new Date(year, monthNum - 2, 22);
        }
        endDate = new Date(year, monthNum - 1, 21);

        // Step 1: Find employees with the given posts
        const employees = await Employee.find({ post: { $in: posts } });

        // Extract user IDs and store OT rates
        const employeeMap = {};
        employees.forEach(emp => {
            employeeMap[emp._id.toString()] = {
                singleOtRate: emp.single_ot,
                doubleOtRate: emp.double_ot,
                poyaOtRate: emp.double_ot,
                BasicRate:emp.agreed_basic/30,
                RErate: emp.re_allowance/30
            };
        });

        const employeeIds = Object.keys(employeeMap);

        if (employeeIds.length === 0) {
            return res.status(404).json({ message: "No employees found for the given posts." });
        }

        // Step 2: Aggregate attendance records and sum OT in SECONDS
        const attendanceRecords = await Attendance.find({
            userId: { $in: employeeIds },
            Date: { $gte: startDate, $lt: endDate }
        });

        // Initialize an object to store the summed OT per user
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
                    totalNoPayDays:0,
                    OTEarnings: 0,
                    noPayDays:0,
                    otDeduction:0,
                    noPayBasicDeduction:0,
                    noPayREDeduction:0,
                };
            }

            otSummary[userId].totalExtraWorkingHrs += timeStringToSeconds(record.extraWorkingHrs);
            otSummary[userId].totalShortWorkingHrs += timeStringToSeconds(record.shortWorkingHrs);
            otSummary[userId].totalSingleOt += timeStringToSeconds(record.singleOt);
            otSummary[userId].totalDoubleOt += timeStringToSeconds(record.doubleOt);
            otSummary[userId].totalPoyaOt += timeStringToSeconds(record.poyaOt);
            otSummary[userId].totalNoPayDays += record.nopayday;
        });

        // Step 3: Multiply by OT rates
        for (const userId in otSummary) {
            const empRates = employeeMap[userId];

            const singleOtHrs = otSummary[userId].totalSingleOt / 3600;
            const doubleOtHrs = otSummary[userId].totalDoubleOt / 3600;
            const poyaOtHrs = otSummary[userId].totalPoyaOt / 3600;
            const shortHrs = otSummary[userId].totalShortWorkingHrs/3600;
            const totalNP = otSummary[userId].totalNoPayDays;

            otSummary[userId].OTEarnings =
                singleOtHrs * empRates.singleOtRate +
                doubleOtHrs * empRates.doubleOtRate +
                poyaOtHrs * empRates.poyaOtRate;
            otSummary[userId].otDeduction = shortHrs * empRates.singleOtRates;
            otSummary[userId].noPayBasicDeduction = totalNP*BasicRate ;
            otSummary[userId].noPayREDeduction = totalNP*RErate;
            
        }

        // Step 4: Save or update OT totals in SalaryModel
        for (const [userId, summary] of Object.entries(otSummary)) {
            await salsketch.findOneAndUpdate(
                { userId, month },
                {
                    totalExtraWorkingHrs: secondsToTimeString(summary.totalExtraWorkingHrs),
                    totalShortWorkingHrs: secondsToTimeString(summary.totalShortWorkingHrs),
                    totalSingleOt: secondsToTimeString(summary.totalSingleOt),
                    totalDoubleOt: secondsToTimeString(summary.totalDoubleOt),
                    totalPoyaOt: secondsToTimeString(summary.totalPoyaOt),
                    OtEarnings: summary.OTEarnings,
                    OtDeduction : summary. otDeduction,
                    noPayDeductionBasic : summary.noPayBasicDeduction,
                    noPayDeductionREallowance: summary.noPayREDeduction,
                    totalnopayDeductions : summary.otDeduction + summary.noPayBasicDeduction +summary.noPayREDeduction,
                    totalOtEarnings: summary.OTEarnings -summary. otDeduction,


                },
                { upsert: true, new: true }
            );
        }

        res.status(200).json({ message: `OT calculations for the month ${month} saved successfully` });

    } catch (error) {
        console.error("Error calculating salary:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

