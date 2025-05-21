const express = require('express');
const sequelize = require('./config/database');
const kmDetectDataRoutes = require('./routes/kmDetectDataRoutes');

const app = express();

app.use(express.json());
app.use('/api/km-detect-data', kmDetectDataRoutes);

// Database connection and server start
sequelize.sync().then(() => {
  console.log('Database connected');
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Database connection failed:', err);
});