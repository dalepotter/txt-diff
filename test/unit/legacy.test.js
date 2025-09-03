import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { diffWords } from 'diff'

// Set up DOM for unit tests
const dom = new JSDOM()
global.document = dom.window.document
global.window = dom.window

// Import the utility functions from the new modular architecture
const { escapeHtml } = require('../../src/utils/htmlUtils')

describe('HTML Escaping - Updated Architecture', () => {
  it('should escape HTML characters using new utility function', () => {
    const escaped = escapeHtml('<script>alert("xss")</script>')
    expect(escaped).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;')
  })

  it('should handle empty strings', () => {
    const escaped = escapeHtml('')
    expect(escaped).toBe('')
  })

  it('should handle special characters', () => {
    const escaped = escapeHtml('&<>"\'')
    expect(escaped).toBe('&amp;&lt;&gt;"\'')
  })

  it('should handle regular text without changes', () => {
    const escaped = escapeHtml('Hello world')
    expect(escaped).toBe('Hello world')
  })
})

describe('Word Diff Logic - Updated Architecture', () => {
  // Test word diffing behavior using the diff library directly
  it('should identify added words', () => {
    const result = diffWords('Hello world', 'Hello beautiful world')

    expect(result).toEqual([
      { value: 'Hello ', added: false, removed: false, count: 1 },
      { value: 'beautiful ', added: true, removed: false, count: 1 },
      { value: 'world', added: false, removed: false, count: 1 }
    ])
  })

  it('should identify removed words', () => {
    const result = diffWords('Hello beautiful world', 'Hello world')

    expect(result).toEqual([
      { value: 'Hello ', added: false, removed: false, count: 1 },
      { value: 'beautiful ', added: false, removed: true, count: 1 },
      { value: 'world', added: false, removed: false, count: 1 }
    ])
  })

  it('should handle complete replacement', () => {
    const result = diffWords('old text', 'new text')

    expect(result).toEqual([
      { value: 'old', added: false, removed: true, count: 1 },
      { value: 'new', added: true, removed: false, count: 1 },
      { value: ' text', added: false, removed: false, count: 1 }
    ])
  })

  it('should handle empty strings', () => {
    expect(diffWords('', 'new')).toEqual([
      { value: 'new', added: true, removed: false, count: 1 }
    ])

    expect(diffWords('old', '')).toEqual([
      { value: 'old', added: false, removed: true, count: 1 }
    ])
  })

  it('should detect word-level changes correctly', () => {
    const result = diffWords('Hello world', 'Hello beautiful world')

    // Check that it has the right structure
    expect(result.length).toBe(3)
    expect(result[0].value).toBe('Hello ')
    expect(result[1].value).toBe('beautiful ')
    expect(result[1].added).toBe(true)
    expect(result[2].value).toBe('world')
  })
})

describe('Function-based Architecture Integration', () => {
  const { createWordDiffHTML } = require('../../src/diff/wordDiffer')
  const { processLineDiff } = require('../../src/diff/diffProcessor')

  it('should integrate word differ with new architecture', () => {
    const wordDiffer = createWordDiffHTML(diffWords)
    const [left, right] = wordDiffer('Hello world', 'Hello beautiful world')

    expect(left).toContain('Hello ')
    expect(left).toContain('world')
    expect(right).toContain('Hello ')
    expect(right).toContain('<span class="word-added">beautiful </span>')
    expect(right).toContain('world')
  })

  it('should integrate diff processor with new architecture', () => {
    const mockDiffLines = (text1, text2) => [
      { value: 'Hello\n', added: false, removed: false },
      { value: 'world\n', removed: true },
      { value: 'universe\n', added: true }
    ]

    const result = processLineDiff(mockDiffLines, 'Hello\nworld', 'Hello\nuniverse')

    expect(result).toHaveLength(2)
    expect(result[0].unchanged).toHaveLength(1)
    expect(result[1].removed).toHaveLength(1)
    expect(result[1].added).toHaveLength(1)
  })
})
