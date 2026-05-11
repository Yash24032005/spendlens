/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {}, // <--- Pehle sirf 'tailwindcss' tha, ab ye likho
    "autoprefixer": {},
  },
};

export default config;