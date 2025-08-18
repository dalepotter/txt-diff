const { diffLines } = require('diff');
require('./style.css');

document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('compareBtn');
  const outputDiv = document.getElementById('diffOutput');

  btn.addEventListener('click', () => {
    const text1 = document.getElementById('text1').value;
    const text2 = document.getElementById('text2').value;

    const diff = diffLines(text1, text2);
    outputDiv.innerHTML = '';

    diff.forEach(part => {
      const div = document.createElement('div');
      div.classList.add(
        part.added ? 'added' :
        part.removed ? 'removed' : 'unchanged'
      );
      div.textContent = part.value;
      outputDiv.appendChild(div);
    });
  });
});
