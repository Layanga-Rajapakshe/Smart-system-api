const mongoose = require('mongoose');

const HolidaySchema = new mongoose.Schema({
    year:{
        type:Number,
        required:true
    },
    date:
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