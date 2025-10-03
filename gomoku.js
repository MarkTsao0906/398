const board = document.getElementById('board');
const size = 15; // 15x15 棋盤
let currentPlayer = 'black';

// 建立交點
for (let i = 0; i < size; i++) {
  for (let j = 0; j < size; j++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.style.left = `${j * 32 + 32}px`;
    cell.style.top = `${i * 32 + 32}px`;

    cell.addEventListener('click', () => placeStone(cell));
    board.appendChild(cell);
  }
}

function placeStone(cell) {
  if (cell.querySelector('.stone')) return; // 已經有棋子

  const stone = document.createElement('div');
  stone.classList.add('stone', currentPlayer);
  cell.appendChild(stone);

  // 換手
  currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
}

