const Attendance = require('../models/AttendanceModel');
const Holidays = require('../models/HolidayModel');
const multer = require("multer");
const XLSX = require("xlsx");

const storage = multer.memoryStorage();
const upload = multer({ storage });

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
        

            console.log('Parsed Date:', parsedDate);
            console.log('IN:', parsedInTime);
            console.log('OUT:', parsedOutTime);
            console.log('Work HRs (seconds):', timePeriodInSeconds);

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
        }

        res.status(200).json({ message: 'Attendance uploaded successfully, please check!' });

    } catch (error) {
        console.error('Error uploading attendance data:', error);
        res.status(500).json({ message: 'Error uploading attendance data', error });
    }
};





module.exports = { UploadExcellSheet };


const addSalMonth = async(req,res)=>
{
    try
    {
        
    }
    catch
    {

    }
};

const processAttendanceData = async(parsedDate,UserId)=>//after the excution of UploadExcellSheet, this will process a complete salary month using google calender API which is a slary month for each employee is starts from earlier month's 21st to this months 20, all of the holidays should be marked according to th calender as per , ISholiday = true
{
    await Holidays.findHoliday(
        { Date: parsedDate },
       await Attendance.findOneAndUpdate(parsedDate,UserId)


    
        
    );
};

const reShowAttendanceRecords = async(req,res)=>//this will re load the processed data from the db to the dash board for the confirmation and corrections
{

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

        // Log the raw sheet data and worksheet to see if it's being parsed correctly
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





const getHoliday = async(req,res)=>
{
    try
    {

    }
    catch
    {

    }
};

const removeHoliday = async(req,res)=>
{
    try
    {
        const {date} = req.params;
        const day = await Holidays.findById(date); 
        if(!day)
        {
            logger.error('no such a holiday recorded yet!');
            return res.status(404).json({message:'no such a holiday recorded'});
        }
        await day.remove();
    }
    catch
    {

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
    upload


};