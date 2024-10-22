const express = require("express");
const TravelStory = require("../models/blogModel");
const User = require("../models/userModel");
const { authenticateToken } = require("../middleware/authenticateToken");
const upload = require("../config/multer");
const router = express.Router();
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
    const page = parseInt(req.query.page) || 1; // Get current page or default to 1
    const limit = 9; // Number of stories per page
    const skip = (page - 1) * limit; // Calculate skip value for pagination

    try {
        // Find all stories created by the authenticated user with pagination
        const stories = await TravelStory.find({ userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get the total number of stories to calculate total pages
        const totalStories = await TravelStory.countDocuments({ userId });
        const totalPages = Math.ceil(totalStories / limit); // Total pages calculation

        // Render the manageStories view and pass the fetched stories and pagination info to the template
        res.render('manageStories', { title: 'Manage Stories', stories, totalPages, currentPage: page });
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
        // Delete the travel story
        await travelStory.deleteOne();
        // console.log(`Deleted story with ID: ${id}`);

        // Redirect to manage stories after successful deletion
        res.redirect('/manage-stories');
    } catch (error) {
        console.error('Error deleting story:', error);
        res.status(500).render('error', { message: 'An error occurred while deleting the story.', error: error.message });
    }
});

// Fetch and render search results 
router.get('/search-results', authenticateToken, async (req, res) => {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1; // Get current page or default to 1
    const limit = 9; // Number of results per page
    const skip = (page - 1) * limit; // Calculate skip value for pagination

    try {
        // Fetch stories matching the search criteria with pagination
        const results = await TravelStory.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { story: { $regex: query, $options: 'i' } },
                { visitedLocation: { $regex: query, $options: 'i' } }
            ]
        })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get the total number of search results for calculating total pages
        const totalStories = await TravelStory.countDocuments({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { story: { $regex: query, $options: 'i' } },
                { visitedLocation: { $regex: query, $options: 'i' } }
            ]
        });
        const totalPages = Math.ceil(totalStories / limit); // Total pages calculation

        res.render('searchResults', {
            title: 'Search Results',
            stories: results,
            query: query,
            totalPages,
            currentPage: page
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
// Route for displaying a specific story
router.get('/story/:id', authenticateToken, async (req, res) => {
    try {
        const story = await TravelStory.findById(req.params.id).populate('comments');
        if (!story) {
            return res.status(404).send('Story not found');
        }
        // Pass the story and user to the template
        res.render('story', { story, user: req.user });
    } catch (error) {
        console.error('Error fetching story:', error);
        res.status(500).send('Server error');
    }
});

// Add comment route
router.post('/comment/:storyId', authenticateToken, async (req, res) => {
    const { storyId } = req.params;
    const { comment } = req.body;
    const { userId } = req.user;// Get the authenticated user's ID

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).send('User not authenticated');
        }

        const story = await TravelStory.findById(storyId);
        if (!story) {
            return res.status(404).send('Story not found');
        }

        const username = `${user.firstName || 'Anonymous'} ${user.secondName || ''}`.trim();
        story.comments.push({
            userId: user._id,
            username: username,
            comment: comment,
            createdAt: new Date(),
        });

        await story.save();
        res.redirect(`/story/${storyId}`);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).send('Server error');
    }
});

// Delete a comment using userId
router.delete('/comment/:storyId', authenticateToken, async (req, res) => {
    const { storyId } = req.params;
    const { userId } = req.user;// Get the userId from the request body

    try {
        // Ensure the authenticated user matches the userId provided
        if (req.user.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Unauthorized action' });
        }

        const story = await TravelStory.findById(storyId);
        if (!story) {
            return res.status(404).json({ message: 'Story not found' });
        }

        // Find the index of the comment made by the current user
        const commentIndex = story.comments.findIndex((comment) => {
            if (comment.userId) {
                return comment.userId.toString() === userId.toString();
            }
            return false;
        });

        if (commentIndex === -1) {
            return res.status(404).json({ message: 'Comment not found for this user' });
        }

        story.comments.splice(commentIndex, 1);
        await story.save();

        res.redirect(`/story/${storyId}`);
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
