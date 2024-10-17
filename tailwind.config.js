/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./public/**/*.{html,js}", // Include all HTML and JS files in the public folder
        "./views/**/*.{ejs,html}", // Include EJS templates in the views folder
    ],
    theme: {
        extend: {},
    },
    plugins: [
        require('daisyui'),
    ],
}
