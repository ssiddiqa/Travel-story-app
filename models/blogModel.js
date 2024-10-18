// models/blogModel.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const travelStorySchema = new mongoose.Schema({
    title: String,
    story: String,
    visitedLocation: String,
    userId: mongoose.Schema.Types.ObjectId,
    imageUrl: String,
    createdAt: { type: Date, default: Date.now },
});

// Add pagination plugin
travelStorySchema.plugin(mongoosePaginate);

const TravelStory = mongoose.model('TravelStory', travelStorySchema);
module.exports = TravelStory;
