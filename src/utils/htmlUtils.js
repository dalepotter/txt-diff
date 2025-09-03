/**
 * Pure HTML utility functions
 */

const escapeHtml = (text) => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

const createElementString = (tag, className = '', content = '') =>
  `<${tag}${className ? ` class="${className}"` : ''}>${content}</${tag}>`;

const wrapWithSpan = (content, className) =>
  `<span class="${className}">${escapeHtml(content)}</span>`;

const createElement = (tag, className = '', content = '') => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (content) {
    if (content.includes('<')) {
      element.innerHTML = content;
    } else {
      element.textContent = content;
    }
  }
  return element;
};

module.exports = {
  escapeHtml,
  createElementString,
  wrapWithSpan,
  createElement
};
