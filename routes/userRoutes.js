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

        // Pagination setup
        const page = parseInt(req.query.page) || 1; // Current page number from the query string
        const limit = 9; // Number of stories per page
        const skip = (page - 1) * limit; // Calculate how many stories to skip

        // Fetch stories with pagination
        const totalStories = await TravelStory.countDocuments(); // Total number of stories
        const stories = await TravelStory.find().sort({ createdAt: -1 }).skip(skip).limit(limit);

        // Render the dashboard and pass the user and stories data
        res.render('dashboard', {
            title: 'Dashboard',
            user: user, // Pass the full user object
            stories: stories, // Pass the fetched stories to the template
            currentPage: page,
            totalPages: Math.ceil(totalStories / limit), // Total pages calculated
        });
    } catch (error) {
        console.error("Error fetching stories for dashboard:", error);
        return res.status(500).json({ message: "Server error" });
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