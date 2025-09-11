/**
 * Pure rendering functions that generate HTML content
 */

const { escapeHtml, wrapWithSpan } = require('../utils/htmlUtils');

const renderUnchangedLine = (line) => {
  const lineNumber = ++lineCounter;
  return {
    left: createLineDiv('unchanged', escapeHtml(line), lineNumber),
    right: createLineDiv('unchanged', escapeHtml(line), lineNumber)
  };
};

const renderLinePair = (wordDiffer) => (oldLine, newLine) => {
  const lineNumber = ++lineCounter;

  if (!oldLine && newLine) {
    return {
      left: createLineDiv('placeholder', '', lineNumber),
      right: createLineDiv('added', wrapWithSpan(newLine, 'word-added'), lineNumber)
    };
  }

  if (oldLine && !newLine) {
    return {
      left: createLineDiv('removed', wrapWithSpan(oldLine, 'word-removed'), lineNumber),
      right: createLineDiv('placeholder', '', lineNumber)
    };
  }

  if (oldLine && newLine) {
    const [leftHTML, rightHTML] = wordDiffer(oldLine, newLine);
    return {
      left: createLineDiv('removed', leftHTML, lineNumber),
      right: createLineDiv('added', rightHTML, lineNumber)
    };
  }

  return { left: '', right: '' };
};

let lineCounter = 0;

const createLineDiv = (className, content, lineNumber = null) => {
  if (lineNumber === null) {
    lineNumber = ++lineCounter;
  }
  return `<div class="${className}" data-line="${lineNumber}"><span class="line-number">${lineNumber}</span><span class="line-content">${content}</span></div>`;
};

const resetLineCounter = () => {
  lineCounter = 0;
};


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
  resetLineCounter();
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
  createLineDiv,
  resetLineCounter
};
