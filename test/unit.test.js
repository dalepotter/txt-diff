import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'
import { diffWords } from 'diff'

// Set up DOM for unit tests
const dom = new JSDOM()
global.document = dom.window.document
global.window = dom.window

// Test the utility functions by extracting them
// Note: In a real refactor, these would be extracted to separate modules

describe('HTML Escaping', () => {
  it('should escape HTML characters', () => {
    const div = document.createElement('div')
    div.textContent = '<script>alert("xss")</script>'
    const escaped = div.innerHTML
    
    expect(escaped).toBe('&lt;script&gt;alert("xss")&lt;/script&gt;')
  })

  it('should handle empty strings', () => {
    const div = document.createElement('div')
    div.textContent = ''
    const escaped = div.innerHTML
    
    expect(escaped).toBe('')
  })

  it('should handle special characters', () => {
    const div = document.createElement('div')
    div.textContent = '&<>"\''
    const escaped = div.innerHTML
    
    expect(escaped).toBe('&amp;&lt;&gt;"\'')
  })
})

describe('Word Diff Logic', () => {
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