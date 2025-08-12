module.exports = {
  darkMode: ['class', '[data-theme="dark"]'], // ← active le support de data-theme
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  safelist: [
    "bg-red-500", "hover:bg-red-600",
    "bg-blue-500", "hover:bg-blue-600",
    "bg-green-500", "hover:bg-green-600",
    "bg-yellow-500", "hover:bg-yellow-600",
    "bg-purple-500", "hover:bg-purple-600",
    "bg-pink-500", "hover:bg-pink-600"
  ],
  theme: { extend: {} },
  plugins: [],
};