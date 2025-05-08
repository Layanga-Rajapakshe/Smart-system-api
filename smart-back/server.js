require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io'); // Socket.IO for WebRTC signaling
const http = require('http'); // Required to create an HTTP server for Socket.IO

// Import Routes
const CompanyRoute = require('./routes/CompaniesRoute');
const EmployeeRoute = require('./routes/EmployeeRoute');
const AuthRoute = require('./routes/AuthRoute');
const RoleRoute = require('./routes/RoleRoute');
const AttendanceRoute = require('./routes/AttendanceRoute');
const KPIRoutes = require('./routes/KPIroutes');
const NotificationRoute = require('./routes/NotificationRoute');
const TwoWeekRoute = require('./routes/TwoWeekRoute');
const MeetingRoute = require('./routes/MeetingRoute');
const ProjectRoute = require('./routes/ProjectRoute');
const KPIParameter = require('./routes/KPIParameterroute');
const RequestRoute = require('./routes/RequestRoute');
const PermissionRoute = require('./routes/PermissionRoute');
const SalaryParaRoute = require('./routes/SalaryManagementRoute');
const SalarySketchRoute = require('./routes/salaryCalculationRoute');
const SuperviseeRoute = require('./routes/SuperviseeRoute');
const LeaveRoute = require('./routes/LeaveRoutes');

const app = express();
const server = http.createServer(app); // HTTP server for Express and Socket.IO
const io = new Server(server, {
    cors: {
        origin: 'https://smart-system-one.vercel.app/',
        credentials: true
    }
});

// Load environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

// API Routes
app.use('/api/company', CompanyRoute);
app.use('/api/employees', EmployeeRoute);
app.use('/api/auth', AuthRoute);
app.use('/api/role', RoleRoute);
app.use('/api/attendance', AttendanceRoute);
app.use('/api/kpis', KPIRoutes);
app.use('/api/notifications', NotificationRoute);
app.use('/api/twoweek',TwoWeekRoute);
app.use('/api/meeting',MeetingRoute);
app.use('/api/project', ProjectRoute);
app.use('/api/kpi-parameter', KPIParameter);
app.use('/api/request', RequestRoute);
app.use('/api/permission', PermissionRoute);
app.use('/api/salParam',SalaryParaRoute);
app.use('/api/salary',SalarySketchRoute);
app.use('/api/supervisee',SuperviseeRoute);
app.use('/api/leave',LeaveRoute);



// Default Route
app.get('/', (req, res) => {
    res.status(200).send('SmartSystem API with WebRTC is running successfully!');
});

// WebRTC Signaling via Socket.IO
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Join a specific meeting room
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    // Handle WebRTC signaling messages
    socket.on('signal', (data) => {
        const { roomId, signalData } = data;

        // Broadcast signaling data to other participants in the same room
        socket.to(roomId).emit('signal', signalData);
        console.log(`Signal sent to room ${roomId} by user ${socket.id}`);
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });

    const adminSockets = {}; 
    
    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);
    
        socket.on("sendMessage", async ({ complaintId, sender, text }) => {
            try {
                const complaint = await Complaint.findById(complaintId);
                if (complaint) {
                    complaint.messages.push({ sender, text });
                    await complaint.save();
    
                    // Broadcast the message to all connected users
                    io.emit("newMessage", { complaintId, sender, text });
                }
            } catch (error) {
                console.error("Error handling message:", error);
            }
        });
    
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    socket.on("registerAdmin", (adminId) => {
        adminSockets[adminId] = socket.id; // Store admin's socket ID
        console.log(`Admin ${adminId} connected with socket ID: ${socket.id}`);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected:", socket.id);
        // Remove disconnected sockets
        Object.keys(adminSockets).forEach((key) => {
            if (adminSockets[key] === socket.id) {
                delete adminSockets[key];
            }
        });
    });
    

});



// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong', error: err.message });
});

// Database Connection and Server Startup
mongoose.connect(MONGO_URL)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`✅ SmartSystem API is running on port ${PORT}`);
        });
        console.log('✅Connected to MongoDB');
    })
    .catch((error) => {
        console.log('❌ Failed to connect to MongoDB', error);
    });

