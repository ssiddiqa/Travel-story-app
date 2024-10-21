const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userSchema = new Schema({
    firstName: { type: String, required: true },
    secondName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdOn: { type: Date, default: Date.now },
    savedStories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TravelStory' }]
});
module.exports = mongoose.model("User", userSchema);