/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js}"],
    theme: {
        extend: {
            colors: {
                primary: "#05B6D3",
                secondary: "#EF863E",
            },
            backgroundImage: {
                "signup-bg-img": "url('./assets/banner-1.jpg')",
            }
        },
    },
    plugins: [
        require('daisyui'),
    ],
}