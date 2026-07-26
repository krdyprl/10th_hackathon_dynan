/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      fontFamily: {
        loraregular: ['Lora-Regular', 'sans-serif'],
        loramedium: ['Lora-Medium', 'sans-serif'],
        lorabold: ['Lora-Bold', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
