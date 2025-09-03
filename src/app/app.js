/**
 * Main application orchestrator function
 */

const { diffLines, diffWords } = require('diff');
const { createAppState, initializeElements, getInputValues, clearOutputs, updateOutputs } = require('./state');
const { processLineDiff, extractLines } = require('../diff/diffProcessor');
const { createWordDiffHTML } = require('../diff/wordDiffer');
const { renderAllGroups, extractRenderedContent } = require('../render/renderer');

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

  const performDiff = (text1, text2) => {
    const groupedDiff = processLineDiff(diffLines, text1, text2);
    const renderedLines = renderAllGroups(groupedDiff, wordDiffer, extractLines);
    return extractRenderedContent(renderedLines);
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
