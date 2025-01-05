const express = require('express');
const routes = express.Router();
const userModel = require('../models/user.model');
const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');


dotenv.config();

routes.get('/register', (req, res) => {
    res.render('register');
});

routes.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    // Xác thực dữ liệu đầu vào
    const schema = Joi.object({
        username: Joi.string().required(),
        email: Joi.string().email({ tlds: { allow: false } }).required(),
        password: Joi.string().required(),
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    try {

        const existingUser = await userModel.findOne({
            $or: [{ username: username }, { email: email }]
        });

        if (existingUser) {
            if (existingUser.email === email) {
                return res.status(400).send('User email already exists');
            } else if (existingUser.username === username) {
                return res.status(400).send('Username already exists');
            }
        }


        const user = await userModel.create({
            username,
            email,
            password: hashedPassword
        });
        console.log(req.body);
        res.status(200).send('User created');
    } catch (error) {
        console.log(error);
        res.status(500).send('An error occurred');
    }
});

routes.put('/update-user/:id', async (req, res) => {
    const schema = Joi.object({
        username: Joi.string().required(),
        email: Joi.string().email({ tlds: { allow: false } }).required(),
        password: Joi.string().min(6).required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    try {
        const user = await userModel.findByIdAndUpdate(req.params.id, req.body);
        console.log(req.body);
        res.send('Data updated');
    } catch (error) {
        console.log(error);
        res.send('An error occured');

    }
});
routes.delete('/delete-user/:id', async (req, res) => {
    try {
        const user = await userModel.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }
        res.send('User deleted');
    } catch (error) {
        console.log(error);
        res.send('An error occurred');
    } finally {
        console.log('Delete user request processed');
    }
});
routes.get('/get-users', async (req, res) => {
    try {
        const user = await userModel.find({});
        res.send(user);
    } catch (error) {
        console.log(error);
        res.send('An error occurred');
    }
    finally {
        console.log('Get users request processed');
    }
});

routes.get('/login', (req, res) => {
    res.render('login');
});

routes.post('/login', async (req, res) => {
    const schema = Joi.object({
        username: Joi.string().optional(),
        password: Joi.string().min(5).required(),
    });

    const { error } = schema.validate(req.body);

    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    const { username, password } = req.body;

    try {
        // Tìm người dùng bằng username hoặc email
        const user = await userModel.findOne({
            username: username,
        });

        if (!user) {
            return res.status(400).send('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }

        const token = jwt.sign({
            userid: user._id,
            email: user.email,
            username: user.username
        }, process.env.JWT_SECRET);

        res.cookie('token', token);
        res.send('Logged in');
    } catch (error) {
        console.log(error);
        res.status(500).send('An error occurred');
    }
});

module.exports = routes;