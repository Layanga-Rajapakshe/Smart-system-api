const Tasks = require('../models/TwoWeekModel');
const Holidays = require('../models/HolidayModel');

const hoursAweek = async (StartingDate) => {
    try {
        const { StartingDate } = req.body;
        const startOfWeek = new Date(StartingDate);
        const endOfWeek = new Date(StartingDate);
        endOfWeek.setDate(startOfWeek.getDate() + 5); // Move to Saturday of the same week

        // Find holidays between Monday to Saturday of the given week
        const holidaysInWeek = await Holidays.find({
            date: {
                $gte: startOfWeek,
                $lte: endOfWeek
            }
        });

        let fullDayHolidays = 0;
        let halfDayHolidays = 0;

        // Iterate through holidays to classify them as full or half-day
        holidaysInWeek.forEach(holiday => {
            const holidayDate = new Date(holiday.date);
            const dayOfWeek = holidayDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

            if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                // Monday to Friday - Full day holiday
                fullDayHolidays++;
            } else if (dayOfWeek === 6) {
              
                halfDayHolidays++;
            }
            //if there are leaves, add a function here to calculate leave hours also

        });

        let HoursAweek = 8*(5-fullDayHolidays)-4*halfDayHolidays+4;

        // Return the count of full and half-day holidays
        return HoursAweek;
    } catch (error) {
        console.error('error in calculating holidays in the week',error);
        throw error;
    }
};

const addNewTask = async (req, res) => {
    try {
        const {
            UserId, StartingDate, TaskId, Task, PriorityLevel, 
            isRecurring, TaskType, EstimatedHours, deadLine, 
            isFinished, isFinishedOnTime, Comment
        } = req.body;

        // Compute StartingDate
        const today = new Date();
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Adjust to Monday
        startOfWeek.setHours(0, 0, 0, 0);

        let computedStartingDate;
        if (StartingDate === "thisWeek") {
            computedStartingDate = startOfWeek;
        } else if (StartingDate === "nextWeek") {
            const nextWeekDate = new Date(startOfWeek);
            nextWeekDate.setDate(nextWeekDate.getDate() + 7);
            computedStartingDate = nextWeekDate;
        } else {
            return res.status(400).json({ message: "Invalid StartingDate value. Use 'thisWeek' or 'nextWeek'." });
        }

        // Use Task.create() to save the task
        const newTask = await Tasks.create({
            UserId, 
            StartingDate: computedStartingDate, 
            TaskId, 
            Task, 
            PriorityLevel, 
            isRecurring, 
            TaskType, 
            EstimatedHours, 
            deadLine, 
            isFinished, 
            isFinishedOnTime, 
            Comment
        });

        res.status(201).json({ message: "Task created successfully", task: newTask });
    } catch (error) {
        console.error("Error adding task:", error);
        res.status(500).json({ message: "Error creating task", error });
    }
};

const finishAtask = async(req,res)=>
{
    try
    {
        
    }
    catch
    {

    }

};

/*const addNewTask_recurring = async (req, res) => {
    try {
        const {
            UserId, StartingDate, TaskId, Task, PriorityLevel, 
            isRecurring, TaskType, EstimatedHours, isFinished, isFinishedOnTime
        } = req.body;

        await Task.create({
            UserId, 
            StartingDate, 
            TaskId, 
            Task, 
            PriorityLevel, 
            isRecurring, 
            TaskType, 
            EstimatedHours, 
            isFinished, 
            isFinishedOnTime
        });

        await newTask.save();
        res.status(201).json({ message: "Recurring task created successfully", task: newTask });
    } catch (error) {
        console.error("Error adding recurring task:", error);
        res.status(500).json({ message: "Error creating recurring task", error });
    }
};*/

const showThisWeek = async (req, res) => {
    try {

        const { UserId } = req.body;


    


        const today = new Date();
        const dayOfWeek = today.getDay();
        const startOfWeek = new Date(today);
        //console.log(startOfWeek);
        startOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1)); // Adjust to Monday
        startOfWeek.setHours(0, 0, 0, 0);
        console.log(startOfWeek);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Move to Sunday of the same week
        endOfWeek.setHours(23, 59, 59, 999); // End of the day

        // Query tasks within this week's date range
        const tasksThisWeek = await Tasks.find({
            StartingDate: startOfWeek ,
            UserId: UserId
        });

        res.status(200).json({ tasks: tasksThisWeek });
    } catch (error) {
        console.error("Error fetching this week's tasks:", error);
        res.status(500).json({ message: "Error fetching this week's tasks", error });
    }
};

const showNextWeek = async (req, res) => {
    try {

        const { UserId } = req.body;


        const today = new Date();
        const dayOfWeek = today.getDay();
        const startOfThisWeek = new Date(today);
        startOfThisWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        startOfThisWeek.setHours(0, 0, 0, 0);

        const startOfNextWeek = new Date(startOfThisWeek);
        startOfNextWeek.setDate(startOfThisWeek.getDate() + 7); // Move to next Monday
        const endOfNextWeek = new Date(startOfNextWeek);
        endOfNextWeek.setDate(startOfNextWeek.getDate() + 6); // Move to next Sunday
        endOfNextWeek.setHours(23, 59, 59, 999);

        const tasksNextWeek = await Task.find({
            StartingDate: startOfWeek ,
            UserId: UserId});

        res.status(200).json({ tasks: tasksNextWeek });
    } catch (error) {
        console.error("Error fetching next week's tasks:", error);
        res.status(500).json({ message: "Error fetching next week's tasks", error });
    }
};

const showPrevWeek = async (req, res) => {
    try {
        const { UserId } = req.body;
        const today = new Date();
        const dayOfWeek = today.getDay();
        const startOfThisWeek = new Date(today);
        startOfThisWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
        startOfThisWeek.setHours(0, 0, 0, 0);

        const startOfPrevWeek = new Date(startOfThisWeek);
        startOfPrevWeek.setDate(startOfThisWeek.getDate() - 7); // Move to previous Monday
        const endOfPrevWeek = new Date(startOfPrevWeek);
        endOfPrevWeek.setDate(startOfPrevWeek.getDate() + 6); // Move to previous Sunday
        endOfPrevWeek.setHours(23, 59, 59, 999);

        const tasksPrevWeek = await Task.find({
            StartingDate: startOfWeek ,
            UserId: UserId
        });

        res.status(200).json({ tasks: tasksPrevWeek });
    } catch (error) {
        console.error("Error fetching previous week's tasks:", error);
        res.status(500).json({ message: "Error fetching previous week's tasks", error });
    }
};

const getTotalAllocatedTimeThisWeek = async (req, res) => {
    try {
        const { UserId, StartingDate } = req.body;

        // Calculate Daily Total
        const dailyTasks = await TaskSchema.find({
            UserId: UserId,
            StartingDate: StartingDate,
            TaskType: "Daily"
        });
        
        let TotalDaily = 0;
        dailyTasks.forEach(task => {
            TotalDaily += task.EstimatedHours; // assuming task.Hours contains the hours for the task
        });

        // Calculate Weekly Total
        const weeklyTasks = await TaskSchema.find({
            UserId: UserId,
            StartingDate: StartingDate,
            TaskType: "Weekly"
        });
        
        let TotalWeekly = 0;
        weeklyTasks.forEach(task => {
            TotalWeekly += task.EstimatedHours;
        });

        const weekTasks = await TaskSchema.find({
            UserId: UserId,
            StartingDate: StartingDate,
            isRecurring: false
        });
        
        let TotalWeek = 0;
        weekTasks.forEach(task => {
            TotalWeek += task.EstimatedHours;
        });

        let totalWeekHours = hoursAweek(StartingDate);//gives the total hours availble in this week
        let balanceHours = totalWeekHours -(TotalDaily+TotalWeekly+TotalWeek)

        // Return both totals in a JSON response
        return res.status(200).json({ totalWeekHours,TotalDaily, TotalWeekly,TotalWeek,balanceHours });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "An error occurred while calculating totals." });
    }
};

const getTotalAllocatedTimeNextWeek = async (req, res) => {
    try {
        const { UserId, StartingDate } = req.body;

        // Calculate Daily Total
        const startOfNextWeek = new Date(StartingDate);
        startOfNextWeek.setDate(startOfThisWeek.getDate() + 7);
        

        const dailyTasks = await TaskSchema.find({
            UserId: UserId,
            StartingDate: startOfNextWeek,
            TaskType: "Daily"
        });
        
        let TotalDaily = 0;
        dailyTasks.forEach(task => {
            TotalDaily += task.EstimatedHours; // assuming task.Hours contains the hours for the task
        });

        // Calculate Weekly Total
        const weeklyTasks = await TaskSchema.find({
            UserId: UserId,
            StartingDate: startOfNextWeek,
            TaskType: "Weekly"
        });
        
        let TotalWeekly = 0;
        weeklyTasks.forEach(task => {
            TotalWeekly += task.EstimatedHours;
        });
        const weekTasks = await TaskSchema.find({
            UserId: UserId,
            StartingDate: StartingDate,
            isRecurring: false
        });
        
        let TotalWeek = 0;
        weekTasks.forEach(task => {
            TotalWeek += task.EstimatedHours;
        });

        // Return both totals in a JSON response
        return res.status(200).json({ TotalDaily, TotalWeekly,TotalWeek });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "An error occurred while calculating totals." });
    }
};

const getTotalAllocatedTimePrevWeek = async (req, res) => {
    try {
        const { UserId, StartingDate } = req.body;

        // Calculate Daily Total
        const startOfPrevWeek = new Date(StartingDate);
        startOfPrevWeek.setDate(startOfThisWeek.getDate() - 7);
        

        const dailyTasks = await TaskSchema.find({
            UserId: UserId,
            StartingDate: startOfPrevWeek,
            TaskType: "Daily"
        });
        
        let TotalDaily = 0;
        dailyTasks.forEach(task => {
            TotalDaily += task.EstimatedHours; // assuming task.Hours contains the hours for the task
        });

        // Calculate Weekly Total
        const weeklyTasks = await TaskSchema.find({
            UserId: UserId,
            StartingDate: startOfPrevWeek,
            TaskType: "Weekly"
        });
        
        let TotalWeekly = 0;
        weeklyTasks.forEach(task => {
            TotalWeekly += task.EstimatedHours;
        });

        const weekTasks = await TaskSchema.find({
            UserId: UserId,
            StartingDate: StartingDate,
            isRecurring: false
        });
        
        let TotalWeek = 0;
        weekTasks.forEach(task => {
            TotalWeek += task.EstimatedHours;
        });

        // Return both totals in a JSON response
        return res.status(200).json({ TotalDaily, TotalWeekly,TotalWeek });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "An error occurred while calculating totals." });
    }
};

// Update this to get other values also(sums)


module.exports = { addNewTask, addNewTask_recurring,showNextWeek,showPrevWeek,showThisWeek,getTotalAllocatedTimeThisWeek,getTotalAllocatedTimeNextWeek,getTotalAllocatedTimePrevWeek,finishAtask };

