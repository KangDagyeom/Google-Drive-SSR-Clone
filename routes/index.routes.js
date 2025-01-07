const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const fileModel = require('../models/files.model');
const authMiddleware = require('../middleware/auth');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const upload = multer();

router.get('/home', authMiddleware, async (req, res) => {
    try {
        const userFiles = await fileModel.find({ user: req.user.userid });
        console.log(userFiles);
        res.render('home', {
            files: userFiles
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while fetching files.');
    }
});

router.post('/upload-file', authMiddleware, upload.single('file'), async (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        const { data, error } = await supabase.storage
            .from('test') 
            .upload(`uploads/${file.originalname}`, file.buffer, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            throw error;
        }

        // Lưu thông tin file vào MongoDB
        const newFile = new fileModel({
            path: data.path,
            originalname: file.originalname,
            user: req.user.userid
        });

        await newFile.save();

        console.log('File saved to MongoDB:', newFile);

        res.status(200).send('File uploaded successfully.');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while uploading the file.');
    }
});

module.exports = router;