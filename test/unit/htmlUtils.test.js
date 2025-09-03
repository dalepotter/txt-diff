import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

// Set up DOM for tests
const dom = new JSDOM()
global.document = dom.window.document
global.window = dom.window

// Import the module after setting up DOM
const { escapeHtml, createElementString, wrapWithSpan, createElement } = require('../../src/utils/htmlUtils')

describe('HTML Utils', () => {
  describe('escapeHtml', () => {
    it('should escape HTML characters', () => {
      const result = escapeHtml('<script>alert("xss")</script>')
      expect(result).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;')
    })

    it('should handle empty strings', () => {
      expect(escapeHtml('')).toBe('')
    })

    it('should handle special characters', () => {
      const result = escapeHtml('&<>"\'')
      expect(result).toBe('&amp;&lt;&gt;"\'')
    })

    it('should handle regular text without changes', () => {
      const result = escapeHtml('Hello world')
      expect(result).toBe('Hello world')
    })
  })

  describe('createElementString', () => {
    it('should create basic element string', () => {
      const result = createElementString('div', '', 'content')
      expect(result).toBe('<div>content</div>')
    })

    it('should create element with class', () => {
      const result = createElementString('span', 'highlight', 'text')
      expect(result).toBe('<span class="highlight">text</span>')
    })

    it('should create element without content', () => {
      const result = createElementString('div', 'empty')
      expect(result).toBe('<div class="empty"></div>')
    })

    it('should create element without class', () => {
      const result = createElementString('p', '', 'paragraph')
      expect(result).toBe('<p>paragraph</p>')
    })
  })

  describe('wrapWithSpan', () => {
    it('should wrap content with span and class', () => {
      const result = wrapWithSpan('highlighted text', 'word-added')
      expect(result).toBe('<span class="word-added">highlighted text</span>')
    })

    it('should escape HTML in content', () => {
      const result = wrapWithSpan('<script>', 'safe')
      expect(result).toBe('<span class="safe">&lt;script&gt;</span>')
    })

    it('should handle empty content', () => {
      const result = wrapWithSpan('', 'empty')
      expect(result).toBe('<span class="empty"></span>')
    })
  })

  describe('createElement', () => {
    it('should create DOM element with class and text content', () => {
      const element = createElement('div', 'test-class', 'text content')
      expect(element.tagName).toBe('DIV')
      expect(element.className).toBe('test-class')
      expect(element.textContent).toBe('text content')
    })

    it('should create element with HTML content', () => {
      const element = createElement('div', 'html-content', '<strong>bold</strong>')
      expect(element.innerHTML).toBe('<strong>bold</strong>')
    })

    it('should create element without content', () => {
      const element = createElement('span', 'empty')
      expect(element.textContent).toBe('')
      expect(element.className).toBe('empty')
    })

    it('should create element without class', () => {
      const element = createElement('p', '', 'paragraph')
      expect(element.textContent).toBe('paragraph')
      expect(element.className).toBe('')
    })
  })
})
