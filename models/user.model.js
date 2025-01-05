const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        minlength: [6, 'Username must be at least 6 characters long']
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        minlength: [13, 'Email must be at least 13 characters long']

    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: [6, 'Password must be at least 6 characters long']
    },
    // age: {
    //     type: Number,
    //     required: true
    // },
    // gender: {
    //     type: String,
    //     enum: ['male', 'female']
    // }
});

const userModel = mongoose.model('user', userSchema);

module.exports = userModel;