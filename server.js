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

// Email Transporter (use environment variables for credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    // user: process.env.GMAIL_USER || 'rockingharsh305@gmail.com',
    // pass: process.env.GMAIL_APP_PASSWORD || 'YOUR_APP_PASSWORD'
    user: 'rockingharsh305@gmail.com',
    pass: 'nxfx upza tqum copf'
  }
});

// Routes

 

// Entry (Login or Register) - also send notification email
app.post('/api/entry', async (req, res) => {
  const { name, email } = req.body;
  try {
    let user = await User.findOne({ email });
    
    if (!user) {
      user = new User({ name, email });
      await user.save();
    }

    // Send Email Notification for any entry (new or existing)
    const mailOptions = {
      from: 'rockingharsh305@gmail.com',
      to: 'govindg@iisc.ac.in',
      subject: 'User Entry - Gas Carburizing Software',
      text: `A user has used the software.\n\nName: ${name}\nEmail: ${email}\n\nTimestamp: ${new Date().toISOString()}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email:', error);
      } else {
        console.log('Email sent:', info.response);
      }
    });

    res.status(200).json({ message: 'Success', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
