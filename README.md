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

4. Run tests:
   ```bash
   npm test          # Run tests in watch mode
   npm run test:run  # Run tests once
   npm run test:ui   # Run tests with UI
   ```


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
│       ├── deploy.yml  # GitHub Actions workflow to auto-deploy to GitHub Pages
│       └── test.yml    # GitHub Actions workflow for testing
├── dist/               # Compiled static files
├── src/
│   ├── app/
│   │   ├── app.js      # Main application orchestrator
│   │   └── state.js    # Application state management
│   ├── diff/
│   │   ├── diffProcessor.js  # Pure diff processing functions
│   │   └── wordDiffer.js     # Word-level diff functions
│   ├── render/
│   │   └── renderer.js       # Pure rendering functions
│   ├── utils/
│   │   └── htmlUtils.js      # HTML utility functions
│   ├── index.html      # HTML template
│   ├── index.js        # Application entry point
│   └── style.css       # UI styling
├── test/
│   ├── integration/          # Integration tests (end-to-end functionality)
│   │   ├── app.test.js       # App integration tests  
│   │   └── diff.test.js      # Diff functionality integration tests
│   └── unit/                 # Unit tests (individual modules)
│       ├── diffProcessor.test.js # Diff processor unit tests
│       ├── htmlUtils.test.js     # HTML utilities unit tests
│       ├── legacy.test.js        # Legacy unit tests  
│       ├── renderer.test.js      # Renderer unit tests
│       ├── state.test.js         # State management unit tests
│       └── wordDiffer.test.js    # Word differ unit tests
├── webpack.config.js   # Webpack configuration
├── vitest.config.js    # Vitest testing configuration
└── package.json        # Project metadata and scripts
```


## 🧪 Testing

This project uses [Vitest](https://vitest.dev/) for testing with jsdom for DOM testing.

### Test Structure

The test suite is organized by test type with **100 tests** across 8 test files:

### Integration Tests (`test/integration/`)
Tests that verify end-to-end functionality and module interaction:
- `app.test.js` - Complete application workflows and user interactions
- `diff.test.js` - Full diff processing pipeline from input to output

### Unit Tests (`test/unit/`)
Tests that verify individual modules in isolation:
- `htmlUtils.test.js` - HTML utility functions
- `wordDiffer.test.js` - Word-level diff logic  
- `diffProcessor.test.js` - Diff processing functions
- `renderer.test.js` - Pure rendering functions
- `state.test.js` - State management functions
- `legacy.test.js` - Original unit tests updated for new architecture

### Running Tests

```bash
# Run all tests
npm test                    # Run all tests in watch mode
npm run test:run            # Run all tests once (good for CI)
npm run test:ui             # Open Vitest UI in browser
npm run test:coverage       # Run tests with coverage report

# Run by test type
npm run test:unit           # Run only unit tests in watch mode
npm run test:integration    # Run only integration tests in watch mode
npm run test:unit:run       # Run unit tests once
npm run test:integration:run # Run integration tests once
```

### Test Coverage

The tests comprehensively cover:
- **Pure functions** - All utility and processing functions
- **State management** - Application initialization and DOM interaction
- **Integration flows** - Complete user workflows  
- **Error handling** - Graceful failure scenarios
- **Edge cases** - Empty inputs, multiline text, HTML injection, special characters
- **Function composition** - How modules work together


## 📋 Todos

- Add settings to toggle:
  - Line numbers
  - Diff output (side-by-side vs. line diff)
- Improve styling:
  - Larger 'Compare' button
  - Add background colour
  - Apply UI design system
- Add more explanatory text
