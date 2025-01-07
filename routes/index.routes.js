const express = require('express');
const router = express.Router();
const multer = require('multer');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config(); // Load biến môi trường từ file .env

// URL và Key của dự án Supabase từ biến môi trường
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);
const upload = multer();

router.get('/home', (req, res) => {
    res.render('home');
});

router.post('/upload-file', upload.single('file'), async (req, res) => {
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

        res.status(200).send('File uploaded successfully.');
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred while uploading the file.');
    }
});

module.exports = router;