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
      const lines = part.value.split('\n');
      // Remove last empty string if trailing newline
      if (lines[lines.length - 1] === '') lines.pop();

      lines.forEach(line => {
        const leftLine = document.createElement('div');
        const rightLine = document.createElement('div');

        if (part.added) {
          // Added text → right only
          leftLine.classList.add('placeholder');
          leftLine.textContent = '';
          rightLine.classList.add('added');
          rightLine.textContent = line;
        } else if (part.removed) {
          // Removed text → left only
          leftLine.classList.add('removed');
          leftLine.textContent = line;
          rightLine.classList.add('placeholder');
          rightLine.textContent = '';
        } else {
          // Unchanged text → both sides
          leftLine.classList.add('unchanged');
          leftLine.textContent = line;
          rightLine.classList.add('unchanged');
          rightLine.textContent = line;
        }

        leftDiv.appendChild(leftLine);
        rightDiv.appendChild(rightLine);
      });
    });
  });
});
