/**
 * Text Diff Application - Function-based architecture
 * Entry point that initializes the modular text diff application
 */

require('./style.css');
const { createTextDiffApp } = require('./app/app');

document.addEventListener('DOMContentLoaded', () => {
  try {
    const app = createTextDiffApp();
    app.initialize();
  } catch (error) {
    console.error('Failed to initialise app:', error);

    // Show user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = 'color: red; padding: 20px; text-align: center;';
    errorDiv.textContent = 'Failed to initialise the application. Please refresh the page.';
    document.body.insertBefore(errorDiv, document.body.firstChild);
  }
});
