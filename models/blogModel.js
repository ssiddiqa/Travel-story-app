// models/blogModel.js
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const travelStorySchema = new mongoose.Schema({
    title: { type: String, required: true },
    story: { type: String, required: true },
    visitedLocation: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    imageUrl: String,
    createdAt: { type: Date, default: Date.now },
    comments: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            username: String,
            comment: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ]
});
// Add pagination plugin
travelStorySchema.plugin(mongoosePaginate);

const TravelStory = mongoose.model('TravelStory', travelStorySchema);
module.exports = TravelStory;
