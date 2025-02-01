const User = require('../models/User');
const bcrypt = require('bcrypt');

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
        // Log error details for debugging
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

        // If password is valid, return success response
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
        
        // If users exist, return them as a response
        if (users) {
            res.status(200).json(users);
        } else {
            res.status(404).json({ message: 'No users found' });
        }
    } catch (error) {
        // Handle any errors
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};