const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { initWebSocketServer } = require('./config/websocket');
const { initWebSocketManager } = require('./websocket/handlers');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');
const optionChainRoutes = require('./routes/optionChainRoutes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Define routes
app.use('/api/option-chain', optionChainRoutes);

// Basic health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Catch-all route for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Set port
const PORT = process.env.PORT || 5000;
const WS_PORT = process.env.WS_PORT || 5001;

// Create HTTP server for WebSocket
const server = http.createServer(app);

// Start the server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Initialize WebSocket server
    const wss = initWebSocketServer(server);
    
    // Initialize WebSocket manager
    initWebSocketManager(wss);
    
    // Start HTTP server
    server.listen(WS_PORT, () => {
      logger.info(`WebSocket server running on port ${WS_PORT}`);
    });
    
    // Start Express server
    app.listen(PORT, () => {
      logger.info(`API server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
  } catch (error) {
    logger.error(`Server startup error: ${error.message}`);
    process.exit(1);
  }
};

// Run the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});