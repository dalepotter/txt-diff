/**
 * Word-level diff functions
 */

const { escapeHtml, wrapWithSpan } = require('../utils/htmlUtils');

const createWordDiffHTML = (diffWords) => (oldLine, newLine) => {
  if (!oldLine && !newLine) return ['', ''];
  if (!oldLine) return ['', wrapWithSpan(newLine, 'word-added')];
  if (!newLine) return [wrapWithSpan(oldLine, 'word-removed'), ''];

  return processWordDiff(diffWords(oldLine, newLine));
};

const processWordDiff = (wordDiff) => {
  return wordDiff.reduce(
    (acc, part) => {
      if (part.added) {
        acc[1] += wrapWithSpan(part.value, 'word-added');
      } else if (part.removed) {
        acc[0] += wrapWithSpan(part.value, 'word-removed');
      } else {
        const escapedText = escapeHtml(part.value);
        acc[0] += escapedText;
        acc[1] += escapedText;
      }
      return acc;
    },
    ['', '']
  );
};

const createWordDiffPair = (diffWords, oldLine, newLine) => {
  const wordDiffFn = createWordDiffHTML(diffWords);
  return wordDiffFn(oldLine, newLine);
};

module.exports = {
  createWordDiffHTML,
  processWordDiff,
  createWordDiffPair
};
