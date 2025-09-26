const express = require('express');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const Project = require('../models/Project');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|txt|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and text documents are allowed'));
    }
  }
});

// Upload file to project
router.post('/:projectId', auth, upload.single('file'), async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.projectId, 
      userId: req.user._id 
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    project.files.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path
    });

    await project.save();

    res.json({ 
      message: 'File uploaded successfully',
      file: {
        filename: req.file.filename,
        originalName: req.file.originalname,
        path: req.file.path
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

module.exports = router;