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

        for (const row of worksheet) {
            const UserId = row['Employee ID'];
            const Date = row['Date'];
            const In = row['IN'];
            const Out = row['OUT'];
            const TimePeriod = row['Work HRs'];

            if (!UserId || !Date || !In || !Out) continue; // Skip rows with missing data

            await Attendance.findOneAndUpdate(
                { UserId: UserId, Date: Date }, // Filter by UserId and Date
                {
                    $set: {
                        In: In,
                        Out: Out,
                        TimePeriod: TimePeriod,
                    }
                },
                { upsert: true, new: true } // Insert new if no match found, and return the updated document
            );
        }

        res.status(200).json({ message: 'Attendance uploaded successfully, please check!' });

    } catch (error) {
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

const processAttendanceData = async(req,res)=>//after the excution of UploadExcellSheet, this will process a complete salary month using google calender API which is a slary month for each employee is starts from earlier month's 21st to this months 20, all of the holidays should be marked according to th calender as per , ISholiday = true
{

};

const reShowAttendanceRecords = async(req,res)=>//this will re load the processed data from the db to the dash board for the confirmation and corrections
{

};

const addHolidays = async(req,res)=>//to add company specified holidyas, should updated before calculating salary!
{
    
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workbook = XLSX.read(file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        // Array to hold new attendance entries
        const HoliData = [];

        for (const row of worksheet) {
            const Year = row['Year'];
            const Date = row['Date'];
            const Name = row['Name'];
            

            // Skip rows with missing data
            if (!Date || !Year || !Name ) continue;

            // Create an object for each entry
            HoliData.push({
                year: Year,
                date: Date,
                name: Name,
            });
        }

        // Insert the new entries into the database
        await Holidays.insertMany(Holidata);

        res.status(200).json({ message: 'Holidays were updated successfully' });

    } catch (error) {
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