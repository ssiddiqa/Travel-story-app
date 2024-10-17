const mongoose = require('mongoose');
require('dotenv').config();  // Load environment variables

const DB_URL = process.env.MONGODB_URL;  // Access the MongoDB URL from the environment variable

function db_connection() {
    mongoose.connect(DB_URL)
        .then(() => console.log("DB connection successful!"))
        .catch(err => console.log(`Error occurred: ${err}`));  // Correct template literal syntax
}

module.exports = db_connection;
