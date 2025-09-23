import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

describe('Text Diff App - End-to-End Tests', () => {
  let dom, document, window

  beforeEach(() => {
    // Create fresh DOM for each test
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
      <body>
        <div class="diff-container">
          <textarea id="text1">Original text\nLine 2\nLine 3</textarea>
          <textarea id="text2">Modified text\nLine 2\nLine 4</textarea>
          <button id="compareBtn">Compare</button>
          <div id="diffLeft" class="diff-output"></div>
          <div id="diffRight" class="diff-output"></div>
          <input type="checkbox" id="lineNumbersCheckbox">
          <input type="checkbox" id="sideBySideCheckbox" checked>
        </div>
      </body>
      </html>
    `)

    document = dom.window.document
    window = dom.window

    global.document = document
    global.window = window
  })

  it('should perform complete user workflow from input to output', async () => {
    const { createTextDiffApp } = await import('../../src/app/app.js')

    const app = createTextDiffApp()
    const state = app.initialize()

    // Verify initial state
    expect(state.isInitialized).toBe(true)
    expect(state.elements.leftDiff.innerHTML).toBe('')
    expect(state.elements.rightDiff.innerHTML).toBe('')

    // Verify input values
    expect(state.elements.text1.value).toContain('Original text')
    expect(state.elements.text2.value).toContain('Modified text')

    // Trigger comparison using the app's performDiff method directly
    const result = app.performDiff(
      state.elements.text1.value,
      state.elements.text2.value
    )

    // Verify result structure
    expect(result).toBeTruthy()
    expect(result.leftHTML).toBeTruthy()
    expect(result.rightHTML).toBeTruthy()
    expect(result.leftHTML).toContain('Line 2')
    expect(result.rightHTML).toContain('Line 2')
  })

  it('should handle view toggle functionality', async () => {
    const { createTextDiffApp } = await import('../../src/app/app.js')

    const app = createTextDiffApp()
    const state = app.initialize()

    // Perform initial comparison
    const clickEvent = new dom.window.Event('click')
    state.elements.compareBtn.dispatchEvent(clickEvent)

    const initialLeftContent = state.elements.leftDiff.innerHTML
    const initialRightContent = state.elements.rightDiff.innerHTML

    // Toggle view (side-by-side checkbox)
    state.elements.sideBySideCheckbox.click()

    // Content should change after view toggle
    expect(state.elements.leftDiff.innerHTML).not.toBe(initialLeftContent)
    expect(state.elements.rightDiff.innerHTML).not.toBe(initialRightContent)
  })

  it('should handle line number toggle', async () => {
    const { createTextDiffApp } = await import('../../src/app/app.js')

    const app = createTextDiffApp()
    const state = app.initialize()

    // Perform initial comparison
    const clickEvent = new dom.window.Event('click')
    state.elements.compareBtn.dispatchEvent(clickEvent)

    // Verify line numbers checkbox exists and can be toggled
    expect(state.elements.lineNumbersCheckbox).toBeTruthy()
    expect(state.elements.lineNumbersCheckbox.checked).toBe(false)

    // Toggle line numbers
    state.elements.lineNumbersCheckbox.checked = true
    state.elements.lineNumbersCheckbox.dispatchEvent(new dom.window.Event('change'))

    // Verify the checkbox state changed
    expect(state.elements.lineNumbersCheckbox.checked).toBe(true)
  })

  it('should handle empty inputs gracefully', async () => {
    // Set up DOM with empty inputs
    const emptyDom = new JSDOM(`
      <!DOCTYPE html>
      <html>
      <body>
        <div class="diff-container">
          <textarea id="text1"></textarea>
          <textarea id="text2"></textarea>
          <button id="compareBtn">Compare</button>
          <div id="diffLeft" class="diff-output"></div>
          <div id="diffRight" class="diff-output"></div>
          <input type="checkbox" id="lineNumbersCheckbox">
          <input type="checkbox" id="sideBySideCheckbox" checked>
        </div>
      </body>
      </html>
    `)

    global.document = emptyDom.window.document
    global.window = emptyDom.window

    const { createTextDiffApp } = await import('../../src/app/app.js')

    const app = createTextDiffApp()
    const state = app.initialize()

    // Trigger comparison with empty inputs
    const clickEvent = new emptyDom.window.Event('click')
    state.elements.compareBtn.dispatchEvent(clickEvent)

    // Should not crash and should produce some output
    expect(state.elements.leftDiff.innerHTML).toBeDefined()
    expect(state.elements.rightDiff.innerHTML).toBeDefined()
  })

  it('should maintain consistent state across multiple comparisons', async () => {
    const { createTextDiffApp } = await import('../../src/app/app.js')

    const app = createTextDiffApp()
    const state = app.initialize()

    // First comparison
    const firstResult = app.performDiff(
      state.elements.text1.value,
      state.elements.text2.value
    )

    // Modify input
    state.elements.text1.value = 'New text\nAnother line'
    state.elements.text2.value = 'Different text\nAnother line'

    // Second comparison
    const secondResult = app.performDiff(
      state.elements.text1.value,
      state.elements.text2.value
    )

    // Results should be different
    expect(secondResult.leftHTML).not.toBe(firstResult.leftHTML)
    expect(secondResult.rightHTML).not.toBe(firstResult.rightHTML)

    // But should still contain valid content
    expect(secondResult.leftHTML).toBeTruthy()
    expect(secondResult.rightHTML).toBeTruthy()
  })
})