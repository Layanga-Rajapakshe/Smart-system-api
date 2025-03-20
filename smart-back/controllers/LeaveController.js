const Leave = require("../models/LeaveModel");
const Notification = require("../models/notification");

const leaveSummary = async (req,res) =>
{
    try 
    {
        const userId = req.params;
        const employee = await Employee.findOne({userId: userId});
        if(!employee)
        {
            console.error(`Employee not found for ID:${UserId}`);
        }
        const userIdObject = employee._id.toString();
    }
    catch
    {

    }
}
