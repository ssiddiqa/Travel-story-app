const express = require("express");
const TravelStory = require("../models/blogModel");
const { authenticateToken } = require("../middleware/authenticateToken");
const upload = require("../config/multer");
const router = express.Router();
const fs = require("fs");
const path = require('path');
// Add Travel Story
router.post('/add-travel-story', authenticateToken, upload.single('image'), async (req, res) => {
    const { title, story, visitedLocation } = req.body;
    const { userId } = req.user;

    // Validate required fields
    if (!title || !story || !visitedLocation || !req.file) {
        return res.status(400).render('add-blog', {
            title: 'Add a New Blog',
            error: 'All fields are required',
        });
    }

    try {
        const imageUrl = req.file.path; // Cloudinary image URL

        // Save the new travel story
        const travelStory = new TravelStory({
            title,
            story,
            visitedLocation,
            userId,
            imageUrl,
        });
        await travelStory.save();

        res.redirect('/dashboard'); // Redirect to dashboard
    } catch (error) {
        console.error(error);
        res.status(500).render('add-blog', {
            title: 'Add a New Blog',
            error: 'An unexpected error occurred. Please try again.',
        });
    }
}
);
// Render the Add Blog page
router.get("/add-blog", authenticateToken, (req, res) => {
    res.render("addBlog", { title: "Add a New Blog" });
});


// Post method to update a specific story
router.post('/edit-story/:id', authenticateToken, upload.single('image'),
    async (req, res) => {
        const { id } = req.params;
        const { title, story, visitedLocation } = req.body;
        const { userId } = req.user;

        if (!title || !story || !visitedLocation) {
            return res.status(400).render('editBlog', {
                title: 'Edit Blog',
                error: 'All fields are required',
                story: { _id: id, title, story, visitedLocation },
            });
        }

        try {
            const travelStory = await TravelStory.findOne({ _id: id, userId });
            if (!travelStory) {
                return res.status(404).render('error', { message: 'Story not found' });
            }

            // Update story and image if a new image is uploaded
            travelStory.title = title;
            travelStory.story = story;
            travelStory.visitedLocation = visitedLocation;

            if (req.file) {
                travelStory.imageUrl = req.file.path; // Cloudinary image URL
            }

            await travelStory.save();
            res.redirect('/dashboard');
        } catch (error) {
            console.error(error);
            res.status(500).render('editBlog', {
                title: 'Edit Blog',
                error: 'Server error occurred. Please try again.',
                story: { _id: id, title, story, visitedLocation, imageUrl: travelStory.imageUrl },
            });
        }
    }
);
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
            // console.log(`Attempting to delete image at: ${filePath}`); // Log the file path

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath); // Delete the image file
                // console.log(`Deleted image: ${filePath}`);
            } else {
                // console.log(`Image not found: ${filePath}`);
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
