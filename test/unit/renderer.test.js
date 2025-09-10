import { describe, it, expect, beforeEach } from 'vitest'
import { JSDOM } from 'jsdom'

// Set up DOM for tests
const dom = new JSDOM()
global.document = dom.window.document
global.window = dom.window

const {
  renderUnchangedLine,
  renderLinePair,
  renderDiffGroup,
  renderAllGroups,
  extractRenderedContent,
  createLineDiv,
  resetLineCounter
} = require('../../src/render/renderer')

describe('Renderer', () => {
  beforeEach(() => {
    resetLineCounter()
  })

  describe('createLineDiv', () => {
    it('should create line div with class and content', () => {
      const result = createLineDiv('test-class', 'content')
      expect(result).toBe('<div class="test-class" data-line="1">content</div>')
    })

    it('should handle empty content', () => {
      const result = createLineDiv('empty', '')
      expect(result).toBe('<div class="empty" data-line="1"></div>')
    })
  })

  describe('renderUnchangedLine', () => {
    it('should render unchanged line for both sides', () => {
      const result = renderUnchangedLine('Hello world')

      expect(result.left).toBe('<div class="unchanged" data-line="1">Hello world</div>')
      expect(result.right).toBe('<div class="unchanged" data-line="2">Hello world</div>')
    })

    it('should escape HTML in unchanged line', () => {
      const result = renderUnchangedLine('<script>alert("test")</script>')

      expect(result.left).toContain('&lt;script&gt;')
      expect(result.right).toContain('&lt;script&gt;')
    })
  })

  describe('renderLinePair', () => {
    const mockWordDiffer = (oldLine, newLine) => {
      if (oldLine === 'old' && newLine === 'new') {
        return ['<span class="word-removed">old</span>', '<span class="word-added">new</span>']
      }
      return [oldLine, newLine]
    }

    const linePairRenderer = renderLinePair(mockWordDiffer)

    it('should handle addition only', () => {
      const result = linePairRenderer('', 'new line')

      expect(result.left).toBe('<div class="placeholder" data-line="1"></div>')
      expect(result.right).toBe('<div class="added" data-line="2"><span class="word-added">new line</span></div>')
    })

    it('should handle removal only', () => {
      const result = linePairRenderer('old line', '')

      expect(result.left).toBe('<div class="removed" data-line="1"><span class="word-removed">old line</span></div>')
      expect(result.right).toBe('<div class="placeholder" data-line="2"></div>')
    })

    it('should handle modification with word diff', () => {
      const result = linePairRenderer('old', 'new')

      expect(result.left).toBe('<div class="removed" data-line="1"><span class="word-removed">old</span></div>')
      expect(result.right).toBe('<div class="added" data-line="2"><span class="word-added">new</span></div>')
    })

    it('should handle empty inputs', () => {
      const result = linePairRenderer('', '')

      expect(result.left).toBe('')
      expect(result.right).toBe('')
    })
  })

  describe('renderDiffGroup', () => {
    const mockWordDiffer = (oldLine, newLine) => [oldLine, newLine]
    const mockExtractLines = (parts) => parts.flatMap(part => part.value.split('\n').filter(line => line))

    const groupRenderer = renderDiffGroup(mockWordDiffer, mockExtractLines)

    it('should render unchanged group', () => {
      const group = {
        unchanged: [{ value: 'Line 1\nLine 2\n' }],
        removed: [],
        added: []
      }

      const result = groupRenderer(group)

      expect(result).toHaveLength(2)
      expect(result[0].left).toContain('unchanged')
      expect(result[0].right).toContain('unchanged')
    })

    it('should render changed group', () => {
      const group = {
        unchanged: [],
        removed: [{ value: 'old line\n' }],
        added: [{ value: 'new line\n' }]
      }

      const result = groupRenderer(group)

      expect(result).toHaveLength(1)
      expect(result[0].left).toContain('removed')
      expect(result[0].right).toContain('added')
    })

    it('should handle uneven line counts', () => {
      const group = {
        unchanged: [],
        removed: [{ value: 'old1\nold2\n' }],
        added: [{ value: 'new1\n' }]
      }

      const result = groupRenderer(group)

      expect(result).toHaveLength(2) // Max of removed (2) and added (1)
    })
  })

  describe('renderAllGroups', () => {
    const mockWordDiffer = (oldLine, newLine) => [oldLine, newLine]
    const mockExtractLines = (parts) => parts.flatMap(part => part.value.split('\n').filter(line => line))

    it('should render all groups in sequence', () => {
      const groupedDiff = [
        {
          unchanged: [{ value: 'unchanged\n' }],
          removed: [],
          added: []
        },
        {
          unchanged: [],
          removed: [{ value: 'old\n' }],
          added: [{ value: 'new\n' }]
        }
      ]

      const result = renderAllGroups(groupedDiff, mockWordDiffer, mockExtractLines)

      expect(result).toHaveLength(2)
      expect(result[0].left).toContain('unchanged')
      expect(result[1].left).toContain('removed')
    })
  })

  describe('extractRenderedContent', () => {
    it('should extract left and right HTML content', () => {
      const renderedLines = [
        { left: '<div>left1</div>', right: '<div>right1</div>' },
        { left: '<div>left2</div>', right: '<div>right2</div>' }
      ]

      const result = extractRenderedContent(renderedLines)

      expect(result.leftHTML).toBe('<div>left1</div><div>left2</div>')
      expect(result.rightHTML).toBe('<div>right1</div><div>right2</div>')
    })

    it('should handle empty rendered lines', () => {
      const result = extractRenderedContent([])

      expect(result.leftHTML).toBe('')
      expect(result.rightHTML).toBe('')
    })
  })

  describe('Line Counter', () => {
    it('should increment line counter for each createLineDiv call', () => {
      resetLineCounter()

      const line1 = createLineDiv('test', 'content1')
      const line2 = createLineDiv('test', 'content2')
      const line3 = createLineDiv('test', 'content3')

      expect(line1).toContain('data-line="1"')
      expect(line2).toContain('data-line="2"')
      expect(line3).toContain('data-line="3"')
    })

    it('should reset line counter when resetLineCounter is called', () => {
      // Create some lines to increment counter
      createLineDiv('test', 'content1')
      createLineDiv('test', 'content2')

      // Reset and verify it starts from 1 again
      resetLineCounter()
      const line1 = createLineDiv('test', 'content')

      expect(line1).toContain('data-line="1"')
    })

    it('should reset line counter in renderAllGroups', () => {
      // Create some lines to increment counter
      createLineDiv('test', 'content1')
      createLineDiv('test', 'content2')

      const mockWordDiffer = (oldLine, newLine) => [oldLine, newLine]
      const mockExtractLines = (parts) => parts.map(part => part.value.split('\n').filter(line => line))

      const groupedDiff = [
        {
          unchanged: [{ value: 'unchanged line\n' }],
          removed: [],
          added: []
        }
      ]

      const result = renderAllGroups(groupedDiff, mockWordDiffer, mockExtractLines)

      // Should have reset counter and started from 1 again
      expect(result[0].left).toContain('data-line="1"')
      expect(result[0].right).toContain('data-line="2"')
    })
  })
})
