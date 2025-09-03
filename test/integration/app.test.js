import { describe, it, expect, beforeEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'

let dom, document, window

// Mock the diff library
vi.mock('diff', () => ({
  diffLines: vi.fn((text1, text2) => {
    if (text1 === 'Hello\nworld' && text2 === 'Hello\nuniverse') {
      return [
        { value: 'Hello\n', added: false, removed: false },
        { value: 'world\n', removed: true },
        { value: 'universe\n', added: true }
      ]
    }
    return [{ value: text1 + '\n', added: false, removed: false }]
  }),
  diffWords: vi.fn((oldLine, newLine) => {
    if (oldLine === 'world' && newLine === 'universe') {
      return [
        { value: 'world', removed: true },
        { value: 'universe', added: true }
      ]
    }
    return [{ value: oldLine || newLine, added: false, removed: false }]
  })
}))

describe('App Integration', () => {
  beforeEach(() => {
    // Create fresh DOM for each test
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
      <body>
        <textarea id="text1">Hello\nworld</textarea>
        <textarea id="text2">Hello\nuniverse</textarea>
        <button id="compareBtn">Compare</button>
        <div id="diffLeft" class="diff-output"></div>
        <div id="diffRight" class="diff-output"></div>
      </body>
      </html>
    `)

    document = dom.window.document
    window = dom.window

    global.document = document
    global.window = window
  })

  describe('createDiffApp', () => {
    it('should create and initialize app successfully', async () => {
      // Import after DOM is set up
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()
      const state = app.initialize()

      expect(state.isInitialized).toBe(true)
      expect(state.elements.text1).toBeTruthy()
      expect(state.elements.text2).toBeTruthy()
    })

    it('should create app with custom config', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      // Add custom elements to DOM
      const customTextarea = document.createElement('textarea')
      customTextarea.id = 'customText1'
      customTextarea.value = 'custom content'
      document.body.appendChild(customTextarea)

      const customDiv = document.createElement('div')
      customDiv.id = 'customLeft'
      document.body.appendChild(customDiv)

      const app = createDiffApp({
        text1Id: 'customText1',
        leftDiffId: 'customLeft'
      })
      const state = app.initialize()

      expect(state.config.text1Id).toBe('customText1')
      expect(state.config.leftDiffId).toBe('customLeft')
    })

    it('should throw error for missing elements', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp({ text1Id: 'missing' })

      expect(() => app.initialize()).toThrow('Required element not found')
    })
  })

  describe('performDiff', () => {
    it('should perform diff and return HTML content', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()
      app.initialize()

      const result = app.performDiff('Hello\nworld', 'Hello\nuniverse')

      expect(result.leftHTML).toBeTruthy()
      expect(result.rightHTML).toBeTruthy()
      expect(result.leftHTML).toContain('Hello')
      expect(result.rightHTML).toContain('Hello')
    })

    it('should handle empty inputs', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()
      app.initialize()

      const result = app.performDiff('', '')

      expect(result.leftHTML).toBeDefined()
      expect(result.rightHTML).toBeDefined()
    })
  })

  describe('getState', () => {
    it('should return copy of state to prevent mutation', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()
      app.initialize()

      const state1 = app.getState()
      const state2 = app.getState()

      expect(state1).not.toBe(state2) // Different object references
      expect(state1.isInitialized).toBe(state2.isInitialized)
    })
  })

  describe('Button Click Integration', () => {
    it('should handle button click and update DOM', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()
      const state = app.initialize()

      // Simulate button click
      const clickEvent = new dom.window.Event('click')
      state.elements.compareBtn.dispatchEvent(clickEvent)

      // Check that outputs were updated
      expect(state.elements.leftDiff.innerHTML).toBeTruthy()
      expect(state.elements.rightDiff.innerHTML).toBeTruthy()
    })

    it('should clear outputs before updating', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()
      const state = app.initialize()

      // Add some initial content
      state.elements.leftDiff.innerHTML = 'initial content'
      state.elements.rightDiff.innerHTML = 'initial content'

      // Simulate button click
      const clickEvent = new dom.window.Event('click')
      state.elements.compareBtn.dispatchEvent(clickEvent)

      // Should not contain initial content anymore
      expect(state.elements.leftDiff.innerHTML).not.toBe('initial content')
      expect(state.elements.rightDiff.innerHTML).not.toBe('initial content')
    })
  })

  describe('Error Handling', () => {
    it('should handle errors gracefully during comparison', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      // Mock console.error to prevent test output noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const app = createDiffApp()
      const state = app.initialize()

      // Mock getInputValues to throw an error by removing the value getter
      Object.defineProperty(state.elements.text1, 'value', {
        get: () => { throw new Error('Test error') }
      })

      // Simulate button click - should not crash
      const clickEvent = new dom.window.Event('click')
      expect(() => {
        state.elements.compareBtn.dispatchEvent(clickEvent)
      }).not.toThrow()

      // Wait a bit for async error handling
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })
  })
})
