require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const morgan = require('morgan');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path'); // Added for serving static files

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

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || '*',
        methods: ['GET', 'POST'],
        credentials: true,
    },
});

// Load environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/smartsystem';

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || '*', credentials: true }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

// Serve static files from the dist directory (React frontend)
app.use(express.static(path.join(__dirname, 'dist')));

// Serve index.html for all other routes (React Router support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// API Routes
app.use('/api/company', CompanyRoute);
app.use('/api/employees', EmployeeRoute);
app.use('/api/auth', AuthRoute);
app.use('/api/role', RoleRoute);
app.use('/api/attendance', AttendanceRoute);
app.use('/api/kpis', KPIRoutes);
app.use('/api/notifications', NotificationRoute);
app.use('/api/twoweek', TwoWeekRoute);
app.use('/api/meeting', MeetingRoute);

// WebRTC Signaling with Socket.IO
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // User joins a specific meeting room
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.id} joined room: ${roomId}`);
    });

    // WebRTC signaling messages
    socket.on('signal', (data) => {
        const { roomId, signalData } = data;
        socket.to(roomId).emit('signal', signalData);
        console.log(`Signal relayed to room ${roomId} by user ${socket.id}`);
    });

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id);
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    res.status(500).json({
        message: 'Internal server error',
        error: err.message,
    });
});

// Database Connection and Server Startup
mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        server.listen(PORT, () => {
            console.log(`✅ SmartSystem API is running on port ${PORT}`);
        });
        console.log('✅ Connected to MongoDB');
    })
    .catch((error) => {
        console.error('❌ Failed to connect to MongoDB:', error.message);
    });
