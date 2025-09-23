import { describe, it, expect, beforeEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'

// Set up DOM for tests
const dom = new JSDOM()
global.document = dom.window.document
global.window = dom.window

const { createWordDiffHTML, processWordDiff, createWordDiffPair } = require('../../src/diff/wordDiffer')

describe('Word Differ', () => {
  describe('createWordDiffHTML', () => {
    const mockDiffWords = vi.fn()
    const wordDiffer = createWordDiffHTML(mockDiffWords)

    beforeEach(() => {
      mockDiffWords.mockClear()
    })

    it('should handle empty strings', () => {
      // Empty strings have early return, don't call diffWords
      expect(wordDiffer('', '')).toEqual(['', ''])
      expect(mockDiffWords).not.toHaveBeenCalled()
    })

    it('should handle addition only', () => {
      // Addition only has early return, doesn't call diffWords
      const [left, right] = wordDiffer('', 'new text')
      expect(left).toBe('')
      expect(right).toBe('<span class="word-added">new text</span>')
      expect(mockDiffWords).not.toHaveBeenCalled()
    })

    it('should handle removal only', () => {
      // Removal only has early return, doesn't call diffWords
      const [left, right] = wordDiffer('old text', '')
      expect(left).toBe('<span class="word-removed">old text</span>')
      expect(right).toBe('')
      expect(mockDiffWords).not.toHaveBeenCalled()
    })

    it('should handle word-level changes', () => {
      mockDiffWords.mockReturnValue([
        { value: 'Hello ', added: false, removed: false },
        { value: 'beautiful ', added: true, removed: false },
        { value: 'world', added: false, removed: false }
      ])
      const [left, right] = wordDiffer('Hello world', 'Hello beautiful world')
      expect(left).toContain('Hello ')
      expect(left).toContain('world')
      expect(right).toContain('Hello ')
      expect(right).toContain('<span class="word-added">beautiful </span>')
      expect(right).toContain('world')
      expect(mockDiffWords).toHaveBeenCalledWith('Hello world', 'Hello beautiful world')
    })

    it('should handle complete replacement', () => {
      mockDiffWords.mockReturnValue([
        { value: 'old', added: false, removed: true },
        { value: 'new', added: true, removed: false },
        { value: ' text', added: false, removed: false }
      ])
      const [left, right] = wordDiffer('old text', 'new text')
      expect(left).toContain('<span class="word-removed">old</span>')
      expect(right).toContain('<span class="word-added">new</span>')
      expect(left).toContain(' text')
      expect(right).toContain(' text')
      expect(mockDiffWords).toHaveBeenCalledWith('old text', 'new text')
    })

    it('should escape HTML in content', () => {
      mockDiffWords.mockReturnValue([
        { value: '<', added: false, removed: false },
        { value: 'script', added: false, removed: true },
        { value: 'div', added: true, removed: false },
        { value: '>', added: false, removed: false }
      ])
      const [left, right] = wordDiffer('<script>', '<div>')
      // HTML should be escaped and changes highlighted
      expect(left).toContain('&lt;')
      expect(left).toContain('<span class="word-removed">script</span>')
      expect(left).toContain('&gt;')
      expect(right).toContain('&lt;')
      expect(right).toContain('<span class="word-added">div</span>')
      expect(right).toContain('&gt;')
      expect(mockDiffWords).toHaveBeenCalledWith('<script>', '<div>')
    })
  })

  describe('processWordDiff', () => {
    it('should process word diff with additions', () => {
      const wordDiff = [
        { value: 'Hello ', added: false, removed: false },
        { value: 'beautiful ', added: true, removed: false },
        { value: 'world', added: false, removed: false }
      ]

      const [left, right] = processWordDiff(wordDiff)
      expect(left).toBe('Hello world')
      expect(right).toBe('Hello <span class="word-added">beautiful </span>world')
    })

    it('should process word diff with removals', () => {
      const wordDiff = [
        { value: 'Hello ', added: false, removed: false },
        { value: 'old ', added: false, removed: true },
        { value: 'world', added: false, removed: false }
      ]

      const [left, right] = processWordDiff(wordDiff)
      expect(left).toBe('Hello <span class="word-removed">old </span>world')
      expect(right).toBe('Hello world')
    })

    it('should process word diff with replacements', () => {
      const wordDiff = [
        { value: 'old', added: false, removed: true },
        { value: 'new', added: true, removed: false },
        { value: ' text', added: false, removed: false }
      ]

      const [left, right] = processWordDiff(wordDiff)
      expect(left).toBe('<span class="word-removed">old</span> text')
      expect(right).toBe('<span class="word-added">new</span> text')
    })

    it('should handle empty diff', () => {
      const [left, right] = processWordDiff([])
      expect(left).toBe('')
      expect(right).toBe('')
    })
  })

  describe('createWordDiffPair', () => {
    const mockDiffWords = vi.fn()

    beforeEach(() => {
      mockDiffWords.mockClear()
    })

    it('should create word diff pair correctly', () => {
      mockDiffWords.mockReturnValue([
        { value: 'Hello ', added: false, removed: false },
        { value: 'beautiful ', added: true, removed: false },
        { value: 'world', added: false, removed: false }
      ])
      const [left, right] = createWordDiffPair(mockDiffWords, 'Hello world', 'Hello beautiful world')
      expect(left).toContain('Hello ')
      expect(right).toContain('<span class="word-added">beautiful </span>')
      expect(mockDiffWords).toHaveBeenCalledWith('Hello world', 'Hello beautiful world')
    })

    it('should handle empty strings', () => {
      // Empty strings have early return in createWordDiffHTML
      const [left, right] = createWordDiffPair(mockDiffWords, '', '')
      expect(left).toBe('')
      expect(right).toBe('')
      expect(mockDiffWords).not.toHaveBeenCalled()
    })
  })
})
