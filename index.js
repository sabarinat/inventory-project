require('dotenv').config();

const express = require('express');

const userRoutes = require('./routes/user-routes');
const productRoutes = require('./routes/product-routes');
const billingRoutes = require('./routes/billing-routes');

const app = express();

app.use(express.json());

// Register routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/bills', billingRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});