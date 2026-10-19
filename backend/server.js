const express = require('express');
const cors = require('cors');
require('dotenv').config();
require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

// Import All Feature Routes
const equipmentRoutes = require('./routes/equipmentRoutes');
const borrowerRoutes = require('./routes/borrowerRoutes');
const borrowRoutes = require('./routes/borrowRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const authRoutes = require('./routes/authRoutes');

// Mount Routes
app.use('/api/equipment', equipmentRoutes);
app.use('/api/borrowers', borrowerRoutes);
app.use('/api/borrow', borrowRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('School Equipment Inventory API is running...');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});