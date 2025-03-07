const Employee = require('../model/EmployeeModel');
const Attendance = require('../models/AttendanceModel');
const OTSummary = require('../models/OTSummaryModel'); // Import the new model

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

        // Extract user IDs
        const employeeIds = employees.map(emp => emp._id);

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
                    totalPoyaOt: 0
                };
            }

            otSummary[userId].totalExtraWorkingHrs += timeStringToSeconds(record.extraWorkingHrs);
            otSummary[userId].totalShortWorkingHrs += timeStringToSeconds(record.shortWorkingHrs);
            otSummary[userId].totalSingleOt += timeStringToSeconds(record.singleOt);
            otSummary[userId].totalDoubleOt += timeStringToSeconds(record.doubleOt);
            otSummary[userId].totalPoyaOt += timeStringToSeconds(record.poyaOt);
        });

        // Step 3: Save or update OT totals in OTSummary model
        for (const [userId, summary] of Object.entries(otSummary)) {
            await OTSummary.findOneAndUpdate(
                { userId, month },
                {
                    totalExtraWorkingHrs: secondsToTimeString(summary.totalExtraWorkingHrs),
                    totalShortWorkingHrs: secondsToTimeString(summary.totalShortWorkingHrs),
                    totalSingleOt: secondsToTimeString(summary.totalSingleOt),
                    totalDoubleOt: secondsToTimeString(summary.totalDoubleOt),
                    totalPoyaOt: secondsToTimeString(summary.totalPoyaOt)
                },
                { upsert: true, new: true }
            );
        }

        res.status(200).json({ message: "OT totals saved successfully", otSummary });

    } catch (error) {
        console.error("Error calculating salary:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
