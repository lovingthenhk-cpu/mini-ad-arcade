export const LEVELS=[
 {title:'水で溶岩を消そう',lanes:[[],['water','lava','gold'],[]]},
 {title:'順番が大事',lanes:[['gold','lava','water'],[],[null,'gold']]},
 {title:'2つのお宝を守れ',lanes:[['water','lava','gold'],[],['gold','lava','water']]},
 {title:'3つの仕掛け',lanes:[['lava','water','gold'],['water','lava','gold'],['gold',null,null]]},
 {title:'最難関！ピンマスター',lanes:[['water','lava','gold'],['gold','lava','water'],['lava','water','gold']]}
];
const NAME={water:'水',lava:'溶岩',gold:'宝物'};
export function createState(i){const cells=Array.from({length:3},(_,x)=>Array.from({length:4},(_,y)=>LEVELS[i].lanes[x][y]||null));return {cells,pins:Array.from({length:3},()=>[true,true,true,true]),collected:0,failed:false,removed:0,goal:cells.flat().filter(c=>c==='gold').length};}
export function isWon(s){return !s.failed && s.collected===s.goal && !s.cells.flat().includes('lava');}
export function pullPin(state,x,y){
 if(!state.pins[x][y]||state.failed)return state;
 const s={...state,cells:state.cells.map(a=>[...a]),pins:state.pins.map(a=>[...a]),removed:state.removed+1};
 s.pins[x][y]=false;
 for(let tries=0;tries<64;tries++){
  let changed=false;
  for(let lane=0;lane<3;lane++)for(let row=3;row>=0;row--){
   const a=s.cells[lane][row];if(!a||s.pins[lane][row])continue;
   if(row===3){s.cells[lane][row]=null;changed=true;if(a==='gold')s.collected++;if(a==='lava')s.failed=true;continue;}
   const b=s.cells[lane][row+1];if(!b){s.cells[lane][row+1]=a;s.cells[lane][row]=null;changed=true;continue;}
   if((a==='water'&&b==='lava')||(a==='lava'&&b==='water')){s.cells[lane][row]=null;s.cells[lane][row+1]=null;changed=true;continue;}
   if((a==='gold'&&b==='lava')||(a==='lava'&&b==='gold')){s.failed=true;return s;}
  }
  if(!changed||s.failed)break;
 }
 return s;
}
function readBest(i){try{return JSON.parse(localStorage.getItem('ml-pin-best')||'{}')[i]??null}catch{return null}}
function saveBest(i,n){try{const x=JSON.parse(localStorage.getItem('ml-pin-best')||'{}');if(x[i]==null||n<x[i]){x[i]=n;localStorage.setItem('ml-pin-best',JSON.stringify(x))}}catch{}}
export default function mount(root){
 let level=0,state=createState(0),history=[],note='';
 function start(i){level=i;state=createState(i);history=[];note='ピンを抜く順番を考えて、お宝を守ろう！';render();}
 function click(x,y){if(state.failed||isWon(state)||!state.pins[x][y])return;history.push(state);state=pullPin(state,x,y);if(state.failed)note='溶岩がお宝に触れたか、出口に落ちました！';else if(isWon(state)){note='お宝を回収して溶岩も消せました！';saveBest(level,state.removed)}else note='ピンを抜きました。水で溶岩を消してからお宝を落とそう。';render();}
 function undo(){if(!history.length)return;state=history.pop();note='一手戻しました。';render();}
 function render(){
 const over=state.failed||isWon(state),won=isWon(state);
 root.innerHTML='<div class="play-surface"><div class="play-toolbar"><div class="play-stats"><span class="stat"><small>LEVEL</small><strong>'+String(level+1).padStart(2,'0')+' <i>/ 0'+LEVELS.length+'</i></strong></span><span class="stat"><small>宝物</small><strong>'+state.collected+' <i>/ '+state.goal+'</i></strong></span><span class="stat"><small>BEST</small><strong>'+(readBest(level)??'—')+'</strong></span></div><div class="toolbar-buttons"><button data-action="undo" '+(!history.length?'disabled':'')+'>↶ もどす</button><button data-action="restart">↻ やり直す</button></div></div><div class="pins-playing"><div class="play-subtitle"><span class="level-marker">PULL THE PIN</span><h2>'+LEVELS[level].title+'</h2><p>溶岩をすべて消して、宝物を下まで届けよう。</p></div><div class="pins-chambers">'+state.cells.map((col,x)=>'<div class="pins-lane"><span class="lane-heading">CHAMBER 0'+(x+1)+'</span><div class="pins-shaft">'+col.map((token,y)=>'<div class="pins-room"><span class="pins-token '+(token||'')+'" aria-label="'+(token?NAME[token]:'空')+'">'+(token==='gold'?'◆':token==='water'?'≈':token==='lava'?'▲':'')+'</span><button class="pin-handle '+(state.pins[x][y]?'':'pulled')+'" data-pin="'+x+'-'+y+'" aria-label="'+(x+1)+'番の筒の'+(y+1)+'番目のピンを抜く" '+(!state.pins[x][y]?'disabled':'')+'><span class="pin-metal"></span><span class="pin-ring"></span></button></div>').join('')+'</div><div class="pins-exit">↓ COLLECT ↓</div></div>').join('')+'</div><div class="pins-legend"><span><i class="lg-water">≈</i> 水</span><span><i class="lg-lava">▲</i> 溶岩</span><span><i class="lg-gold">◆</i> 宝物</span></div><div class="sort-hint" role="status"><span class="hint-star">✦</span>'+note+'</div><div class="level-dots">'+LEVELS.map((_,i)=>'<button data-level="'+i+'" class="'+(i===level?'active':'')+'">'+(i+1)+'</button>').join('')+'</div></div>'+(over?'<div class="win-layer"><div class="win-dialog"><div class="win-icon">'+(won?'★':'↻')+'</div><div class="win-kicker">'+(won?'ALL TREASURE SAVED!':'OH NO!')+'</div><h2>'+(won?'お宝ゲット！':'溶岩に注意！')+'</h2><p>'+(won?'ピン'+state.removed+'本で回収成功。':'水で溶岩を消す順番を考えよう。')+'</p><div class="win-actions"><button class="btn-dark" data-action="restart">もう一度</button>'+(won?'<button class="btn-hot" data-action="next">'+(level===LEVELS.length-1?'最初から遊ぶ':'次のレベルへ →')+'</button>':'<button class="btn-hot" data-action="undo">1手もどす ↶</button>')+'</div></div></div>':'')+'</div><div class="game-instructions"><strong>あそびかた</strong><p>横に飛び出たピンをタップで引き抜くと、仕切りの上にあるものが落下します。水と溶岩が触れると両方消えます。溶岩がお宝に触れたり、出口に落ちたりすると失敗。すべての溶岩を消し、宝物を出口から取り出せばクリア！</p></div>';
 }
 root.addEventListener('click',e=>{const el=e.target.closest('[data-pin],[data-action],[data-level]');if(!el)return;if(el.dataset.pin){const [x,y]=el.dataset.pin.split('-').map(Number);click(x,y)}else if(el.dataset.level!==undefined)start(+el.dataset.level);else if(el.dataset.action==='undo')undo();else if(el.dataset.action==='restart')start(level);else if(el.dataset.action==='next')start((level+1)%LEVELS.length)});start(0);
}
