const express = require('express');
const routes = express.Router();
const userModel = require('../models/User');
const Joi = require('joi');

routes.get('/register', (req, res) => {
    res.render('register');
});

routes.post('/register', async (req, res) => {
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
        const user = await userModel.create(req.body);
        console.log(req.body);
        res.send('Data received');
    } catch (error) {
        console.log(error);
        res.send('An error occured');
    }
});

module.exports = routes;