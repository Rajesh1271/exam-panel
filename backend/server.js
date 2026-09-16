const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const connectdb = require('./config/db');
const seedInitialData = require('./config/seed');

const authRoutes = require('./routes/authroutes');
const subjectroutes = require('./routes/subjectroutes');
const examroutes = require('./routes/examroutes');
const answerroutes = require('./routes/answerroutes');
const questionroutes = require('./routes/questionroutes');
const resultroutes = require('./routes/resultroutes');
const courseRoutes = require('./routes/courseRoutes');
const activityroutes = require('./routes/activityroutes');
const userroutes = require('./routes/userroutes');
const securityroutes = require('./routes/securityroutes');

const http = require('http');
const { Server } = require('socket.io');
const { setSocketIO } = require('./utils/socketEmitter');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

setSocketIO(io);

io.on('connection', (socket) => {
  console.log('⚡ [Socket.io] Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('🔌 [Socket.io] Client disconnected:', socket.id);
  });
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Attach io to request for controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Connect Database and Seed Initial Data
const startServer = async () => {
  await connectdb();
  await seedInitialData();
};
startServer();

// Base Health Check
app.get('/', (req, res) => {
  res.json({
    status: 'Online',
    message: 'Online Exam Panel Backend API is running with Real-Time WebSockets...',
    timestamp: new Date()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/exams', examroutes);
app.use('/api/questions', questionroutes);
app.use('/api/courses', courseRoutes);
app.use('/api/results', resultroutes);
app.use('/api/activities', activityroutes);
app.use('/api/security', securityroutes);
app.use('/api/subjects', subjectroutes);
app.use('/api/answers', answerroutes);
app.use('/api/users', userroutes);

// Backward compatibility for single exam endpoint if requested
app.use('/api/exam', examroutes);

const PORT = process.env.PORT || process.env.port || 3300;
server.listen(PORT, () => {
  console.log(`🚀 Exam Panel Backend running with Socket.io on port ${PORT}`);
});
