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

router.get('/download/:path(*)', authMiddleware, async (req, res) => {
    const { path } = req.params;
    console.log('Download path:', path);

    try {
        const { data, error } = await supabase
            .storage
            .from('test')
            .download(path);

        if (error) {
            console.error('Error downloading file from Supabase:', error);
            return res.status(500).send('An error occurred while downloading the file from Supabase.');
        }

        if (!data) {
            console.error('No data returned from Supabase');
            return res.status(500).send('No data returned from Supabase.');
        }

        const buffer = await data.arrayBuffer();
        const fileName = path.split('/').pop();

        res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error('Error occurred while downloading the file:', error);
        res.status(500).send('An error occurred while downloading the file.');
    }
});

router.get('/list-files', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .storage
            .from('test')
            .list('uploads', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
            })

        if (error) {
            console.error('Error listing files from Supabase:', error);
            return res.status(500).send('An error occurred while listing files from Supabase.');
        }

        res.json(data);

    } catch (error) {
        console.error('Error occurred while listing files:', error);
        res.status(500).send('An error occurred while listing files.');
    }
});

router.get('/get-file/:name', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .storage
            .from('test')
            .list('uploads', {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
                search: req.params.name
            })
        if (error) {
            console.error('Error listing files from Supabase:', error);
            return res.status(500).send('An error occurred while listing files from Supabase.');
        }
        res.json(data);
    } catch (error) {
        console.error('Error occurred while listing files:', error);
        res.status(500).send('An error occurred while listing files.');
    }
});

router.delete('/delete-file/:path(*)', authMiddleware, async (req, res) => {
    const { path: filePath } = req.params;
    try {
        const { data, error } = await supabase
            .storage
            .from('test')
            .remove([filePath]);
        if (error) {
            console.error('Error deleting file from Supabase:', error);
            return res.status(500).send('An error occurred while deleting file from Supabase.');
        }
        const file = await fileModel.findOneAndDelete({ path: filePath });
        console.log('File deleted from MongoDB:', file);
        console.log('Object data: ', data);
        res.status(200).send('File deleted successfully.');
    } catch (error) {
        console.error('Error occurred while deleting file:', error);
        res.status(500).send('An error occurred while deleting file.');
    }
});

router.get('/buckets-list', authMiddleware, async (req, res) => {
    try {
        const { data, error } = await supabase
            .storage
            .listBuckets()

        if (error) {
            console.error('Error listing buckets from Supabase:', error);
            return res.status(500).send('An error occurred while listing buckets from Supabase.');
        }
        res.json(data);
    } catch (error) {
        console.error('Error occurred while listing buckets:', error);
        res.status(500).send('An error occurred while listing buckets.');
    }
});
module.exports = router;