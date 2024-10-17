const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const TravelStory = require("../models/blogModel");
const { authenticateToken } = require("../middleware/authenticateToken");
const router = express.Router();

// Create Account
router.post("/create-account", async (req, res) => {
    const { firstName, secondName, email, password } = req.body;

    // Validate input
    if (!firstName || !secondName || !email || !password) {
        return res.render('signup', {
            title: 'Sign Up',
            error: "All fields are required"
        });
    }

    // Check if the user already exists
    const isUser = await User.findOne({ email });
    if (isUser) {
        return res.render('signup', {
            title: 'Sign Up',
            error: "User already exists"
        });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
        firstName,
        secondName,
        email,
        password: hashedPassword,
    });

    try {
        // Save the new user
        await user.save();

        // Generate JWT token
        const accessToken = jwt.sign(
            { userId: user._id },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "72h" }
        );

        // Set the token as an HttpOnly cookie
        res.cookie('token', accessToken, { httpOnly: true, maxAge: 72 * 60 * 60 * 1000 });

        // Redirect to dashboard
        return res.redirect('/dashboard');
    } catch (error) {
        console.error("Error saving user:", error);
        return res.render('signup', {
            title: 'Sign Up',
            error: "An error occurred. Please try again."
        });
    }
});

router.get('/signup', (req, res) => {
    res.render('signup', { title: 'Sign Up' });
});


router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    // Check if all fields are provided
    if (!email || !password) {
        return res.render('signin', {
            title: 'Sign In',
            error: "Please fill in both email and password."
        });
    }

    // Find the user
    const user = await User.findOne({ email });
    if (!user) {
        return res.render('signin', {
            title: 'Sign In',
            error: "User not found."
        });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.render('signin', {
            title: 'Sign In',
            error: "Invalid credentials."
        });
    }

    // Generate JWT token
    const accessToken = jwt.sign({ userId: user._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "24h" });

    // Set the token as an HttpOnly cookie
    res.cookie('token', accessToken, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }); // 1 day expiration

    // Redirect to dashboard
    res.redirect('/dashboard');
});

// Render Sign In Page
router.get('/signin', (req, res) => {
    res.render('signin', { title: 'Sign In' });
});

// Dashboard Route
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {

        // Fetch the user based on userId
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Fetch all travel stories from the database
        const allStories = await TravelStory.find().sort({ createdAt: -1 });

        // Render the dashboard and pass the user and stories data
        res.render('dashboard', {
            title: 'Dashboard',
            user: user, // Pass the full user object
            stories: allStories // Pass the fetched stories to the template
        });
    } catch (error) {
        console.error("Error fetching stories for dashboard:", error);
        return res.status(500).json({ message: "Server error" });
    }
});


// Logout Route - Clear the token cookie
router.get('/logout', (req, res) => {
    // Clear the token cookie by setting it to an empty value with immediate expiration
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout successful' });
});
// Route to get user info
router.get("/get-user", authenticateToken, async (req, res) => {
    try {
        const { userId } = req.user; // req.user is set by authenticateToken middleware

        // Find the user in the database by ID
        const isUser = await User.findById(userId);

        // Check if the user exists
        if (!isUser) {
            return res.status(401).json({ message: "User not found or unauthorized." });
        }

        // Return user data (ensure sensitive data like password is not sent)
        return res.json({
            user: {
                firstName: isUser.firstName,
                secondName: isUser.secondName,
                email: isUser.email,
                // Add any other non-sensitive fields you'd like to return
            },
            message: "User data retrieved successfully."
        });
    } catch (error) {
        console.error("Error retrieving user:", error);
        return res.status(500).json({ message: "Server error." });
    }
});

// Route to get all users
router.get("/get-all-users", authenticateToken, async (req, res) => {
    try {
        // Find all users, exclude sensitive fields like password
        const users = await User.find({}, { password: 0 });

        // Check if there are users
        if (!users || users.length === 0) {
            return res.status(404).json({ message: "No users found." });
        }

        // Return the list of users
        return res.json({
            users: users.map(user => ({
                firstName: user.firstName,
                secondName: user.secondName,
                email: user.email,
                // Add any other fields you want to return, like role or profile info
            })),
            message: "Users retrieved successfully."
        });
    } catch (error) {
        console.error("Error retrieving users:", error);
        return res.status(500).json({ message: "Server error." });
    }
});

// Logout Route
router.post('/logout', (req, res) => {
    // Clear the cookie containing the token
    res.clearCookie('token');

    // Redirect to the login page after logout
    res.redirect('/signin');
});

module.exports = router;