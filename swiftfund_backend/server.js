const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const session = require('express-session');
const userRoutes = require('./routes/userRoutes');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Enable CORS for your frontend URL
const allowedOrigins = [process.env.FRONTEND_URL]; // Add more URLs if needed
const corsOptions = {
  origin: allowedOrigins,
  credentials: true, // Allow cookies and credentials
};
app.use(cors(corsOptions));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'defaultsecret', // Use a strong secret in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Use secure cookies in production
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// MongoDB connection
const mongoURI = process.env.MONGO_URI; // Ensure your .env file has the MONGO_URI variable
mongoose
  .connect(mongoURI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit the application if the connection fails
  });

// Root route
app.get("/", (req, res) => {
  res.send("Welcome to the SwiftFund Backend API!");
});

// Routes
app.use('/api/users', userRoutes);

// Error handling middleware
app.use(errorHandler);

// Server setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});