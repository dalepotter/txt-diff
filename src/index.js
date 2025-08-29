const {
  diffLines,
  diffWords
} = require('diff');
require('./style.css');

function createWordDiffHTML(oldLine, newLine) {
  if (!oldLine && !newLine) return ['', ''];
  if (!oldLine) return ['', `<span class="word-added">${escapeHtml(newLine)}</span>`];
  if (!newLine) return [`<span class="word-removed">${escapeHtml(oldLine)}</span>`, ''];

  const wordDiff = diffWords(oldLine, newLine);
  let leftHTML = '';
  let rightHTML = '';

  wordDiff.forEach(part => {
    const escapedText = escapeHtml(part.value);
    if (part.added) {
      rightHTML += `<span class="word-added">${escapedText}</span>`;
    } else if (part.removed) {
      leftHTML += `<span class="word-removed">${escapedText}</span>`;
    } else {
      leftHTML += escapedText;
      rightHTML += escapedText;
    }
  });

  return [leftHTML, rightHTML];
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('compareBtn');
  const leftDiv = document.getElementById('diffLeft');
  const rightDiv = document.getElementById('diffRight');

  btn.addEventListener('click', () => {
    const text1 = document.getElementById('text1').value;
    const text2 = document.getElementById('text2').value;

    const diff = diffLines(text1, text2);

    leftDiv.innerHTML = '';
    rightDiv.innerHTML = '';

    // Group consecutive removed and added parts for word-level diffing
    const groupedDiff = [];
    let currentGroup = { removed: [], added: [], unchanged: [] };

    diff.forEach(part => {
      if (part.removed) {
        currentGroup.removed.push(part);
      } else if (part.added) {
        currentGroup.added.push(part);
      } else {
        // Process current group if it has changes
        if (currentGroup.removed.length > 0 || currentGroup.added.length > 0) {
          groupedDiff.push(currentGroup);
          currentGroup = { removed: [], added: [], unchanged: [] };
        }
        groupedDiff.push({ unchanged: [part], removed: [], added: [] });
      }
    });

    // Don't forget the last group
    if (currentGroup.removed.length > 0 || currentGroup.added.length > 0) {
      groupedDiff.push(currentGroup);
    }

    groupedDiff.forEach(group => {
      if (group.unchanged.length > 0) {
        // Handle unchanged lines normally
        group.unchanged.forEach(part => {
          const lines = part.value.split('\n');
          if (lines[lines.length - 1] === '') lines.pop();

          lines.forEach(line => {
            const leftLine = document.createElement('div');
            const rightLine = document.createElement('div');

            leftLine.classList.add('unchanged');
            leftLine.textContent = line;
            rightLine.classList.add('unchanged');
            rightLine.textContent = line;

            leftDiv.appendChild(leftLine);
            rightDiv.appendChild(rightLine);
          });
        });
      } else {
        // Handle changed lines with word-level diff
        const removedLines = group.removed.flatMap(part => {
          const lines = part.value.split('\n');
          if (lines[lines.length - 1] === '') lines.pop();
          return lines;
        });

        const addedLines = group.added.flatMap(part => {
          const lines = part.value.split('\n');
          if (lines[lines.length - 1] === '') lines.pop();
          return lines;
        });

        const maxLines = Math.max(removedLines.length, addedLines.length);

        for (let i = 0; i < maxLines; i++) {
          const leftLine = document.createElement('div');
          const rightLine = document.createElement('div');

          const oldLine = removedLines[i] || '';
          const newLine = addedLines[i] || '';

          if (!oldLine && newLine) {
            // Pure addition
            leftLine.classList.add('placeholder');
            leftLine.textContent = '';
            rightLine.classList.add('added');
            rightLine.innerHTML = `<span class="word-added">${escapeHtml(newLine)}</span>`;
          } else if (oldLine && !newLine) {
            // Pure removal
            leftLine.classList.add('removed');
            leftLine.innerHTML = `<span class="word-removed">${escapeHtml(oldLine)}</span>`;
            rightLine.classList.add('placeholder');
            rightLine.textContent = '';
          } else if (oldLine && newLine) {
            // Modified line - apply word diff
            const [leftHTML, rightHTML] = createWordDiffHTML(oldLine, newLine);
            leftLine.classList.add('removed');
            leftLine.innerHTML = leftHTML;
            rightLine.classList.add('added');
            rightLine.innerHTML = rightHTML;
          }

          leftDiv.appendChild(leftLine);
          rightDiv.appendChild(rightLine);
        }
      }
    });
  });
});
