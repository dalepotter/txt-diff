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
        <input type="checkbox" id="lineNumbersCheckbox" checked>
        <input type="checkbox" id="sideBySideCheckbox" checked>
        <div class="diff-container">
          <div id="diffLeft" class="diff-output"></div>
          <div id="diffRight" class="diff-output"></div>
        </div>
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

  describe('Keyboard Shortcuts', () => {
    it('should handle Ctrl+Enter and update DOM', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()
      const state = app.initialize()

      // Simulate Ctrl+Enter keydown
      const keydownEvent = new dom.window.KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
        cancelable: true
      })
      document.dispatchEvent(keydownEvent)

      // Check that outputs were updated
      expect(state.elements.leftDiff.innerHTML).toBeTruthy()
      expect(state.elements.rightDiff.innerHTML).toBeTruthy()
    })

    it('should not trigger on Enter without Ctrl', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()
      const state = app.initialize()

      // Add some initial content to verify it doesn't change
      state.elements.leftDiff.innerHTML = 'initial content'
      state.elements.rightDiff.innerHTML = 'initial content'

      // Simulate Enter keydown without Ctrl
      const keydownEvent = new dom.window.KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: false
      })
      document.dispatchEvent(keydownEvent)

      // Content should remain unchanged
      expect(state.elements.leftDiff.innerHTML).toBe('initial content')
      expect(state.elements.rightDiff.innerHTML).toBe('initial content')
    })

    it('should not trigger on Ctrl with other keys', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()
      const state = app.initialize()

      // Add some initial content to verify it doesn't change
      state.elements.leftDiff.innerHTML = 'initial content'
      state.elements.rightDiff.innerHTML = 'initial content'

      // Simulate Ctrl+A keydown
      const keydownEvent = new dom.window.KeyboardEvent('keydown', {
        key: 'a',
        ctrlKey: true
      })
      document.dispatchEvent(keydownEvent)

      // Content should remain unchanged
      expect(state.elements.leftDiff.innerHTML).toBe('initial content')
      expect(state.elements.rightDiff.innerHTML).toBe('initial content')
    })

    it('should prevent default behavior on Ctrl+Enter', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()
      app.initialize()

      // Simulate Ctrl+Enter keydown with preventDefault spy
      const keydownEvent = new dom.window.KeyboardEvent('keydown', {
        key: 'Enter',
        ctrlKey: true,
        cancelable: true
      })
      const preventDefaultSpy = vi.spyOn(keydownEvent, 'preventDefault')
      document.dispatchEvent(keydownEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
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

  describe('Height Synchronization', () => {
    it('should synchronize line heights when updating outputs', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()
      const state = app.initialize()

      // Mock requestAnimationFrame to run synchronously
      const originalRAF = global.requestAnimationFrame
      global.requestAnimationFrame = (cb) => cb()

      // Mock offsetHeight for child elements
      const mockOffsetHeight = vi.fn()
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
        configurable: true,
        get: mockOffsetHeight.mockReturnValue(25)
      })

      try {
        // Set up input values
        state.elements.text1.value = 'line1\nline2'
        state.elements.text2.value = 'line1\nline2 modified'

        // Simulate button click to trigger full comparison including updateOutputs
        const clickEvent = new dom.window.Event('click')
        state.elements.compareBtn.dispatchEvent(clickEvent)

        // Verify that the DOM elements have been updated
        expect(state.elements.leftDiff.innerHTML).toBeTruthy()
        expect(state.elements.rightDiff.innerHTML).toBeTruthy()
      } finally {
        global.requestAnimationFrame = originalRAF
        mockOffsetHeight.mockRestore()
      }
    })

    it('should handle requestAnimationFrame properly in updateOutputs', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()
      const state = app.initialize()

      // Spy on requestAnimationFrame
      const rafSpy = vi.spyOn(global, 'requestAnimationFrame').mockImplementation(cb => cb())

      try {
        // Trigger updateOutputs through button click
        const clickEvent = new dom.window.Event('click')
        state.elements.compareBtn.dispatchEvent(clickEvent)

        // Should have called requestAnimationFrame for height sync
        expect(rafSpy).toHaveBeenCalled()
      } finally {
        rafSpy.mockRestore()
      }
    })
  })

  describe('Line Number Toggle Functionality', () => {
    it('should initialize with line numbers checkbox checked', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()
      const state = app.initialize()

      expect(state.elements.lineNumbersCheckbox.checked).toBe(true)
      expect(document.querySelector('.diff-container').classList.contains('hide-line-numbers')).toBe(false)
    })

    it('should toggle line numbers visibility when checkbox is unchecked', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()
      const state = app.initialize()

      const diffContainer = document.querySelector('.diff-container')
      const checkbox = state.elements.lineNumbersCheckbox

      // Initially should not have hide-line-numbers class
      expect(diffContainer.classList.contains('hide-line-numbers')).toBe(false)

      // Uncheck the checkbox
      checkbox.checked = false
      const changeEvent = new dom.window.Event('change')
      checkbox.dispatchEvent(changeEvent)

      // Should now have hide-line-numbers class
      expect(diffContainer.classList.contains('hide-line-numbers')).toBe(true)
    })

    it('should show line numbers when checkbox is checked', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()
      const state = app.initialize()

      const diffContainer = document.querySelector('.diff-container')
      const checkbox = state.elements.lineNumbersCheckbox

      // First hide line numbers
      checkbox.checked = false
      checkbox.dispatchEvent(new dom.window.Event('change'))
      expect(diffContainer.classList.contains('hide-line-numbers')).toBe(true)

      // Then show them again
      checkbox.checked = true
      checkbox.dispatchEvent(new dom.window.Event('change'))
      expect(diffContainer.classList.contains('hide-line-numbers')).toBe(false)
    })

    it('should handle line number toggle errors gracefully', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      // Mock console.error to prevent test output noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const app = createDiffApp()
      const state = app.initialize()

      // Remove diff-container to cause an error
      document.querySelector('.diff-container').remove()

      // Should not crash when toggling
      const checkbox = state.elements.lineNumbersCheckbox
      checkbox.checked = false
      expect(() => {
        checkbox.dispatchEvent(new dom.window.Event('change'))
      }).not.toThrow()

      expect(consoleSpy).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should work correctly even if checkbox element is missing', async () => {
      // Create DOM without checkbox
      dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
          <textarea id="text1">Hello\nworld</textarea>
          <textarea id="text2">Hello\nuniverse</textarea>
          <button id="compareBtn">Compare</button>
          <div class="diff-container">
            <div id="diffLeft" class="diff-output"></div>
            <div id="diffRight" class="diff-output"></div>
          </div>
        </body>
        </html>
      `)

      document = dom.window.document
      window = dom.window
      global.document = document
      global.window = window

      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()

      // Should initialize successfully even without checkbox
      expect(() => {
        app.initialize()
      }).not.toThrow()
    })

    it('should display line numbers in diff output by default', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()
      const state = app.initialize()

      // Set input values and perform diff
      state.elements.text1.value = 'line1\nline2'
      state.elements.text2.value = 'line1\nline2 modified'

      const clickEvent = new dom.window.Event('click')
      state.elements.compareBtn.dispatchEvent(clickEvent)

      // Check that line numbers are present in the output
      const leftContent = state.elements.leftDiff.innerHTML
      const rightContent = state.elements.rightDiff.innerHTML

      expect(leftContent).toContain('class="line-number"')
      expect(rightContent).toContain('class="line-number"')
      expect(leftContent).toContain('class="line-content"')
      expect(rightContent).toContain('class="line-content"')
    })
  })

  describe('Diff View Toggle Functionality', () => {
    it('should initialize with side-by-side view checkbox checked', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()
      const state = app.initialize()

      expect(state.elements.sideBySideCheckbox.checked).toBe(true)
      expect(document.body.classList.contains('unified-diff')).toBe(false)
    })

    it('should toggle to unified view when checkbox is unchecked', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()
      const state = app.initialize()

      const checkbox = state.elements.sideBySideCheckbox

      // Initially should not have unified-diff class
      expect(document.body.classList.contains('unified-diff')).toBe(false)

      // Uncheck the checkbox to switch to unified view
      checkbox.checked = false
      const changeEvent = new dom.window.Event('change')
      checkbox.dispatchEvent(changeEvent)

      // Should now have unified-diff class
      expect(document.body.classList.contains('unified-diff')).toBe(true)
    })

    it('should switch back to side-by-side view when checkbox is checked', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()
      const state = app.initialize()

      const checkbox = state.elements.sideBySideCheckbox

      // First switch to unified view
      checkbox.checked = false
      checkbox.dispatchEvent(new dom.window.Event('change'))
      expect(document.body.classList.contains('unified-diff')).toBe(true)

      // Then switch back to side-by-side view
      checkbox.checked = true
      checkbox.dispatchEvent(new dom.window.Event('change'))
      expect(document.body.classList.contains('unified-diff')).toBe(false)
    })

    it('should re-render diff content when toggling views', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()
      const state = app.initialize()

      // Set input values and perform initial diff
      state.elements.text1.value = 'line1\nline2'
      state.elements.text2.value = 'line1\nline3'

      const clickEvent = new dom.window.Event('click')
      state.elements.compareBtn.dispatchEvent(clickEvent)

      // Store initial content
      const initialLeftContent = state.elements.leftDiff.innerHTML
      const initialRightContent = state.elements.rightDiff.innerHTML

      // Toggle to unified view
      const checkbox = state.elements.sideBySideCheckbox
      checkbox.checked = false
      const changeEvent = new dom.window.Event('change')
      checkbox.dispatchEvent(changeEvent)

      // Content should be re-rendered for unified view
      const unifiedLeftContent = state.elements.leftDiff.innerHTML
      const unifiedRightContent = state.elements.rightDiff.innerHTML

      expect(unifiedLeftContent).not.toBe(initialLeftContent)
      expect(unifiedRightContent).toBe('') // Right content should be empty in unified view
    })

    it('should handle diff view toggle errors gracefully', async () => {
      const { createDiffApp } = await import('../../src/app/app.js')

      // Mock console.error to prevent test output noise
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const app = createDiffApp()
      const state = app.initialize()

      // Mock getInputValues to throw an error
      const originalValue = state.elements.text1.value
      Object.defineProperty(state.elements.text1, 'value', {
        get: () => { throw new Error('Test error') },
        configurable: true
      })

      // Should not crash when toggling with existing content
      state.elements.leftDiff.innerHTML = 'some content'
      const checkbox = state.elements.sideBySideCheckbox
      checkbox.checked = false

      expect(() => {
        checkbox.dispatchEvent(new dom.window.Event('change'))
      }).not.toThrow()

      expect(consoleSpy).toHaveBeenCalled()

      // Restore original value
      Object.defineProperty(state.elements.text1, 'value', {
        get: () => originalValue,
        configurable: true
      })
      consoleSpy.mockRestore()
    })

    it('should work correctly even if side-by-side checkbox element is missing', async () => {
      // Create DOM without side-by-side checkbox
      dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
          <textarea id="text1">Hello\nworld</textarea>
          <textarea id="text2">Hello\nuniverse</textarea>
          <button id="compareBtn">Compare</button>
          <input type="checkbox" id="lineNumbersCheckbox" checked>
          <div class="diff-container">
            <div id="diffLeft" class="diff-output"></div>
            <div id="diffRight" class="diff-output"></div>
          </div>
        </body>
        </html>
      `)

      document = dom.window.document
      window = dom.window
      global.document = document
      global.window = window

      const { createDiffApp } = await import('../../src/app/app.js')

      const app = createDiffApp()

      // Should initialize successfully even without side-by-side checkbox
      expect(() => {
        app.initialize()
      }).not.toThrow()
    })
  })
})
