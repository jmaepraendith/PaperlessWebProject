const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

exports.signup = async (req, res) => {
    console.log('Signup request received:', req.body);

    const { email, username, password } = req.body;

    // Validate input fields
    if (!email || !username || !password) {
        console.log('Validation failed: All fields are required.');
        return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
        // Check if the username already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            console.log('Existing username:', username);
            return res.status(400).json({ error: 'Username already exists.' });
        }

        // Check if the email already exists
        const existingEmail = await User.findOne({ where: { email } });
        if (existingEmail) {
            console.log('Existing email:', email);
            return res.status(400).json({ error: 'Email already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log('Password hashed successfully:', hashedPassword);

        // Create the new user
        const newUser = await User.create({
            email,
            username,
            password: hashedPassword,
        });

        console.log('New user created:', newUser);
        return res.status(201).json({ message: 'User registered successfully', user: newUser });

    } catch (error) {
        // for debugging
        console.error('Signup error:', error);

        // Return appropriate error response
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Username or email must be unique.' });
        }

        return res.status(500).json({ error: 'Internal server error. Failed to register user.' });
    }
};



exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find user by username
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ error: 'Failed to login' });
    }
};



exports.getAllUsers = async (req, res) => {
    try {
        // Fetch all users from the database
        const users = await User.findAll();
        
        if (users) {
            res.status(200).json(users);
        } else {
            res.status(404).json({ message: 'No users found' });
        }
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};


const verificationCodes = {}; 

exports.resetPassword = async (req, res) => {
    const { username } = req.body;

    try {
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const verificationCode = crypto.randomBytes(3).toString('hex').toUpperCase();
        verificationCodes[username] = verificationCode; // Store code temporarily

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,  
                pass: process.env.EMAIL_PASS,  
            },
        });
        
        const mailOptions = {
            from: process.env.EMAIL_USER,  
            to: user.email,
            subject: 'Password Reset Code',
            text: `Your password reset code is: ${verificationCode}`,
        };
        

        await transporter.sendMail(mailOptions);
        return res.status(200).json({ message: 'Verification code sent to your email' });

    } catch (error) {
        console.error('Error resetting password:', error);
        return res.status(500).json({ error: 'Failed to send verification code' });
    }
};

exports.verifyCodeAndUpdatePassword = async (req, res) => {
    const { username, code, newPassword } = req.body;

    try {
        if (!verificationCodes[username] || verificationCodes[username] !== code) {
            return res.status(400).json({ error: 'Invalid or expired verification code' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password
        await User.update({ password: hashedPassword }, { where: { username } });

        // Remove used verification code
        delete verificationCodes[username];

        return res.status(200).json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ error: 'Failed to update password' });
    }
};
