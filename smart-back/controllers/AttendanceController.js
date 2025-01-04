const Attendance = require('../models/AttendanceModel');
const Holidays = require('../models/HolidayModel');
const multer = require("multer");
const XLSX = require("xlsx");
const Employee =require("../models/EmployeeModel");

const storage = multer.memoryStorage();
const upload = multer({ storage });


const timeStringToSeconds = (timeString) => {
    const [hours, minutes, seconds] = timeString.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
};

const secondsToTimeString = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    // Pad hours, minutes, and seconds with leading zeros if necessary
    return [
        hours.toString().padStart(2, '0'),
        minutes.toString().padStart(2, '0'),
        seconds.toString().padStart(2, '0')
    ].join(':');
};

const isSaturday = (dateString) => {
    const date = new Date(dateString);
    return date.getDay() === 6; // 6 represents Saturday
};

const isSunday = (dateString) => {
    const date = new Date(dateString);
    return date.getDay() === 0; // 6 represents Saturday
};


const isHoliday = async (date) => {
    try {
        const holiday = await Holidays.findOne({ date: date });

        if (holiday) {
            return holiday.name; // Assuming the holiday model has a 'name' field
        } else {
            return null;  // If no holiday is found, return null (instead of 0 for clarity)
        }
    } catch (error) {
        console.error('Error checking for holiday:', error);
        throw error;
    }
};

const calOT = async (date, ID) => {
    try {
        const STD = await Attendance.findOne({ Date: date, UserId: ID });
        if (STD) {
            const stdhrs = timeStringToSeconds(STD.stdHours);
            const workedhrs = timeStringToSeconds(STD.TimePeriod);
            const differance = workedhrs - stdhrs;

            const FIFTEEN_MINUTES_IN_SECONDS = 15 * 60;

            let roundedOT;
            if (differance > 0) {
                // Round down to the nearest multiple of 15 minutes
                roundedOT = Math.floor(differance / FIFTEEN_MINUTES_IN_SECONDS) * FIFTEEN_MINUTES_IN_SECONDS;
            } else if (differance < 0) {
                // Round up if negative
                roundedOT = Math.ceil(differance / FIFTEEN_MINUTES_IN_SECONDS) * FIFTEEN_MINUTES_IN_SECONDS;
            } else {
                return 0; // No overtime or shortage
            }

            return roundedOT; // Return the rounded value (either OT or negative working hours)
        } else {
            return null; // No attendance found
        }
    } catch (error) {
        console.error('Error calculating OT:', error);
        throw error;
    }
};


const UploadExcellSheet = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        if (worksheet.length === 0) {
            return res.status(400).json({ message: 'Empty or invalid Excel sheet' });
        }

        for (const row of worksheet) {
            const UserId = row['Employee ID'];
            const DateRaw = row['Date'];
            const InRaw = row['IN'];  
            const OutRaw = row['OUT'];
            const WorkHrsRaw = row['Work Hrs'];

            if (!UserId || !DateRaw || !InRaw || !OutRaw || !WorkHrsRaw) continue;

            // Parse date as done previously
            const parsedDate = new Date((DateRaw - 25569) * 86400 * 1000); 

            // Convert InRaw and OutRaw from fractional Excel time to HH:MM:SS
            const convertExcelTimeToString = (excelTime) => {
                const totalSeconds = Math.round(excelTime * 24 * 60 * 60);
                const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
                const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
                const seconds = (totalSeconds % 60).toString().padStart(2, '0');
                return `${hours}:${minutes}:${seconds}`;
            };

            const parsedInTime = convertExcelTimeToString(InRaw);
            const parsedOutTime = convertExcelTimeToString(OutRaw);
            const timePeriodInSeconds = convertExcelTimeToString(WorkHrsRaw);

            // Convert Work HRs to seconds
        

           /* console.log('Parsed Date:', parsedDate);
            console.log('IN:', parsedInTime);
            console.log('OUT:', parsedOutTime);
            console.log('Work HRs (seconds):', timePeriodInSeconds);*/

            // Insert or update attendance
           

            await Attendance.findOneAndUpdate(
                { UserId: UserId, Date: parsedDate }, 
                {
                    $set: {
                        In: parsedInTime,  
                        Out: parsedOutTime,  
                        TimePeriod: timePeriodInSeconds,  
                    }
                },
                { upsert: true, new: true } 
            );

            const sat = isSaturday(parsedDate);
            if(sat===1){

                await Attendance.findOneAndUpdate(
                    { UserId: UserId, Date: parsedDate }, 
                    {
                        $set: {
                            stdHours:"04:00:00" ,
                            holiday:1

                        }
                    }
                );
            }

            processAttendanceData(parsedDate,UserId);

        
        }

        res.status(200).json({ message: 'Attendance uploaded successfully, please check!' });

    } catch (error) {
        console.error('Error uploading attendance data:', error);
        res.status(500).json({ message: 'Error uploading attendance data', error });
    }   
};

const addSalMonth = async (req, res) => {// this function should be called before the upload is called,use drop down to select year and month ,eg - 2024-02
    try {
        const { month } = req.params;

        // Step 1: Calculate the date range (21st of last month to 20th of this month)
        const currentDate = new Date(month);
        const startOfPeriod = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 21);
        const endOfPeriod = new Date(currentDate.getFullYear(), currentDate.getMonth(), 20);

        // Step 2: Get all active users
        const activeUsers = await Employee.find({ status: 'active' }).distinct('userId');

        if (!activeUsers.length) {
            return res.status(404).json({ message: 'No active users found' });
        }

        // Step 3: Loop over each active user and create date objects for the range
        for (const userId of activeUsers) {
            let currentDate = new Date(startOfPeriod);

            while (currentDate <= endOfPeriod) {
                const dateToSave = new Date(currentDate);

                // Check if an entry for this date and user already exists
                const existingAttendance = await Attendance.findOne({ UserId: userId, Date: dateToSave });

                if (!existingAttendance) {
                    let stdHours = '09:00:00';
                    shortWorkingHrs='-09:00:00' // Default for weekdays
                
                    // Check if the date is a Saturday, Sunday, or a holiday
                    const dayOfWeek = dateToSave.getDay(); // 0 = Sunday, 6 = Saturday
                
                    if (dayOfWeek === 6) { // If Saturday
                        stdHours = '04:00:00';
                        shortWorkingHrs='-04:00:00';
                    } else if (dayOfWeek === 0) { // If Sunday
                        stdHours = '00:00:00';
                    } else {
                        const holidayCheck = await isHoliday(dateToSave);
                        if (holidayCheck) {
                            stdHours = '00:00:00'; // If it's a holiday, set hours to 00:00:00
                        }
                    }
                
                    // Create a new attendance object for this date
                    await Attendance.create({
                        UserId: userId,
                        Date: dateToSave,
                        stdHours: stdHours, // Set appropriate standard hours based on the conditions
                        In: '00:00:00',
                        Out: '00:00:00',
                        TimePeriod: '00:00:00',
                    });
                }
                // Move to the next day
                currentDate.setDate(currentDate.getDate() + 1);
            }
        }

        res.status(200).json({ message: 'Salary month created successfully for all active users' });
    } catch (error) {
        console.error('Error creating salary month:', error);
        res.status(500).json({ message: 'Server error, unable to create salary month', error });
    }
};


const processAttendanceData = async (parsedDate, UserId) => {
    try {
        let Name = await isHoliday(parsedDate);
        
        if (isSaturday(parsedDate)) {
            Name = 1; // Saturday is treated as a regular day with half standard hours
        } else if (isSunday(parsedDate)) {
            Name = 2; // Sunday is treated as a holiday
        }

        const OT = await calOT(parsedDate, UserId);
        const OTString = OT ? secondsToTimeString(OT) : null; // Convert OT only if it's a positive value

        if (Name === 1 && OT > 0) {
            // Saturday, OT applies
            await Attendance.findOneAndUpdate(
                { UserId: UserId, Date: parsedDate },
                {
                    $set: {
                        stdHours: "04:00:00",  // 4 hours standard on Saturdays
                        isHoliday: false,
                        holiday: Name,  // Name indicates Saturday
                        singleOt: OTString
                    }
                }
            );
        } else if (Name > 1 && OT > 0) {
            // Sunday or another holiday, double OT applies
            await Attendance.findOneAndUpdate(
                { UserId: UserId, Date: parsedDate },
                {
                    $set: {
                        stdHours: "00:00:00",  // No standard hours on holidays
                        isHoliday: true,
                        holiday: Name,  // Name indicates Sunday or other holiday
                        doubleOt: OTString
                    }
                }
            );
        } else if (OT < 0) {
            // Short working hours, negative OT
            await Attendance.findOneAndUpdate(
                { UserId: UserId, Date: parsedDate },
                {
                    $set: {
                        shortWorkingHrs: OTString  // Shortage in working hours
                    }
                }
            );
        }
        else if (OT > 0) {
            // Short working hours, negative OT
            await Attendance.findOneAndUpdate(
                { UserId: UserId, Date: parsedDate },
                {
                    $set: {
                        extraWorkingHrs: OTString,  // Shortage in working hours
                        singleOt:OTString
                    }
                }
            );
        }
        
    } catch (error) {
        console.error('Error processing attendance data:', error);
        throw error;
    }
};

const reShowAttendanceRecords = async (req, res) => {
    try {
        const { userId, month } = req.body;

        // Parse year and month
        const [year, monthNum] = month.split('-').map(Number);

        // Calculate start and end dates
        let startDate;
        let endDate;

        if (monthNum === 1) {
            startDate = new Date(year - 1, 11, 22); // December 21 of the previous year
        } else {
            startDate = new Date(year, monthNum - 1, 22);
            startDate.setMonth(startDate.getMonth() - 1);
        }
        endDate = new Date(year, monthNum - 1, 21);

        // Log for debugging
        //console.log('User ID:', userId);
        //console.log('Start Date:', startDate);
        //console.log('End Date:', endDate);

        // Test fetching without UserId filter
        const attendanceRecords = await Attendance.find({
            UserId: userId,
            Date: {
                $gte: startDate,
                $lt: endDate
            }
        });

        //console.log('Attendance Records:', attendanceRecords); // Log fetched records

        if (!attendanceRecords || attendanceRecords.length === 0) {
            return res.status(404).json({ message: 'No attendance records found' });
        }

        res.status(200).json(attendanceRecords);
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        res.status(500).json({ message: 'Error fetching attendance records', error });
    }
};

const editAttendanceRecord = async (req, res) => {
    try {
        const { userId, date, In, Out } = req.body;
        const dateStart= new Date(date);
        dateStart.setUTCHours(0, 0, 0, 0);
        const dateEnd = new Date(date);
        dateEnd.setUTCHours(23, 59, 59, 999);

        // Find and update the attendance record
        const updatedRecord = await Attendance.findOneAndUpdate(
            { UserId: userId,
                Date: {
                    $gte: dateStart,
                    $lt: dateEnd
                } }, // Match based on userId and Date
            {
                $set: {
                    In: In,
                    Out: Out,
                },
            },
            { new: true } // Return the updated document
        );

        if (!updatedRecord) {
            // If no record is found
            return res.status(404).json({
                success: false,
                message: "Attendance record not found",
            });
        }

        // Successful update
        res.status(200).json({
            success: true,
            message: "Attendance record updated successfully",
            data: updatedRecord,
        });
    } catch (error) {
        // Handle errors
        res.status(500).json({
            success: false,
            message: "An error occurred while updating the attendance record",
            error: error.message,
        });
    }
};






const addHolidays = async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workbook = XLSX.read(file.buffer, { type: 'buffer' });

        // Log the sheet names to ensure you're accessing the correct sheet
        console.log('Sheet Names:', workbook.SheetNames);

        const sheetName = workbook.SheetNames[0]; // First sheet
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        
        //console.log('Raw Sheet Data:', workbook.Sheets[sheetName]);
        //console.log('Worksheet:', worksheet);

        if (worksheet.length === 0) {
            return res.status(400).json({ message: 'Empty or invalid Excel sheet' });
        }

        // Array to hold new holiday entries
        const HoliData = [];
        // Set to track dates already processed
        const processedDates = new Set();

        for (const row of worksheet) {
            const Year = row['Year'];
            const HolidayDateExcel = row['Date'];
            const Name = row['Name'];

            // Skip rows with missing data
            if (!HolidayDateExcel || !Year) continue;

            // Convert Excel date to JavaScript Date
            const HolidayDate = new Date((HolidayDateExcel - 25569) * 86400 * 1000);

            // Check for duplicates in the Excel file
            if (processedDates.has(HolidayDate.toISOString())) {
                console.log(`Duplicate date ${HolidayDate.toISOString()} found in Excel. Skipping...`);
                continue;
            }

            // Add the date to the processed set
            processedDates.add(HolidayDate.toISOString());

            // Check if a record with the same date already exists in the database
            const existingHoliday = await Holidays.findOne({ date: HolidayDate });

            if (existingHoliday) {
                // If a holiday with the same date exists, skip this entry
                console.log(`Holiday on ${HolidayDate.toISOString()} already exists in the database. Skipping...`);
                continue;
            }

            // Create an object for each entry
            HoliData.push({
                year: Year,
                date: HolidayDate, 
                name:Name, // Use the converted date
            });
        }

        // Log the holiday data before inserting it into the database
        console.log('HoliData before insertion:', HoliData);

        // Insert the new entries into the database if there are any
        if (HoliData.length > 0) {
            const result = await Holidays.insertMany(HoliData);
            console.log('Inserted Holidays:', result);
        } else {
            console.log('No new holidays to insert.');
        }

        res.status(200).json({ message: 'Holidays were updated successfully' });

    } catch (error) {
        // Log the error if insertion fails
        console.error('Error inserting holidays:', error);
        res.status(500).json({ message: 'Error uploading holidays', error });
    }
};

const getHoliday = async (req, res) => {
    try {
        const { date } = req.params;  // Extract the 'date' parameter from the URL

        // Find the holiday by the specified date
        const holiday = await Holidays.findOne({ date: date });

        // If no holiday is found, return a 404 status with a message
        if (!holiday) {
            return res.status(404).json({ message: 'No holiday found for the given date' });
        }

        // Return the found holiday in the response
        return res.status(200).json(holiday);
    } catch (error) {
        console.error('Error retrieving holiday:', error);  // Log error for debugging
        return res.status(500).json({
            message: 'Server error, unable to retrieve holiday',
            error: error.message || error  // Include error message in response
        });
    }
};

const getHolidays = async (req, res) => {
    try {
        const { year } = req.params;  // Extract the 'year' parameter from the URL

        // Find holidays for the specified year
        const holidays = await Holidays.find({ year: year }); // Assuming there's a field 'year' in your Holidays model

        // If no holidays are found, return a 404 status with a message
        if (holidays.length === 0) {
            return res.status(404).json({ message: 'No holidays found for the given year' });
        }

        // Return the found holidays in the response
        return res.status(200).json(holidays);
    } catch (error) {
        console.error('Error retrieving holidays:', error);  // Log error for debugging
        return res.status(500).json({
            message: 'Server error, unable to retrieve holidays',
            error: error.message || error  // Include error message in response
        });
    }
};


const removeHoliday = async (req, res) => {
    try {
        const { date } = req.params;  // Get the 'date' parameter from the URL

        // Use deleteMany to remove all holidays with the specified date
        const result = await Holidays.deleteMany({ date: date });

        // Check if any holidays were deleted
        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'No holidays found for the given date' });
        }

        // Respond with success message if holidays were deleted
        return res.status(200).json({ message: `${result.deletedCount} holiday(s) removed successfully` });
    } catch (error) {
        console.error('Error removing holiday:', error);  // Log the full error for debugging
        return res.status(500).json({
            message: 'Server error, unable to remove holiday(s)',
            error: error.message || error  // Include error message in the response
        });
    }
};
module.exports=
{
    UploadExcellSheet,
    processAttendanceData,
    reShowAttendanceRecords,
    addSalMonth,
    addHolidays,
    removeHoliday,
    getHoliday,
    upload,
    getHolidays,
    editAttendanceRecord


}