const SIZE=4;
const COLORS={2:'#fff2bf',4:'#ffdfa2',8:'#ffbc86',16:'#ff9895',32:'#f780aa',64:'#c7a0f7',128:'#9dc3ff',256:'#74dce2',512:'#7deaaf',1024:'#b4f47f',2048:'#ffe56b'};
export function moveGrid(board,dir){
 const out=Array(16).fill(0);let gain=0,moved=false;
 for(let row=0;row<4;row++){
  const idx=Array.from({length:4},(_,j)=>dir==='left'?row*4+j:dir==='right'?row*4+(3-j):dir==='up'?j*4+row:(3-j)*4+row);
  const values=idx.map(k=>board[k]).filter(Boolean),merged=[];
  for(let n=0;n<values.length;n++){if(n+1<values.length&&values[n]===values[n+1]){merged.push(values[n]*2);gain+=values[n]*2;n++}else merged.push(values[n]);}
  idx.forEach((k,j)=>{out[k]=merged[j]||0;if(out[k]!==board[k])moved=true;});
 }
 return {board:out,gain,moved};
}
export function canMove(board){if(board.some(x=>!x))return true;return ['left','right','up','down'].some(d=>moveGrid(board,d).moved);}
function readBest(){try{return +localStorage.getItem('ml-merge-best')||0}catch{return 0}}
function saveBest(n){try{localStorage.setItem('ml-merge-best',String(n))}catch{}}
function readState(){try{const x=JSON.parse(localStorage.getItem('ml-merge-state'));if(Array.isArray(x?.board)&&x.board.length===16&&x.board.every(Number.isInteger)&&Number.isInteger(x.score))return x}catch{}return null}
function saveState(board,score){try{localStorage.setItem('ml-merge-state',JSON.stringify({board,score}))}catch{}}
export default function mount(root){
 let board=Array(16).fill(0),score=0,best=readBest(),previous=null,done=false,continued=false,note='矢印キー、スワイプ、ボタンでタイルを動かそう。';
 function spawn(){const empty=board.map((v,i)=>v?-1:i).filter(x=>x>=0);if(empty.length)board[empty[Math.floor(Math.random()*empty.length)]]=Math.random()<.9?2:4;}
 function reset(){board=Array(16).fill(0);score=0;previous=null;done=false;continued=false;spawn();spawn();saveState(board,score);note='同じ数字を重ねて2048を作ろう！';render();}
 function move(d){if(done)return;const result=moveGrid(board,d);if(!result.moved){note='そちらには動かせません。';render();return;}previous={board:[...board],score};board=result.board;score+=result.gain;spawn();if(score>best){best=score;saveBest(best)}done=!canMove(board);if(board.some(v=>v>=2048)&&!continued){done=true;note='2048達成！さらに続けることもできます。'}else note=result.gain?result.gain+'点獲得！':'ナイスムーブ！';saveState(board,score);render();}
 function restore(){if(!previous)return;board=previous.board;score=previous.score;previous=null;done=false;note='一手もどしました。';saveState(board,score);render();}
 function render(){
 const win=board.some(v=>v>=2048);
 root.innerHTML='<div class="play-surface"><div class="play-toolbar"><div class="play-stats"><span class="stat"><small>SCORE</small><strong>'+score+'</strong></span><span class="stat"><small>BEST</small><strong>'+best+'</strong></span><span class="stat"><small>GOAL</small><strong>2048</strong></span></div><div class="toolbar-buttons"><button data-action="undo" '+(!previous?'disabled':'')+'>↶ もどす</button><button data-action="reset">↻ はじめから</button></div></div><div class="merge-playing"><div class="play-subtitle"><span class="level-marker">NUMBER MERGE</span><h2>足して、重ねて、大きく！</h2><p>同じ数字を合わせて2048を目指そう。</p></div><div class="merge-board" role="grid" aria-label="2048盤面">'+board.map((v,i)=>'<div class="merge-cell '+(v?'filled':'')+'" role="gridcell" aria-label="'+(v||'空')+'" style="'+(v?'--tile:'+ (COLORS[v]||'#ffe98c'):'')+'"><span>'+ (v||'')+'</span></div>').join('')+'</div><div class="merge-controls" aria-label="操作ボタン"><div><button data-dir="up" aria-label="上へ">↑</button></div><div><button data-dir="left" aria-label="左へ">←</button><button data-dir="down" aria-label="下へ">↓</button><button data-dir="right" aria-label="右へ">→</button></div></div><div class="sort-hint" role="status"><span class="hint-star">✦</span>'+note+'</div></div>'+(done?'<div class="win-layer"><div class="win-dialog"><div class="win-icon">'+(win?'★':'↻')+'</div><div class="win-kicker">'+(win?'AMAZING! 2048!':'NO MORE MOVES')+'</div><h2>'+(win?'2048達成！':'ゲームオーバー')+'</h2><p>今回のスコア：'+score+'</p><div class="win-actions"><button class="btn-dark" data-action="reset">もう一度</button>'+(win?'<button class="btn-hot" data-action="continue">続ける →</button>':'')+'</div></div></div>':'')+'</div><div class="game-instructions"><strong>あそびかた</strong><p>同じ数字がぶつかると合体して倍になります。空きマスがなくなる前に大きな数字を作ろう。スワイプ・矢印キー・画面のボタンで操作できます。スコアは端末に保存されます。</p></div>';
 }
 root.addEventListener('click',e=>{const el=e.target.closest('[data-action],[data-dir]');if(!el)return;if(el.dataset.dir)move(el.dataset.dir);else if(el.dataset.action==='undo')restore();else if(el.dataset.action==='reset')reset();else if(el.dataset.action==='continue'){continued=true;done=false;note='まだまだ数字を大きくできます！';render()}});
 let pointer=null;root.addEventListener('pointerdown',e=>{if(e.target.closest('.merge-board'))pointer={x:e.clientX,y:e.clientY};});
 root.addEventListener('pointerup',e=>{if(!pointer)return;const dx=e.clientX-pointer.x,dy=e.clientY-pointer.y;pointer=null;if(Math.max(Math.abs(dx),Math.abs(dy))>23)move(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');});
 root.tabIndex=0;root.addEventListener('keydown',e=>{const d={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right'}[e.key];if(d){e.preventDefault();move(d)}});
 const saved=readState();if(saved){board=saved.board;score=saved.score;done=!canMove(board);render()}else reset();
}
