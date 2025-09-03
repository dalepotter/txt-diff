/**
 * Pure diff processing functions
 */

const groupConsecutiveChanges = (diff) => {
  const result = [];
  let currentGroup = createEmptyGroup();

  for (const part of diff) {
    if (part.removed) {
      currentGroup.removed.push(part);
    } else if (part.added) {
      currentGroup.added.push(part);
    } else {
      if (hasChanges(currentGroup)) {
        result.push(currentGroup);
        currentGroup = createEmptyGroup();
      }
      result.push({ unchanged: [part], removed: [], added: [] });
    }
  }

  if (hasChanges(currentGroup)) {
    result.push(currentGroup);
  }

  return result;
};

const extractLines = (parts) =>
  parts.flatMap(part => {
    const lines = part.value.split('\n');
    return lines[lines.length - 1] === '' ? lines.slice(0, -1) : lines;
  });

const createEmptyGroup = () => ({ removed: [], added: [], unchanged: [] });

const hasChanges = (group) => group.removed.length > 0 || group.added.length > 0;

const processLineDiff = (diffLines, text1, text2) => {
  const diff = diffLines(text1, text2);
  return groupConsecutiveChanges(diff);
};

const separateGroupTypes = (groupedDiff) => {
  const unchangedGroups = [];
  const changedGroups = [];

  groupedDiff.forEach(group => {
    if (group.unchanged.length > 0) {
      unchangedGroups.push(group);
    } else {
      changedGroups.push(group);
    }
  });

  return { unchangedGroups, changedGroups };
};

module.exports = {
  groupConsecutiveChanges,
  extractLines,
  createEmptyGroup,
  hasChanges,
  processLineDiff,
  separateGroupTypes
};
