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
const TwoWeekRoute = require('./routes/TwoWeekRoute');

const app = express();
const server = http.createServer(app); // HTTP server for Express and Socket.IO
const io = new Server(server, {
    cors: {
        origin: true, // Allow all origins (customize this in production)
        methods: ["GET", "POST"],
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
app.use('/api/twoweek',TwoWeekRoute);

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

