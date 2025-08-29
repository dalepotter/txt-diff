# Text Diff Checker: A local text comparison tool

[![Deploy to GitHub Pages](https://github.com/dalepotter/txt-diff/actions/workflows/deploy.yml/badge.svg)](https://github.com/dalepotter/txt-diff/actions/workflows/deploy.yml)
[🚀 Live Demo](https://dalepotter.github.io/txt-diff/)

A simple, lightweight **text comparison tool** built with HTML, CSS, and JavaScript.

Compares two blocks of text and highlights the differences: green for additions, red for removals, and grey for unchanged lines.  
Inspired by tools like [Diffchecker](https://www.diffchecker.com/), but runs entirely in the browser with zero requests on submit.


## 🛠 Features

- Compare two text inputs, side-by-side.
- Colour-coded highlights for added, removed, and unchanged lines.
- Runs entirely in the browser: No backend required.
- Simple UI for desktop and mobile.


## 💻 Usage

1. Clone the repo:
   ```bash
   git clone git@github.com:dalepotter/txt-diff.git
   cd txt-diff
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server (with live reload):
   ```bash
   npm start
   ```
   This will open the application in your browser at http://localhost:8080.


## 🚀 Deployment

1. Build for production:
   ```bash
   npm run build
   ```

This compiles and outputs static files to the `dist/` directory, ready for deployment (e.g., GitHub Pages).


## 🛠 How to Use

1. Enter your original text in the **left** textarea.
2. Enter the modified text in the **right** textarea.
3. Click **Compare** to see the differences highlighted below.


## 📁 Project Structure

```bash
txt-diff/
├── .github/
│   └── workflows/
│       └── deploy.yml  # GitHub Actions workflow to auto-deploy to GitHub Pages
├── dist/               # Compiled static files
├── src/
│   └── index.html      # HTML template
│   ├── index.js        # Main JavaScript logic
│   └── style.css       # UI styling
├── webpack.config.js   # Webpack configuration
└── package.json        # Project metadata and scripts
```


## 📋 Todos

- Add settings to toggle:
  - Line numbers
  - Diff output (side-by-side vs. line diff)
- Improve styling:
  - Larger 'Compare' button
  - Add background colour
  - Apply UI design system
- Add more explanatory text
