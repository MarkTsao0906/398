const socket = io(); 
const boardEl = document.getElementById('board');
const statusEl = document.getElementById('status');
const restartBtn = document.getElementById('restart');

const urlParams = new URLSearchParams(window.location.search);
const room = urlParams.get('room');
let size = 15;
let currentPlayer = null; 
let myTurn = false;
let board = Array.from({length:size},()=>Array(size).fill(null));
let gameOver = false;


socket.emit('joinRoom', room);


socket.on('init', (color) => {
  currentPlayer = color;
  myTurn = color==='black'; 
  statusEl.textContent = `你是${color==='black'?'黑子':'白子'}，${myTurn?'你的回合':'等待對手'}`;
});


socket.on('opponentMove', ({x,y,color})=>{
  placeStoneLocal(x,y,color);
  myTurn = true;
  statusEl.textContent = '換你了拉 快下';
});


for (let i=0;i<size;i++){
  for (let j=0;j<size;j++){
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.style.left = `${j*32 + 32}px`;
    cell.style.top = `${i*32 + 32}px`;
    cell.dataset.x = j;
    cell.dataset.y = i;

    cell.addEventListener('click', ()=> {
      if(!myTurn || gameOver) return;
      if(board[i][j]) return;
      socket.emit('makeMove', {room,x:j,y:i});
    });
    boardEl.appendChild(cell);
  }
}


function placeStoneLocal(x,y,color){
  const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
  const stone = document.createElement('div');
  stone.classList.add('stone', color);
  cell.appendChild(stone);
  board[y][x] = color;
  if(checkWin(x,y,color)){
    statusEl.textContent = `${color==='black'?'黑子':'白子'} 贏！`;
    gameOver = true;
    restartBtn.style.display = 'inline-block';
  }
}

function checkWin(x,y,color){
  const directions = [[1,0],[0,1],[1,1],[1,-1]];
  for(const [dx,dy] of directions){
    let count=1;
    let nx=x+dx, ny=y+dy;
    while(nx>=0&&nx<size&&ny>=0&&ny<size&&board[ny][nx]===color){count++;nx+=dx;ny+=dy;}
    nx=x-dx; ny=y-dy;
    while(nx>=0&&nx<size&&ny>=0&&ny<size&&board[ny][nx]===color){count++;nx-=dx;ny-=dy;}
    if(count>=5) return true;
  }
  return false;
}


restartBtn.addEventListener('click',()=>{
  socket.emit('restart', room);
});
socket.on('restartBoard', ()=>{
  board = Array.from({length:size},()=>Array(size).fill(null));
  document.querySelectorAll('.stone').forEach(s=>s.remove());
  gameOver = false;
  restartBtn.style.display='none';
  myTurn = currentPlayer==='black';
  statusEl.textContent = myTurn?'你的回合':'等待對手';
});
