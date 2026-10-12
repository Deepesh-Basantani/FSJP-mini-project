const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
const INTERNAL_SECRET = process.env.INTERNAL_SECRET || 'foodrescue_shared_secret_2026';

app.use(cors({
    origin: [FRONTEND_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true
}));
app.use(express.json());

// Setup Socket.IO
const io = new Server(server, {
    cors: {
        origin: [FRONTEND_ORIGIN, 'http://localhost:3000', 'http://127.0.0.1:5173'],
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// User room mapping
io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Client registers with its userId
    socket.on('join', (data) => {
        const userId = typeof data === 'object' ? data.userId : data;
        if (userId) {
            const roomName = `user_${userId}`;
            socket.join(roomName);
            console.log(`[Socket.IO] Client ${socket.id} joined room ${roomName}`);
            socket.emit('joined', { room: roomName, message: 'Subscribed to live notifications' });
        }
    });

    socket.on('disconnect', () => {
        console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
});

// Middleware for Spring Boot internal webhook authentication
function verifyInternalSecret(req, res, next) {
    const providedSecret = req.headers['x-internal-secret'];
    if (!providedSecret || providedSecret !== INTERNAL_SECRET) {
        return res.status(403).json({ error: 'Forbidden: Invalid internal secret key' });
    }
    next();
}

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'UP',
        service: 'Food Rescue Real-Time Notification Companion Service',
        connections: io.engine.clientsCount
    });
});

// POST /internal/notify - Webhook called by Spring Boot REST API
app.post('/internal/notify', verifyInternalSecret, (req, res) => {
    const { userId, type, message, entityId } = req.body;

    if (!userId || !message) {
        return res.status(400).json({ error: 'Missing required fields: userId, message' });
    }

    const payload = {
        userId,
        type: type || 'ALERT',
        message,
        entityId: entityId || null,
        timestamp: new Date().toISOString()
    };

    const roomName = `user_${userId}`;
    console.log(`[Notification] Pushing live event to ${roomName}:`, payload);
    io.to(roomName).emit('notification', payload);

    return res.status(200).json({ success: true, deliveredTo: roomName });
});

server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`Food Rescue Notification Service running on port ${PORT}`);
    console.log(`Socket.IO listening for frontend connections`);
    console.log(`Internal webhook active at POST /internal/notify`);
    console.log(`=======================================================`);
});
