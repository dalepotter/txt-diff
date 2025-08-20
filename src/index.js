const {
  diffLines
} = require('diff');
require('./style.css');

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

    diff.forEach(part => {
      const leftLine = document.createElement('div');
      const rightLine = document.createElement('div');

      if (part.added) {
        // Added on right only
        rightLine.classList.add('added');
        rightLine.textContent = part.value;
        leftLine.textContent = '';
      } else if (part.removed) {
        // Removed on left only
        leftLine.classList.add('removed');
        leftLine.textContent = part.value;
        rightLine.textContent = '';
      } else {
        // Unchanged
        leftLine.classList.add('unchanged');
        rightLine.classList.add('unchanged');
        leftLine.textContent = part.value;
        rightLine.textContent = part.value;
      }

      leftDiv.appendChild(leftLine);
      rightDiv.appendChild(rightLine);
    });
  });
});
