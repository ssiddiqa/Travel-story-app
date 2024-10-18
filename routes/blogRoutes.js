const express = require("express");
const TravelStory = require("../models/blogModel");
const { authenticateToken } = require("../middleware/authenticateToken");
const upload = require("../config/multer");
const router = express.Router();
const fs = require("fs");
const path = require('path');
// Add Travel Story
router.post("/add-travel-story", authenticateToken, upload.single("image"), async (req, res) => {
    const { title, story, visitedLocation } = req.body;
    const { userId } = req.user;

    // Validate required fields
    if (!title || !story || !visitedLocation || !req.file) {
        return res.status(400).render('add-blog', { title: 'Add a New Blog', error: "All fields are required" });
    }

    try {
        // Create the image URL
        const imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;

        // Save the new travel story
        const travelStory = new TravelStory({
            title,
            story,
            visitedLocation,
            userId,
            imageUrl,
        });
        await travelStory.save();

        // Redirect to the dashboard after adding the blog
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).render('add-blog', { title: 'Add a New Blog', error: "An unexpected error occurred. Please try again." });
    }
});

// Render the Add Blog page
router.get("/add-blog", authenticateToken, (req, res) => {
    res.render("addBlog", { title: "Add a New Blog" });
});

// Get Stories
router.get("/get-stories", authenticateToken, async (req, res) => {
    const { userId } = req.user;
    try {
        const travelStories = await TravelStory.find({ userId }).sort({ isFavourite: -1 });
        res.status(200).json({ stories: travelStories });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: true, message: error.message });
    }
});


// Post method to update a specific story
router.post('/edit-story/:id', authenticateToken, upload.single("image"), async (req, res) => {
    const { id } = req.params;
    const { title, story, visitedLocation } = req.body;
    const { userId } = req.user;

    // Validate required fields
    if (!title || !story || !visitedLocation) {
        return res.status(400).render('editBlog', {
            title: 'Edit Blog',
            error: 'All fields are required',
            story: { _id: id, title, story, visitedLocation }
        });
    }

    try {
        const travelStory = await TravelStory.findOne({ _id: id, userId });
        if (!travelStory) {
            return res.status(404).render('error', { message: 'Travel story not found' });
        }

        // Update story details
        travelStory.title = title;
        travelStory.story = story;
        travelStory.visitedLocation = visitedLocation;

        // Update the image URL if a new image is uploaded
        if (req.file) {
            travelStory.imageUrl = `http://localhost:8000/uploads/${req.file.filename}`;
        }

        await travelStory.save();
        res.redirect('/dashboard'); // Redirect to dashboard after successful update
    } catch (error) {
        console.error(error);
        res.status(500).render('editBlog', {
            title: 'Edit Blog',
            error: 'Server error occurred. Please try again.',
            story: { _id: id, title, story, visitedLocation, imageUrl: travelStory.imageUrl }
        });
    }
});


// Get method to render the edit story page
router.get('/edit-story/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { userId } = req.user;

    try {
        const travelStory = await TravelStory.findOne({ _id: id, userId });
        if (!travelStory) {
            return res.status(404).render('error', { message: 'Travel story not found' });
        }

        res.render('editBlog', { title: 'Edit Blog', story: travelStory });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Server error occurred' });
    }
});


// Get method to render the manage stories page
router.get('/manage-stories', authenticateToken, async (req, res) => {
    const { userId } = req.user;

    try {
        // Find all stories created by the authenticated user
        const stories = await TravelStory.find({ userId }).sort({ createdAt: -1 });

        // Render the manageStories view and pass the fetched stories to the template
        res.render('manageStories', { title: 'Manage Stories', stories });
    } catch (error) {
        console.error(error);
        res.status(500).render('error', { message: 'Server error occurred' });
    }
});

// Delete Travel Story
router.delete('/delete-story/:id', authenticateToken, async (req, res) => {
    const { id } = req.params; // Extract story ID
    const { userId } = req.user; // Extract user ID

    try {
        // Check if the travel story exists
        const travelStory = await TravelStory.findOne({ _id: id, userId });
        if (!travelStory) {
            return res.status(404).render('manageStories', {
                title: 'Manage Stories',
                error: 'Travel story not found',
            });
        }

        // Attempt to delete the image associated with the travel story
        const imageUrl = travelStory.imageUrl;
        if (imageUrl) {
            const filename = path.basename(imageUrl);
            const filePath = path.join(__dirname, '../uploads', filename);
            console.log(`Attempting to delete image at: ${filePath}`); // Log the file path

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Delete the image file
                console.log(`Deleted image: ${filePath}`);
            } else {
                console.log(`Image not found: ${filePath}`);
            }
        }

        // Delete the travel story
        await travelStory.deleteOne();
        console.log(`Deleted story with ID: ${id}`);

        // Redirect to manage stories after successful deletion
        res.redirect('/manage-stories');
    } catch (error) {
        console.error('Error deleting story:', error);
        res.status(500).render('error', { message: 'An error occurred while deleting the story.', error: error.message });
    }
});

// Get all travel stories (for admin or general viewing purposes)
router.get("/get-all-stories", authenticateToken, async (req, res) => {
    try {
        // Find all stories in the TravelStory collection
        const allStories = await TravelStory.find().sort({ createdAt: -1 }); // Sort by newest first, if needed

        // Return the list of stories
        res.status(200).json({
            stories: allStories,
            message: "All stories retrieved successfully"
        });
    } catch (error) {
        console.error("Error fetching all stories:", error);
        res.status(500).json({
            error: true,
            message: "Error retrieving stories"
        });
    }
});

// Fetch and render search results based on the query
router.get('/search-results', authenticateToken, async (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.render('searchResults', {
            title: 'Search Results',
            stories: [],
            query: ''
        });
    }

    try {
        // Fetch stories matching the search criteria
        const results = await TravelStory.find({

            $or: [
                { title: { $regex: query, $options: 'i' } },
                { story: { $regex: query, $options: 'i' } },
                { visitedLocation: { $regex: query, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });

        res.render('searchResults', {
            title: 'Search Results',
            stories: results,
            query: query
        });
    } catch (error) {
        console.error('Error fetching search results:', error);
        res.status(500).render('searchResults', {
            title: 'Search Results',
            stories: [],
            query: query,
            error: 'An error occurred while searching. Please try again.'
        });
    }
});


module.exports = router;
