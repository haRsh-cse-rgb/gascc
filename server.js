const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = "mongodb+srv://swarajk:XWqJRrKvUsQGNDRL@stis-v.ubj0c.mongodb.net/STISV?retryWrites=true&w=majority&appName=STIS-V";

mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
}, { collection: 'gascUsers' });

const User = mongoose.model('User', userSchema);

// Email Transporter (Configure with your credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rockingharsh305@gmail.com', // Using the receiver as sender for now
    pass: 'YOUR_APP_PASSWORD' // User needs to provide this
  }
});

// Routes

// Check if email exists (Login)
app.post('/api/login', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      return res.status(200).json({ exists: true, user });
    } else {
      return res.status(404).json({ exists: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Register User
app.post('/api/register', async (req, res) => {
  const { name, email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({ name, email });
    await newUser.save();

    // Send Email Notification
    const mailOptions = {
      from: 'rockingharsh305@gmail.com',
      to: 'rockingharsh305@gmail.com',
      subject: 'New User Registration - Gas Carburizing Software',
      text: `A new user has registered.\n\nName: ${name}\nEmail: ${email}\n\nPlease check the dashboard.`
    };

    // Note: Email sending is asynchronous, we don't block response
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Entry (Login or Register)
app.post('/api/entry', async (req, res) => {
  const { name, email } = req.body;
  try {
    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({ name, email });
      await user.save();

      // Send Email Notification for new user
      const mailOptions = {
        from: 'rockingharsh305@gmail.com',
        to: 'rockingharsh305@gmail.com',
        subject: 'New User Entry - Gas Carburizing Software',
        text: `A new user has entered.\n\nName: ${name}\nEmail: ${email}\n\nPlease check the dashboard.`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }

    res.status(200).json({ message: 'Success', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
