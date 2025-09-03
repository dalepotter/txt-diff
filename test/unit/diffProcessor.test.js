import { describe, it, expect } from 'vitest'

const {
  groupConsecutiveChanges,
  extractLines,
  createEmptyGroup,
  hasChanges,
  processLineDiff,
  separateGroupTypes
} = require('../../src/diff/diffProcessor')

describe('Diff Processor', () => {
  describe('createEmptyGroup', () => {
    it('should create empty group structure', () => {
      const group = createEmptyGroup()
      expect(group).toEqual({
        removed: [],
        added: [],
        unchanged: []
      })
    })
  })

  describe('hasChanges', () => {
    it('should return false for empty group', () => {
      const group = createEmptyGroup()
      expect(hasChanges(group)).toBe(false)
    })

    it('should return true for group with removals', () => {
      const group = { removed: [{}], added: [], unchanged: [] }
      expect(hasChanges(group)).toBe(true)
    })

    it('should return true for group with additions', () => {
      const group = { removed: [], added: [{}], unchanged: [] }
      expect(hasChanges(group)).toBe(true)
    })

    it('should return true for group with both changes', () => {
      const group = { removed: [{}], added: [{}], unchanged: [] }
      expect(hasChanges(group)).toBe(true)
    })
  })

  describe('extractLines', () => {
    it('should extract lines from single part', () => {
      const parts = [{ value: 'Line 1\nLine 2\nLine 3\n' }]
      const result = extractLines(parts)
      expect(result).toEqual(['Line 1', 'Line 2', 'Line 3'])
    })

    it('should extract lines without trailing newline', () => {
      const parts = [{ value: 'Line 1\nLine 2' }]
      const result = extractLines(parts)
      expect(result).toEqual(['Line 1', 'Line 2'])
    })

    it('should extract lines from multiple parts', () => {
      const parts = [
        { value: 'Line 1\n' },
        { value: 'Line 2\nLine 3\n' }
      ]
      const result = extractLines(parts)
      expect(result).toEqual(['Line 1', 'Line 2', 'Line 3'])
    })

    it('should handle empty parts', () => {
      const result = extractLines([])
      expect(result).toEqual([])
    })

    it('should handle single line without newline', () => {
      const parts = [{ value: 'Single line' }]
      const result = extractLines(parts)
      expect(result).toEqual(['Single line'])
    })
  })

  describe('groupConsecutiveChanges', () => {
    it('should group simple unchanged content', () => {
      const diff = [
        { value: 'Line 1\n', added: false, removed: false }
      ]

      const result = groupConsecutiveChanges(diff)
      expect(result).toHaveLength(1)
      expect(result[0].unchanged).toHaveLength(1)
      expect(result[0].removed).toHaveLength(0)
      expect(result[0].added).toHaveLength(0)
    })

    it('should group consecutive removals and additions', () => {
      const diff = [
        { value: 'Old line\n', removed: true },
        { value: 'New line\n', added: true }
      ]

      const result = groupConsecutiveChanges(diff)
      expect(result).toHaveLength(1)
      expect(result[0].removed).toHaveLength(1)
      expect(result[0].added).toHaveLength(1)
      expect(result[0].unchanged).toHaveLength(0)
    })

    it('should separate unchanged from changed groups', () => {
      const diff = [
        { value: 'Unchanged 1\n', added: false, removed: false },
        { value: 'Old line\n', removed: true },
        { value: 'New line\n', added: true },
        { value: 'Unchanged 2\n', added: false, removed: false }
      ]

      const result = groupConsecutiveChanges(diff)
      expect(result).toHaveLength(3)

      // First group: unchanged
      expect(result[0].unchanged).toHaveLength(1)
      expect(result[0].removed).toHaveLength(0)
      expect(result[0].added).toHaveLength(0)

      // Second group: changes
      expect(result[1].unchanged).toHaveLength(0)
      expect(result[1].removed).toHaveLength(1)
      expect(result[1].added).toHaveLength(1)

      // Third group: unchanged
      expect(result[2].unchanged).toHaveLength(1)
      expect(result[2].removed).toHaveLength(0)
      expect(result[2].added).toHaveLength(0)
    })

    it('should handle multiple consecutive changes', () => {
      const diff = [
        { value: 'Remove 1\n', removed: true },
        { value: 'Remove 2\n', removed: true },
        { value: 'Add 1\n', added: true },
        { value: 'Add 2\n', added: true }
      ]

      const result = groupConsecutiveChanges(diff)
      expect(result).toHaveLength(1)
      expect(result[0].removed).toHaveLength(2)
      expect(result[0].added).toHaveLength(2)
    })
  })

  describe('processLineDiff', () => {
    const mockDiffLines = (text1, text2) => {
      if (text1 === 'Hello\nworld' && text2 === 'Hello\nuniverse') {
        return [
          { value: 'Hello\n', added: false, removed: false },
          { value: 'world', removed: true },
          { value: 'universe', added: true }
        ]
      }
      return []
    }

    it('should process line diff correctly', () => {
      const result = processLineDiff(mockDiffLines, 'Hello\nworld', 'Hello\nuniverse')
      expect(result).toHaveLength(2)

      // First group: unchanged
      expect(result[0].unchanged).toHaveLength(1)

      // Second group: changes
      expect(result[1].removed).toHaveLength(1)
      expect(result[1].added).toHaveLength(1)
    })
  })

  describe('separateGroupTypes', () => {
    it('should separate unchanged and changed groups', () => {
      const groupedDiff = [
        { unchanged: [{}], removed: [], added: [] },
        { unchanged: [], removed: [{}], added: [{}] },
        { unchanged: [{}], removed: [], added: [] }
      ]

      const { unchangedGroups, changedGroups } = separateGroupTypes(groupedDiff)

      expect(unchangedGroups).toHaveLength(2)
      expect(changedGroups).toHaveLength(1)
    })

    it('should handle all unchanged groups', () => {
      const groupedDiff = [
        { unchanged: [{}], removed: [], added: [] },
        { unchanged: [{}], removed: [], added: [] }
      ]

      const { unchangedGroups, changedGroups } = separateGroupTypes(groupedDiff)

      expect(unchangedGroups).toHaveLength(2)
      expect(changedGroups).toHaveLength(0)
    })

    it('should handle all changed groups', () => {
      const groupedDiff = [
        { unchanged: [], removed: [{}], added: [] },
        { unchanged: [], removed: [], added: [{}] }
      ]

      const { unchangedGroups, changedGroups } = separateGroupTypes(groupedDiff)

      expect(unchangedGroups).toHaveLength(0)
      expect(changedGroups).toHaveLength(2)
    })
  })
})
