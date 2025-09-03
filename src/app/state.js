/**
 * Application state management functions
 */

const createAppState = (config = {}) => ({
  config: {
    text1Id: 'text1',
    text2Id: 'text2',
    compareButtonId: 'compareBtn',
    leftDiffId: 'diffLeft',
    rightDiffId: 'diffRight',
    ...config
  },
  elements: null,
  isInitialized: false
});

const initializeElements = (state) => {
  const elements = {};

  // Map config IDs to element keys
  const elementMapping = {
    text1Id: 'text1',
    text2Id: 'text2',
    compareButtonId: 'compareBtn',
    leftDiffId: 'leftDiff',
    rightDiffId: 'rightDiff'
  };

  Object.entries(elementMapping).forEach(([configKey, elementKey]) => {
    const id = state.config[configKey];
    if (id) {
      elements[elementKey] = document.getElementById(id);

      if (!elements[elementKey]) {
        throw new Error(`Required element not found: ${id}`);
      }
    }
  });

  return {
    ...state,
    elements,
    isInitialized: true
  };
};

const getInputValues = (state) => {
  if (!state.elements) {
    throw new Error('State not initialized');
  }

  return {
    text1: state.elements.text1.value,
    text2: state.elements.text2.value
  };
};

const validateState = (state) => {
  if (!state.isInitialized) {
    throw new Error('Application state not initialized');
  }

  if (!state.elements) {
    throw new Error('DOM elements not found');
  }

  return true;
};

const clearOutputs = (state) => {
  validateState(state);

  state.elements.leftDiff.innerHTML = '';
  state.elements.rightDiff.innerHTML = '';
};

const updateOutputs = (state, leftHTML, rightHTML) => {
  validateState(state);

  state.elements.leftDiff.innerHTML = leftHTML;
  state.elements.rightDiff.innerHTML = rightHTML;
};

module.exports = {
  createAppState,
  initializeElements,
  getInputValues,
  validateState,
  clearOutputs,
  updateOutputs
};
