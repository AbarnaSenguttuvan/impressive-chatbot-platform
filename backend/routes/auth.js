const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Input validation middleware
const validateRegisterInput = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ 
      message: 'All fields are required: name, email, password' 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      message: 'Password must be at least 6 characters long' 
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ 
      message: 'Please provide a valid email address' 
    });
  }

  next();
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Register
router.post('/register', validateRegisterInput, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log('Registration attempt:', { name, email, password: '***' });

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create new user
    user = new User({ 
      name: name.trim(), 
      email: email.toLowerCase().trim(), 
      password 
    });

    await user.save();
    console.log('User created successfully:', user.email);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error creating user account', 
      error: error.message 
    });
  }
});

// Login with validation
const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Email and password are required' 
    });
  }

  next();
};

router.post('/login', validateLoginInput, async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log('Login attempt:', { email, password: '***' });

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        subscription: user.subscription
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error during login', 
      error: error.message 
    });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        subscription: req.user.subscription
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error fetching user data' 
    });
  }
});

module.exports = router;