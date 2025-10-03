// 簡單五子棋（前端單機） + 名單與配對（本地隨機排程）
// 儲存機制：使用 localStorage（僅為本機暫存）；若要讓班上同學看到同樣的變更，請編輯 GitHub repo 上的檔案並 Commit。

const SIZE = 15;
let board = [];
let current = 'black';
let gameOver = false;
let players = JSON.parse(localStorage.getItem('gomoku_players')||'[]');

const boardEl = document.getElementById('board');
const statusEl = document.getElementById('currentPlayer');
const playersListEl = document.getElementById('playersList');
const pairsTableBody = document.querySelector('#pairsTable tbody');

function initBoard() {
  board = Array.from({length: SIZE}, ()=> Array(SIZE).fill(null));
  boardEl.innerHTML = '';
  for (let y=0; y<SIZE; y++){
    for (let x=0; x<SIZE; x++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.x = x; cell.dataset.y = y;
      cell.addEventListener('click', onCellClick);
      boardEl.appendChild(cell);
    }
  }
  current = 'black'; gameOver=false;
  updateStatus();
}

function onCellClick(e){
  if (gameOver) return;
  const x = +e.currentTarget.dataset.x;
  const y = +e.currentTarget.dataset.y;
  if (board[y][x]) return; // 已有棋子
  board[y][x] = current;
  renderStone(e.currentTarget, current);
  const winPositions = checkWin(x,y);
  if (winPositions) {
    gameOver = true;
    highlightWin(winPositions);
    alert((current==='black'?'黑子':'白子') + ' 勝利！');
    return;
  }
  current = (current === 'black') ? 'white' : 'black';
  updateStatus();
}

function renderStone(cellEl, color) {
  cellEl.classList.add(color);
  const s = document.createElement('div');
  s.className = 'stone';
  cellEl.appendChild(s);
}

function updateStatus(){
  statusEl.textContent = current==='black' ? '黑子' : '白子';
}

// 檢查五子（回傳勝利位置陣列或 null）
function checkWin(x,y){
  const dirs = [[1,0],[0,1],[1,1],[1,-1]];
  for (const [dx,dy] of dirs){
    let count = 1;
    const positions = [[x,y]];
    // 正方向
    let nx = x + dx, ny = y + dy;
    while (inBounds(nx,ny) && board[ny][nx] === current){
      positions.push([nx,ny]); count++; nx += dx; ny += dy;
    }
    // 反方向
    nx = x - dx; ny = y - dy;
    while (inBounds(nx,ny) && board[ny][nx] === current){
      positions.push([nx,ny]); count++; nx -= dx; ny -= dy;
    }
    if (count >= 5) return positions;
  }
  return null;
}

function inBounds(x,y){ return x>=0 && x<SIZE && y>=0 && y<SIZE; }

function highlightWin(positions){
  for (const [x,y] of positions){
    const sel = `.cell[data-x="${x}"][data-y="${y}"]`;
    const el = document.querySelector(sel);
    if (el) el.classList.add('win');
  }
}

// 重新開始
document.getElementById('restartBtn').addEventListener('click', ()=>{
  initBoard();
  // 先移除所有 cell 的 class
  document.querySelectorAll('.cell').forEach(c => { c.className='cell'; c.innerHTML=''; });
});

// 名單管理
function renderPlayers(){
  playersListEl.innerHTML = '';
  players.forEach((p, i) => {
    const li = document.createElement('li');
    li.textContent = p;
    const btn = document.createElement('button');
    btn.textContent = '刪除';
    btn.addEventListener('click', ()=>{
      players.splice(i,1); savePlayers(); renderPlayers(); renderPairs([]);
    });
    li.appendChild(btn);
    playersListEl.appendChild(li);
  });
  savePlayers();
}

function savePlayers(){
  localStorage.setItem('gomoku_players', JSON.stringify(players));
}

document.getElementById('addPlayerForm').addEventListener('submit', (e)=>{
  e.preventDefault();
  const name = document.getElementById('playerName').value.trim();
  if (name) {
    players.push(name);
    document.getElementById('playerName').value = '';
    renderPlayers();
  }
});

document.getElementById('resetPlayersBtn').addEventListener('click', ()=>{
  if (!confirm('確定要清空所有參賽名單？')) return;
  players = []; savePlayers(); renderPlayers(); renderPairs([]);
});

// 產生隨機對戰（每輪隨機 pair，奇數則有輪空）
document.getElementById('genPairsBtn').addEventListener('click', ()=>{
  const pairs = generatePairs(players.slice());
  renderPairs(pairs);
});

function generatePairs(arr){
  // Fisher-Yates shuffle
  for (let i = arr.length-1; i>0; i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  const pairs = [];
  for (let i=0; i+1<arr.length; i+=2){
    pairs.push([arr[i], arr[i+1]]);
  }
  if (arr.length % 2 === 1){
    pairs.push([arr[arr.length-1], '輪空']);
  }
  return pairs;
}

function renderPairs(pairs){
  pairsTableBody.innerHTML = '';
  pairs.forEach((p,i)=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${i+1}</td><td>${p[0] || ''}</td><td>${p[1] || ''}</td><td>?</td>`;
    pairsTableBody.appendChild(tr);
  });
}

// 頁面初始化
initBoard();
renderPlayers();
renderPairs([]);
