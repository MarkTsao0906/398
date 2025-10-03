const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const size = 15;
let currentPlayer = 'black';
let board = Array.from({length:size},()=>Array(size).fill(null));
let gameOver = false;

// 建立棋盤交點
for (let i=0;i<size;i++){
  for (let j=0;j<size;j++){
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.style.left = `${j*32+32}px`;
    cell.style.top = `${i*32+32}px`;
    cell.dataset.x = j;
    cell.dataset.y = i;

    cell.addEventListener('click', ()=> placeStone(cell));
    boardEl.appendChild(cell);
  }
}

// 下棋
function placeStone(cell){
  if(gameOver) return;
  const x = parseInt(cell.dataset.x);
  const y = parseInt(cell.dataset.y);

  if(board[y][x]) return; // 已有棋子

  const stone = document.createElement('div');
  stone.classList.add('stone', currentPlayer);
  cell.appendChild(stone);

  board[y][x] = currentPlayer;

  if(checkWin(x,y,currentPlayer)){
    statusEl.textContent = `${currentPlayer==='black'?'黑子':'白子'} 勝利！`;
    gameOver = true;
    return;
  }

  currentPlayer = currentPlayer==='black'?'white':'black';
  statusEl.textContent = `輪到: ${currentPlayer==='black'?'黑子':'白子'}`;
}

// 判五子連線
function checkWin(x,y,color){
  const directions = [
    [1,0],[0,1],[1,1],[1,-1]
  ];

  for(const [dx,dy] of directions){
    let count = 1;
    // 正方向
    let nx = x+dx, ny = y+dy;
    while(nx>=0 && nx<size && ny>=0 && ny<size && board[ny][nx]===color){
      count++; nx+=dx; ny+=dy;
    }
    // 反方向
    nx = x-dx; ny = y-dy;
    while(nx>=0 && nx<size && ny>=0 && ny<size && board[ny][nx]===color){
      count++; nx-=dx; ny-=dy;
    }

    if(count>=5) return true;
  }
  return false;
}
