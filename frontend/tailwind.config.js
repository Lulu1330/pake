module.exports = {
  darkMode: ['class', '[data-theme="dark"]'], // ← active le support de data-theme
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  safelist: [
    "bg-blue-500",
    "bg-red-500",
    "bg-green-500",
    "bg-yellow-400",
    "text-white",
    "text-black",
  ],
  theme: { extend: {} },
  plugins: [],
};