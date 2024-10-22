# Travel Blog Application

Welcome to the Travel Blog Application! This is a web-based platform where users can share their travel experiences, manage their blog posts, and save their favorite stories. The application is built using Node.js, Express, MongoDB, and EJS templating.

## Features

- **User Authentication:** Create an account, log in, and log out securely.
- **Blog Management:** Users can add, edit, and delete their travel stories.
- **Comments Management:** Users can add comments on stories, view comments, and delete their own comments.
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
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add the following environment variables:

```plaintext
PORT=8000
MONGODB_URI=your_mongodb_connection_string
ACCESS_TOKEN_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Replace the placeholder values with your actual configuration.

### 4. Run the Application

Start the development server:

```bash
npm start
```
The application will be running at [http://localhost:8000](http://localhost:8000).


### 5. Demo SignIn
- email: siddiqasayma@gmail.com
- password: 55566121


## Key Features

### 1. User Authentication

- Securely create an account, log in, and log out.
- Passwords are hashed using bcrypt for security.

### 2. Blog Management

- Users can add new travel stories, edit existing ones, and delete their stories.
- Supports image uploads using Cloudinary for storing and serving images.

### 3.Comments Management

- Users can add comments on any travel story.
- Users can delete their own comments, ensuring they have control over their contributions.
- The number of comments for each story is displayed, providing a quick overview of user engagement.

### 4. Save and Unsave Favorite Stories

- Users can save their favorite stories from the dashboard.
- Saved stories are accessible on a separate "Saved Stories" page.
- The save/unsave button dynamically updates based on the story's saved status.

### 5. Search and Pagination

- Search for stories by title, location, or content.
- Paginated views for managing and viewing stories.

## Contributing

If you'd like to contribute to the project, follow these steps:

1. **Fork the repository.**
2. **Create a new branch** (`git checkout -b feature-branch`).
3. **Make your changes.**
4. **Commit the changes** (`git commit -m "Add some feature"`).
5. **Push to the branch** (`git push origin feature-branch`).
6. **Create a new Pull Request.**

## Acknowledgements

- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Cloudinary](https://cloudinary.com/)
- [Tailwind CSS](https://tailwindcss.com/)


