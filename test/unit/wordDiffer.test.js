import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { diffWords } from 'diff'

// Set up DOM for tests
const dom = new JSDOM()
global.document = dom.window.document
global.window = dom.window

const { createWordDiffHTML, processWordDiff, createWordDiffPair } = require('../../src/diff/wordDiffer')

describe('Word Differ', () => {
  describe('createWordDiffHTML', () => {
    const wordDiffer = createWordDiffHTML(diffWords)

    it('should handle empty strings', () => {
      expect(wordDiffer('', '')).toEqual(['', ''])
    })

    it('should handle addition only', () => {
      const [left, right] = wordDiffer('', 'new text')
      expect(left).toBe('')
      expect(right).toBe('<span class="word-added">new text</span>')
    })

    it('should handle removal only', () => {
      const [left, right] = wordDiffer('old text', '')
      expect(left).toBe('<span class="word-removed">old text</span>')
      expect(right).toBe('')
    })

    it('should handle word-level changes', () => {
      const [left, right] = wordDiffer('Hello world', 'Hello beautiful world')
      expect(left).toContain('Hello ')
      expect(left).toContain('world')
      expect(right).toContain('Hello ')
      expect(right).toContain('<span class="word-added">beautiful </span>')
      expect(right).toContain('world')
    })

    it('should handle complete replacement', () => {
      const [left, right] = wordDiffer('old text', 'new text')
      expect(left).toContain('<span class="word-removed">old</span>')
      expect(right).toContain('<span class="word-added">new</span>')
      expect(left).toContain(' text')
      expect(right).toContain(' text')
    })

    it('should escape HTML in content', () => {
      const [left, right] = wordDiffer('<script>', '<div>')
      // diffWords treats < and > as separate tokens, so check for escaped content
      expect(left).toContain('&lt;')
      expect(left).toContain('<span class="word-removed">script</span>')
      expect(left).toContain('&gt;')
      expect(right).toContain('&lt;')
      expect(right).toContain('<span class="word-added">div</span>')
      expect(right).toContain('&gt;')
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
    it('should create word diff pair correctly', () => {
      const [left, right] = createWordDiffPair(diffWords, 'Hello world', 'Hello beautiful world')
      expect(left).toContain('Hello ')
      expect(right).toContain('<span class="word-added">beautiful </span>')
    })

    it('should handle empty strings', () => {
      const [left, right] = createWordDiffPair(diffWords, '', '')
      expect(left).toBe('')
      expect(right).toBe('')
    })
  })
})
