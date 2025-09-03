import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

let dom, document, window

const {
  createAppState,
  initializeElements,
  getInputValues,
  validateState,
  clearOutputs,
  updateOutputs
} = require('../../src/app/state')

describe('State Management', () => {
  beforeEach(() => {
    // Create fresh DOM for each test
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
      <body>
        <textarea id="text1">Sample text 1</textarea>
        <textarea id="text2">Sample text 2</textarea>
        <button id="compareBtn">Compare</button>
        <div id="diffLeft" class="diff-output">Left content</div>
        <div id="diffRight" class="diff-output">Right content</div>
      </body>
      </html>
    `)

    document = dom.window.document
    window = dom.window

    global.document = document
    global.window = window
  })

  describe('createAppState', () => {
    it('should create default app state', () => {
      const state = createAppState()

      expect(state.config.text1Id).toBe('text1')
      expect(state.config.text2Id).toBe('text2')
      expect(state.config.compareButtonId).toBe('compareBtn')
      expect(state.config.leftDiffId).toBe('diffLeft')
      expect(state.config.rightDiffId).toBe('diffRight')
      expect(state.elements).toBe(null)
      expect(state.isInitialized).toBe(false)
    })

    it('should create app state with custom config', () => {
      const customConfig = {
        text1Id: 'customText1',
        leftDiffId: 'customLeft'
      }

      const state = createAppState(customConfig)

      expect(state.config.text1Id).toBe('customText1')
      expect(state.config.leftDiffId).toBe('customLeft')
      expect(state.config.text2Id).toBe('text2') // Should keep defaults
    })
  })

  describe('initializeElements', () => {
    it('should initialize elements successfully', () => {
      const state = createAppState()
      const initializedState = initializeElements(state)

      expect(initializedState.isInitialized).toBe(true)
      expect(initializedState.elements).toBeTruthy()
      expect(initializedState.elements.text1).toBeTruthy()
      expect(initializedState.elements.text2).toBeTruthy()
      expect(initializedState.elements.compareBtn).toBeTruthy()
      expect(initializedState.elements.leftDiff).toBeTruthy()
      expect(initializedState.elements.rightDiff).toBeTruthy()
    })

    it('should throw error for missing element', () => {
      const state = createAppState({ text1Id: 'nonexistent' })

      expect(() => initializeElements(state)).toThrow('Required element not found: nonexistent')
    })

    it('should preserve original state properties', () => {
      const state = createAppState({ customProp: 'value' })
      const initializedState = initializeElements(state)

      expect(initializedState.config.customProp).toBe('value')
    })
  })

  describe('getInputValues', () => {
    it('should get input values from initialized state', () => {
      const state = initializeElements(createAppState())
      const values = getInputValues(state)

      expect(values.text1).toBe('Sample text 1')
      expect(values.text2).toBe('Sample text 2')
    })

    it('should throw error for uninitialized state', () => {
      const state = createAppState()

      expect(() => getInputValues(state)).toThrow('State not initialized')
    })
  })

  describe('validateState', () => {
    it('should validate initialized state', () => {
      const state = initializeElements(createAppState())

      expect(() => validateState(state)).not.toThrow()
      expect(validateState(state)).toBe(true)
    })

    it('should throw error for uninitialized state', () => {
      const state = createAppState()

      expect(() => validateState(state)).toThrow('Application state not initialized')
    })

    it('should throw error for state without elements', () => {
      const state = { isInitialized: true, elements: null }

      expect(() => validateState(state)).toThrow('DOM elements not found')
    })
  })

  describe('clearOutputs', () => {
    it('should clear output elements', () => {
      const state = initializeElements(createAppState())

      // Initially has content
      expect(state.elements.leftDiff.innerHTML).toBe('Left content')
      expect(state.elements.rightDiff.innerHTML).toBe('Right content')

      clearOutputs(state)

      expect(state.elements.leftDiff.innerHTML).toBe('')
      expect(state.elements.rightDiff.innerHTML).toBe('')
    })

    it('should throw error for invalid state', () => {
      const state = createAppState()

      expect(() => clearOutputs(state)).toThrow('Application state not initialized')
    })
  })

  describe('updateOutputs', () => {
    it('should update output elements with new content', () => {
      const state = initializeElements(createAppState())
      const leftHTML = '<div class="added">New left</div>'
      const rightHTML = '<div class="removed">New right</div>'

      updateOutputs(state, leftHTML, rightHTML)

      expect(state.elements.leftDiff.innerHTML).toBe(leftHTML)
      expect(state.elements.rightDiff.innerHTML).toBe(rightHTML)
    })

    it('should throw error for invalid state', () => {
      const state = createAppState()

      expect(() => updateOutputs(state, '', '')).toThrow('Application state not initialized')
    })
  })
})
