const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const { apiLimiter, sanitizeInput } = require('./middleware/security');
// Initialize cron jobs later after Socket.io is ready
require('dotenv').config();

// Connect to MongoDB
connectDB();

const app = express();
const server = require('http').createServer(app);
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001'
].filter(Boolean);

const io = require('socket.io')(server, {
  cors: {
    origin: true,
    credentials: true
  }
});
const PORT = process.env.PORT || 5000;

// Export io for use in routes
app.set('io', io);

// Initialize services that need Socket.io
require('./services/reportService').init(io);

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log('Client connected to socket:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Security middleware
app.use(apiLimiter);
app.use(sanitizeInput);

// CORS middleware
app.use(cors({
  origin: true, // Allow all origins in development to fix NetworkError
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/admissions', require('./routes/admissions'));
app.use('/api/queries', require('./routes/queries'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/achievements', require('./routes/achievements'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/grades', require('./routes/grades'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'School CEO Backend is running' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});