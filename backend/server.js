const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// API Route Bindings
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/borrow', require('./routes/borrowRoutes'));
app.use('/api/items', require('./routes/itemRoutes'));
app.use('/api/property-assignments', require('./routes/propertyAssignmentRoutes'));
app.use('/api/rooms', require('./routes/roomRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});