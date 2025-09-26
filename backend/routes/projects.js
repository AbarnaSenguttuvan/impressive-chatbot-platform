const express = require('express');
const auth = require('../middleware/auth');
const Project = require('../models/Project');

const router = express.Router();

// Get all projects for user
router.get('/', auth, async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching projects', error: error.message });
  }
});

// Create new project
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, settings } = req.body;

    const project = new Project({
      name,
      description,
      userId: req.user._id,
      settings: settings || {}
    });

    await project.save();
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error creating project', error: error.message });
  }
});

// Get single project
router.get('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching project', error: error.message });
  }
});

// Update project
router.put('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: req.body },
      { new: true }
    );

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Error updating project', error: error.message });
  }
});

// Delete project
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting project', error: error.message });
  }
});

module.exports = router;