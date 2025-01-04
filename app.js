const express = require('express');
const morgan = require('morgan');
const app = express();
const userModel = require('./models/User');
const dbConnection = require('./config/db');
const Joi = require('joi');

app.use(morgan('dev'));
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('register');
});


app.get('/about', (req, res) => {
    res.send('About Us');
});

app.get('/get-form-data', (req, res) => {
    console.log(req.body);
    res.send('GET request received');
});

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    await userModel.create({
        username: username,
        email: email,
        password: password
    })

    res.send('POST request received');
});

app.get('/get-users', async (req, res) => {
    userModel.find().then((users) => {
        res.json(users);
    })
});

app.put('/update-user/:id', async (req, res) => {
    const schema = Joi.object({
        username: Joi.string().min(3).required(),
        email: Joi.string().email({ tlds: { allow: false } }).required(),
        password: Joi.string().min(6).required()
    });

    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const user = await userModel.findByIdAndUpdate(req.params.id, req.body);
        res.send('User updated');
    } catch (error) {
        res.status(500).send(error.message);
    }
});
app.delete('/delete-user/:id', async (req, res) => {
    const schema = Joi.object({
        id: Joi.string().required()
    });
    const { error } = schema.validate(req.params);
    if (error) return res.status(400).send(error.details[0].message);

    try {
        const user = await userModel.findById(req.params.id);
        if (!user) {
            return res.status(404).send('User not found');
        }

        await userModel.findByIdAndDelete(req.params.id);
        res.send('User deleted');
    } catch (error) {
        res.status(500).send(error.message);
    }
});
app.listen(3000)
