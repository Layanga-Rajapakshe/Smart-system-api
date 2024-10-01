const Attendance =require('../models/AttendanceModel');
const multer = require("multer");
const XLSX = require("xlsx");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const UploadExcellSheet = async(req,res)=>//This will create new salary month base on uploaded sheet
{
    try
    {
        const file = req.file
        if(!file)
        {return res.status(400).json({message:'no file uploded'})}  

        const workbook = XLSX.read(file.buffer,{type:'buffer'});
        const sheetName = workbook.SheetNames[0];
        const worksheet =XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);//converts to json

        const attendanceData = [];//array - holds json - data

        worksheet.forEach(async (row)=>
        {
            const UserId = row['Employee ID'];
            const Date = row ['Date'];
            const In = row['IN'];
            const Out = row['OUT'];
            const TimePeriod = row['Work HRs'];

            if(!UserId || !Date || !In || !Out ) return;

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
        });

        await Attendance.insertMany(attendanceData);

        res.status(200).json({message:'Attendance uploaded Successfully please check !'});


    }
    catch (error)
    {
        res.status(500).json({message:'error uploading attendance data',error});

    }
};

const addSalMonth = async(req,res)=>
{
    
};

const processAttendanceData = async(req,res)=>//after the excution of UploadExcellSheet, this will process a complete salary month using google calender API which is a slary month for each employee is starts from earlier month's 21st to this months 20, all of the holidays should be marked according to th calender as per , ISholiday = true
{

};

const reShowAttendanceRecords = async(req,res)=>//this will re load the processed data from the db to the dash board for the confirmation and corrections
{

};

module.exports=
{
    UploadExcellSheet,
    processAttendanceData,
    reShowAttendanceRecords,
    addSalMonth,
    upload


};