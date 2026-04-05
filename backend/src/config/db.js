const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Support multiple environment variable names
        const mongoURI = process.env.MONGO_URI || 
                        process.env.MONGODB_URI || 
                        process.env.MONGODB_URL ||
                        process.env.DATABASE_URL;
        
        if (!mongoURI) {
            console.error('❌ No MongoDB URI found in environment variables');
            console.error('Please set MONGO_URI or MONGODB_URI in your environment');
            process.exit(1);
        }

        // Hide sensitive info in logs
        const sanitizedURI = mongoURI.replace(/(mongodb\+srv:\/\/)([^:]+):([^@]+)@/, '$1***:***@');
        console.log(`🔄 Connecting to MongoDB: ${sanitizedURI}`);

        const conn = await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds
            family: 4, // Use IPv4, skip trying IPv6
            retryWrites: true,
            retryReads: true,
            maxPoolSize: 10, // Maintain up to 10 socket connections
            minPoolSize: 2,
            connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
            heartbeatFrequencyMS: 30000, // Check connection every 30 seconds
        });
        
        console.log('✅ MongoDB connected successfully');
        console.log(`📦 Database: ${conn.connection.name}`);
        console.log(`🌐 Host: ${conn.connection.host}`);
        console.log(`🔢 Port: ${conn.connection.port}`);
        
        // Handle connection events
        mongoose.connection.on('connected', () => {
            console.log('🟢 MongoDB connection established');
        });

        mongoose.connection.on('error', (err) => {
            console.error('🔴 MongoDB connection error:', err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('🟡 MongoDB connection disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('🔄 MongoDB reconnected');
        });

        return conn;
        
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        
        // Don't exit immediately in production, retry
        if (process.env.NODE_ENV === 'production') {
            console.log('🔄 Retrying connection in 5 seconds...');
            setTimeout(connectDB, 5000);
        } else {
            process.exit(1);
        }
    }
};

// Graceful shutdown
const gracefulShutdown = async () => {
    console.log('🛑 Shutting down gracefully...');
    try {
        await mongoose.connection.close();
        console.log('✅ MongoDB connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error closing MongoDB connection:', error);
        process.exit(1);
    }
};

// Handle application termination
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = connectDB;