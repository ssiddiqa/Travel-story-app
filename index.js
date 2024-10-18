require("dotenv").config();
const path = require('path');
const express = require("express");
const db_connection = require('./config/db_config');
const userRoutes = require("./routes/userRoutes");
const blogRoutes = require("./routes/blogRoutes");
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts')
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

db_connection();

const app = express();
// Middleware to parse JSON requests
app.use(express.json());
// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Add this middleware to parse cookies
app.use(methodOverride('_method')); // Add this line for method override
// Set the view engine to EJS
app.set('view engine', 'ejs');
// Set views folder
app.set('views', path.join(__dirname, 'views'));
// Use express-ejs-layouts middleware
app.use(expressLayouts);
// Set the default layout file to 'main.ejs'
app.set('layout', 'layouts/main');


//API routes
app.use("", userRoutes);
app.use("", blogRoutes);
app.use("/assets", express.static(__dirname + "/assets"));
app.use("/public", express.static(__dirname + "/public"));

// Root route
app.get("/", (req, res) => {
    // Get the token from cookies
    const token = req.cookies.token;

    // If token exists, verify it
    if (token) {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
            if (err) {
                // If token is invalid or expired, render the homepage
                console.error('Invalid token:', err);
                return res.render('index');
            }

            // If token is valid, redirect to the dashboard
            return res.redirect('/dashboard');
        });
    } else {
        // If no token, render the homepage
        res.render('index', { title: 'Home Page' });
    }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT);

module.exports = app;