/**
 * Main application orchestrator function
 */

const { diffLines, diffWords } = require('diff');
const { createAppState, initializeElements, getInputValues, clearOutputs, updateOutputs } = require('./state');
const { processLineDiff, extractLines } = require('../diff/diffProcessor');
const { createWordDiffHTML } = require('../diff/wordDiffer');
const { renderAllGroups, extractRenderedContent, extractUnifiedContent } = require('../render/renderer');

const createDiffApp = (config = {}) => {
  let state = createAppState(config);

  // Higher-order functions with dependencies injected
  const wordDiffer = createWordDiffHTML(diffWords);

  const initialize = () => {
    try {
      state = initializeElements(state);
      bindEvents();
      return state;
    } catch (error) {
      console.error('Failed to initialise app:', error);
      throw error;
    }
  };

  const bindEvents = () => {
    if (!state.elements?.compareBtn) {
      throw new Error('Compare button not found');
    }

    state.elements.compareBtn.addEventListener('click', handleCompare);

    // Line numbers toggle functionality
    if (state.elements?.lineNumbersCheckbox) {
      state.elements.lineNumbersCheckbox.addEventListener('change', handleLineNumbersToggle);
    }

    // Diff view toggle functionality
    if (state.elements?.sideBySideCheckbox) {
      state.elements.sideBySideCheckbox.addEventListener('change', handleDiffViewToggle);
    }

    // Add Ctrl+Enter keyboard shortcut
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        handleCompare();
      }
    });
  };

  const handleCompare = () => {
    try {
      const { text1, text2 } = getInputValues(state);
      const { leftHTML, rightHTML } = performDiff(text1, text2);

      clearOutputs(state);
      updateOutputs(state, leftHTML, rightHTML);
    } catch (error) {
      console.error('Diff operation failed:', error);
      // Could show user-friendly error message here
    }
  };

  const handleLineNumbersToggle = () => {
    try {
      const isChecked = state.elements.lineNumbersCheckbox.checked;
      const diffContainer = document.querySelector('.diff-container');

      if (isChecked) {
        diffContainer.classList.remove('hide-line-numbers');
      } else {
        diffContainer.classList.add('hide-line-numbers');
      }
    } catch (error) {
      console.error('Line numbers toggle failed:', error);
    }
  };

  const handleDiffViewToggle = () => {
    try {
      const isChecked = state.elements.sideBySideCheckbox.checked;
      const bodyElement = document.body;

      if (isChecked) {
        bodyElement.classList.remove('unified-diff');
      } else {
        bodyElement.classList.add('unified-diff');
      }

      // Re-run the diff if there's already content
      if (state.elements.leftDiff.innerHTML || state.elements.rightDiff.innerHTML) {
        const { text1, text2 } = getInputValues(state);
        const { leftHTML, rightHTML } = performDiff(text1, text2);
        clearOutputs(state);
        updateOutputs(state, leftHTML, rightHTML);
      }
    } catch (error) {
      console.error('Diff view toggle failed:', error);
    }
  };

  const performDiff = (text1, text2) => {
    const groupedDiff = processLineDiff(diffLines, text1, text2);
    const renderedLines = renderAllGroups(groupedDiff, wordDiffer, extractLines);

    // Check if we're in unified view mode
    const isUnifiedView = state.elements?.sideBySideCheckbox && !state.elements.sideBySideCheckbox.checked;

    if (isUnifiedView) {
      return extractUnifiedContent(renderedLines);
    } else {
      return extractRenderedContent(renderedLines);
    }
  };

  // Public API
  return {
    initialize,
    performDiff,
    getState: () => ({ ...state }) // Return copy to prevent mutation
  };
};

// Factory function for creating configured app instances
const createTextDiffApp = (customConfig) => createDiffApp(customConfig);

module.exports = {
  createDiffApp,
  createTextDiffApp
};
