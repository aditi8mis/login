const express = require('express');
const cors = require('cors');

// ✅ correct MongoDB connection path
require('./config/db');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/feedback', require('./routes/feedback'));

// Test route
app.get('/', (req, res) => {
  res.send('EmoHeal Backend is Running');
});

// Server start
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
