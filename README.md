# Travel Blog Application

Welcome to the Travel Blog Application! This is a web-based platform where users can share their travel experiences, manage their blog posts, and save their favorite stories. The application is built using Node.js, Express, MongoDB, and EJS templating.

## Features

- **User Authentication:** Create an account, log in, and log out securely.
- **Blog Management:** Users can add, edit, and delete their travel stories.
- **Save Favorite Stories:** Save and unsave favorite travel stories. The saved stories can be viewed on a separate page.
- **Search Stories:** Search for stories based on title, location, or content.
- **Pagination:** Paginated views for managing and viewing stories.
- **Responsive Design:** The application is designed to work on both desktop and mobile devices.

## Technologies Used

- **Backend:** Node.js, Express, MongoDB, Mongoose
- **Frontend:** EJS, Tailwind CSS, JavaScript
- **Authentication:** JSON Web Token (JWT)
- **File Uploads:** Multer and Cloudinary
- **CSS Framework:** Tailwind CSS

## Prerequisites

- [Node.js](https://nodejs.org/en/) (version 14 or above)
- [MongoDB](https://www.mongodb.com/) (Atlas or Local)
- A [Cloudinary](https://cloudinary.com/) account for image storage

## Getting Started

Follow these steps to set up the project locally:

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/travel-blog.git
cd travel-blog


2. Install Dependencies
npm install

3. Configure Environment Variables
PORT=8000
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

4. Run the Application
Start the development server:
npm start
The application will be running at http://localhost:8000.

Key Features
1. User Authentication
Securely create an account, log in, and log out.
Passwords are hashed using bcrypt.
2. Blog Management
Users can add new travel stories, edit existing ones, and delete their stories.
Supports image uploads using Cloudinary.
3. Save and Unsave Favorite Stories
Users can save their favorite stories from the dashboard.
Saved stories are accessible on a separate "Saved Stories" page.
4. Search and Pagination
Search stories by title, location, or content.
Paginated views for managing and viewing stories.
Contributing
If you'd like to contribute to the project, follow these steps:

Fork the repository.
Create a new branch (git checkout -b feature-branch).
Make your changes.
Commit the changes (git commit -m "Add some feature").
Push to the branch (git push origin feature-branch).
Create a new Pull Request.


Acknowledgements
Node.js
Express
MongoDB
Cloudinary
Tailwind CSS
