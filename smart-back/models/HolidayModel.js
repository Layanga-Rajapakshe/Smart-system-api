const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema({
    Year:{
        type:Number,
        required:true
    },
    Date:
    {
        type:Date,
        required:true
    },
    Name:
    {
        type:String
    }
});

const Holidays = mongoose.model('Holidays',HolidaySchema);
module.exports = Holidays;