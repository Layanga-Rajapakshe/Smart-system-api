const Leave = require("../models/LeaveModel");
const leaveRequest = require("../models/LeaveRequestModel");
const Employee = require("../models/EmployeeModel");
const Notification = require("../models/notification");

const leaveSummary = async (req, res) => {
    try {
        const {UserId} = req.params;
        //console.log(UserId);
        const employee = await Employee.findOne({ userId: UserId });
        //console.log(employee);
        const userIdObject = employee._id;
        //if(!employee)
            if (!employee) {
                console.error(`Employee not found for ID: ${UserId}`);
                return res.status(404).json({ error: "Employee not found" });
            }

        const currentYear = new Date().getFullYear(); // Get current year
        const hiredYear = new Date(employee.hired_date).getFullYear(); // Get employee's hired year

        let annualLeaves = 0;
        let casualLeaves = 0;

        if (currentYear === hiredYear) {
            annualLeaves = employee.startingYrAnnualLeaves||0;
            casualLeaves = employee.startingYrCasualLeaves||0;
        } else {
            annualLeaves = employee.AnnualLeaves||0;
            casualLeaves = employee.CasualLeaves||0;
        }

        // Check if a leave record exists
        let leaveRecord = await Leave.findOne({ UserId: userIdObject, year: currentYear });

        // If no record exists, create a new one
        if (!leaveRecord) {
            leaveRecord = new Leave({
                UserId: employee._id,
                year: currentYear,
                leave_balance_annual: annualLeaves,
                leave_balance_casual: casualLeaves,
                noPay_Leaves: 0,
            });

            await leaveRecord.save();
        }

        return res.status(200).json({
            annualLeaves,
            casualLeaves,
            leaveRecord
        });

    } catch (error) {
        console.error("Error fetching leave summary:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const requestLeave = async (req, res) => {
    try {
        const { UserId, requestingDate, leaveType, numberOfDays, Reason } = req.body;
        const employee = await Employee.findOne({ userId: UserId });

        if (!employee) {
            console.error(`Employee not found for ID: ${UserId}`);
            return res.status(404).json({ error: "Employee not found" });
        }

        const userIdObject = employee._id;
        const Year = new Date(requestingDate).getFullYear();
        
        // Fetch all employees with the role of CEO
        const ceos = await Employee.find({ role: "CEO" });
        const ceoIds = ceos.map(ceo => ceo._id);
        
        const receivers = [employee.supervisor, ...ceoIds];

        let leaveRecord = await Leaves.findOne({ UserId: userIdObject, year: Year });

        if (!leaveRecord) {
            leaveRecord = new Leaves({
                UserId: employee._id,
                year: Year,
                leave_balance_annual: 10, // Example default value
                leave_balance_casual: 5, // Example default value
                noPay_Leaves: 0,
            });
            await leaveRecord.save();
        }

        const newLeaveRequest = new LeaveRequest({
            userId: userIdObject,
            requested_day: requestingDate,
            requesting_Date: new Date(),
            numberOfDays,
            reason: Reason,
            is_Accepted: false,
            AcceptedBy_supervisor: null,
            AcceptedBy_CEO: [],
            comment: "",
            reciver: receivers,
        });

        await newLeaveRequest.save();
        return res.status(201).json({ message: "Leave request submitted successfully", leaveRequest: newLeaveRequest });
    } catch (error) {
        console.error("Error requesting leave:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};



module.exports=
{
    leaveSummary
}

