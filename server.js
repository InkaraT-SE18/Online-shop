const express = require('express');
const path = require('path');
const Product = require("./models/Product"); 
const ordersRouter = require('./routes/orders');
const mongoose = require('./config/mongo'); 
const productRoutes = require('./routes/Product');
const cors = require('cors'); 
const app = express();
const morgan = require("morgan");
require('dotenv').config();


app.use(cors({
  origin: process.env.CLIENT_URL || '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(morgan('dev'));
app.use(express.json());

app.use('/api/products', productRoutes);
app.use("/api/auth", require("./routes/authRoutes"));
app.use('/api/orders', ordersRouter);
app.use("/api/payments", require("./routes/paymentRoute"));


app.use(express.static(path.join(__dirname, "public"))); 

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер работает на http://localhost:${PORT}`);
});
