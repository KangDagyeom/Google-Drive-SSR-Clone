const express = require('express');
const morgan = require('morgan');
const app = express();
const userModel = require('./models/User');
const dbConnection = require('./config/db');
const Joi = require('joi');
const userRoutes = require('./routes/user.routes');


app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/user', userRoutes);


app.listen(3000)
