/**
 * Pure rendering functions that generate HTML content
 */

const { escapeHtml, wrapWithSpan } = require('../utils/htmlUtils');

const renderUnchangedLine = (line) => ({
  left: createLineDiv('unchanged', escapeHtml(line)),
  right: createLineDiv('unchanged', escapeHtml(line))
});

const renderLinePair = (wordDiffer) => (oldLine, newLine) => {
  if (!oldLine && newLine) {
    return {
      left: createLineDiv('placeholder', ''),
      right: createLineDiv('added', wrapWithSpan(newLine, 'word-added'))
    };
  }

  if (oldLine && !newLine) {
    return {
      left: createLineDiv('removed', wrapWithSpan(oldLine, 'word-removed')),
      right: createLineDiv('placeholder', '')
    };
  }

  if (oldLine && newLine) {
    const [leftHTML, rightHTML] = wordDiffer(oldLine, newLine);
    return {
      left: createLineDiv('removed', leftHTML),
      right: createLineDiv('added', rightHTML)
    };
  }

  return { left: '', right: '' };
};

const createLineDiv = (className, content) =>
  `<div class="${className}">${content}</div>`;

const renderDiffGroup = (wordDiffer, extractLines) => (group) => {
  if (group.unchanged.length > 0) {
    return group.unchanged.flatMap(part =>
      extractLines([part]).map(renderUnchangedLine)
    );
  }

  const removedLines = extractLines(group.removed);
  const addedLines = extractLines(group.added);
  const maxLines = Math.max(removedLines.length, addedLines.length);

  const linePairRenderer = renderLinePair(wordDiffer);

  return Array.from({ length: maxLines }, (_, i) =>
    linePairRenderer(removedLines[i] || '', addedLines[i] || '')
  );
};

const renderAllGroups = (groupedDiff, wordDiffer, extractLines) => {
  const groupRenderer = renderDiffGroup(wordDiffer, extractLines);
  return groupedDiff.flatMap(groupRenderer);
};

const extractRenderedContent = (renderedLines) => {
  const leftHTML = renderedLines.map(line => line.left).join('');
  const rightHTML = renderedLines.map(line => line.right).join('');

  return { leftHTML, rightHTML };
};

module.exports = {
  renderUnchangedLine,
  renderLinePair,
  renderDiffGroup,
  renderAllGroups,
  extractRenderedContent,
  createLineDiv
};
