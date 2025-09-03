import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { diffLines, diffWords } from 'diff'

describe('Text Diff Functionality - Integration Tests', () => {
  let dom, document, window

  beforeEach(() => {
    // Create fresh DOM for each test
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
      <body>
        <textarea id="text1">Hello\nworld\nfrom\ntest</textarea>
        <textarea id="text2">Hello\nuniverse\nfrom\ntest</textarea>
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

  // Test the core diff functionality directly
  it('should perform line-based diff correctly', () => {
    const text1 = 'Hello\nworld\nfrom\ntest'
    const text2 = 'Hello\nuniverse\nfrom\ntest'

    const result = diffLines(text1, text2)

    expect(result.length).toBeGreaterThan(1)
    expect(result.some(part => part.removed)).toBe(true)
    expect(result.some(part => part.added)).toBe(true)
  })

  it('should handle empty inputs', () => {
    const result1 = diffLines('', '')
    expect(result1).toEqual([])

    const result2 = diffLines('test', '')
    expect(result2.length).toBeGreaterThan(0)
    expect(result2[0].removed).toBe(true)
  })

  // Test HTML escaping function behavior
  it('should properly escape HTML in DOM', () => {
    const div = document.createElement('div')
    div.textContent = '<script>alert("test")</script>'
    expect(div.innerHTML).toBe('&lt;script&gt;alert("test")&lt;/script&gt;')
  })

  // Test DOM manipulation
  it('should create and manipulate DOM elements correctly', () => {
    const leftDiv = document.getElementById('diffLeft')
    const rightDiv = document.getElementById('diffRight')

    expect(leftDiv).not.toBeNull()
    expect(rightDiv).not.toBeNull()

    // Test adding content
    const testElement = document.createElement('div')
    testElement.textContent = 'test line'
    testElement.classList.add('unchanged')

    leftDiv.appendChild(testElement)
    expect(leftDiv.children.length).toBe(1)
    expect(leftDiv.children[0].textContent).toBe('test line')
    expect(leftDiv.children[0].classList.contains('unchanged')).toBe(true)
  })

  it('should handle multiline text processing', () => {
    const text1 = 'Line 1\nLine 2\nLine 3'
    const text2 = 'Line 1\nModified Line 2\nLine 3'

    const diff = diffLines(text1, text2)

    // Should detect the change in line 2
    expect(diff.length).toBeGreaterThan(1)

    // Check that we have removed and added parts
    const hasRemoved = diff.some(part => part.removed)
    const hasAdded = diff.some(part => part.added)

    expect(hasRemoved).toBe(true)
    expect(hasAdded).toBe(true)
  })

  // Integration test with new architecture
  it('should work with new function-based app architecture', async () => {
    const { createTextDiffApp } = await import('../../src/app/app.js')

    const app = createTextDiffApp()
    const state = app.initialize()

    expect(state.isInitialized).toBe(true)
    expect(state.elements.text1.value).toBe('Hello\nworld\nfrom\ntest')
    expect(state.elements.text2.value).toBe('Hello\nuniverse\nfrom\ntest')

    // Test diff functionality
    const result = app.performDiff(
      state.elements.text1.value,
      state.elements.text2.value
    )

    expect(result.leftHTML).toContain('Hello')
    expect(result.rightHTML).toContain('Hello')
    expect(result.leftHTML).toContain('world')
    expect(result.rightHTML).toContain('universe')
  })

  // Test button click integration
  it('should handle button click in new architecture', async () => {
    const { createTextDiffApp } = await import('../../src/app/app.js')

    const app = createTextDiffApp()
    const state = app.initialize()

    // Initially empty
    expect(state.elements.leftDiff.innerHTML).toBe('')
    expect(state.elements.rightDiff.innerHTML).toBe('')

    // Simulate button click
    const clickEvent = new dom.window.Event('click')
    state.elements.compareBtn.dispatchEvent(clickEvent)

    // Should now have content
    expect(state.elements.leftDiff.innerHTML).toBeTruthy()
    expect(state.elements.rightDiff.innerHTML).toBeTruthy()
    expect(state.elements.leftDiff.innerHTML).toContain('div')
    expect(state.elements.rightDiff.innerHTML).toContain('div')
  })
})
