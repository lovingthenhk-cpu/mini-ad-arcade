const PALETTES=['#ff6a7b','#7d9af5','#ffd477','#ba99f6','#69dfc9','#e6a67a','#8fd17a','#f5a2c3'];
export const LEVELS=[
{label:'まずは道をあけよう',cars:[
 ['X',0,2,2,1],['A',3,1,1,3],['B',4,0,2,1],['C',0,0,1,2],['D',0,4,2,1]]},
{label:'詰まっている駐車場',cars:[
 ['X',0,2,2,1],['A',2,1,1,3],['B',1,4,2,1],['C',4,3,1,2],['D',0,0,2,1],['E',5,0,1,2]]},
{label:'二重のバリケード',cars:[
 ['X',1,2,2,1],['A',3,1,1,3],['B',4,1,1,3],['C',2,4,2,1],['D',0,0,3,1],['E',5,0,1,2]]},
{label:'前も後ろも渋滞',cars:[
 ['X',0,2,2,1],['A',2,1,1,3],['B',1,4,2,1],['C',4,3,1,2],['D',0,0,2,1],['E',5,0,1,2],['F',0,5,2,1]]},
{label:'最後の大渋滞',cars:[
 ['X',1,2,2,1],['A',3,1,1,3],['B',4,1,1,3],['C',2,4,2,1],['D',0,0,3,1],['E',5,0,1,2],['F',0,5,2,1],['G',5,3,1,3]]}
];
export function carsAt(level){return level.cars.map((a,i)=>({id:a[0],x:a[1],y:a[2],w:a[3],h:a[4],color:PALETTES[i%PALETTES.length]}));}
export function validMove(cars,id,delta){
 const car=cars.find(c=>c.id===id);if(!car||!delta)return false;
 const dx=car.w>car.h?Math.sign(delta):0,dy=car.h>car.w?Math.sign(delta):0;
 const x=car.x+dx,y=car.y+dy;if(x<0||y<0||x+car.w>6||y+car.h>6)return false;
 return !cars.some(other=>other.id!==id&&x<other.x+other.w&&x+car.w>other.x&&y<other.y+other.h&&y+car.h>other.y);
}
function best(i){try{return JSON.parse(localStorage.getItem('ml-parking-best')||'{}')[i]??null}catch{return null}}
function setBest(i,n){try{const b=JSON.parse(localStorage.getItem('ml-parking-best')||'{}');if(b[i]==null||n<b[i]){b[i]=n;localStorage.setItem('ml-parking-best',JSON.stringify(b))}}catch{}}
export default function mount(root){
 let level=0,cars=[],selected='X',moves=0,win=false,note='';
 function start(n){level=n;cars=carsAt(LEVELS[n]);selected='X';moves=0;win=false;note='車をタップし、矢印かスワイプで動かそう。';render();}
 function move(id,delta){if(win||!id||!delta)return;const car=cars.find(c=>c.id===id);if(!car)return;let moved=0;for(let n=0;n<Math.abs(delta);n++){if(!validMove(cars,id,delta))break;if(car.w>car.h)car.x+=Math.sign(delta);else car.y+=Math.sign(delta);moved++;}
 if(!moved){note='ほかの車か壁にぶつかっています。';render();return;}
 moves++;if(car.id==='X'&&car.x+car.w===6){win=true;setBest(level,moves);note='脱出成功！';}else note=moved+'マス動かしました。';render();
 }
 function render(){
 const car=cars.find(c=>c.id===selected),isHorizontal=car?.w>car?.h;
 root.innerHTML='<div class="play-surface"><div class="play-toolbar"><div class="play-stats"><span class="stat"><small>LEVEL</small><strong>'+String(level+1).padStart(2,'0')+' <i>/ 0'+LEVELS.length+'</i></strong></span><span class="stat"><small>移動回数</small><strong>'+moves+'</strong></span><span class="stat"><small>BEST</small><strong>'+(best(level)??'—')+'</strong></span></div><div class="toolbar-buttons"><button data-action="restart">↻ やり直す</button></div></div><div class="parking-game"><div class="play-subtitle" style="padding-top:0"><span class="level-marker">TRAFFIC PUZZLE</span><h2>'+LEVELS[level].label+'</h2><p>赤い車を右の出口まで移動しよう。</p></div><div class="parking-grid" role="group" aria-label="6×6の駐車場"><div class="parking-exit" aria-hidden="true"></div>'+cars.map(c=>'<button class="parking-vehicle '+(selected===c.id?'selected':'')+'" data-car="'+c.id+'" aria-label="'+(c.id==='X'?'脱出する赤い車':c.id+'の車')+'" style="left:'+c.x/6*100+'%;top:'+c.y/6*100+'%;width:calc('+c.w/6*100+'% - 4px);height:calc('+c.h/6*100+'% - 4px);background:'+c.color+'"><span>'+(c.id==='X'?'➜':c.w>c.h?'↔':'↕')+'</span></button>').join('')+'</div><div class="parking-controls"><button data-move="-1" '+(!isHorizontal||!validMove(cars,selected,-1)?'disabled':'')+' aria-label="左へ">←</button><button data-move="-1" '+(isHorizontal||!validMove(cars,selected,-1)?'disabled':'')+' aria-label="上へ">↑</button><span class="parking-selection">選択中：'+(selected==='X'?'赤い車':selected+'の車')+'</span><button data-move="1" '+(isHorizontal||!validMove(cars,selected,1)?'disabled':'')+' aria-label="下へ">↓</button><button data-move="1" '+(!isHorizontal||!validMove(cars,selected,1)?'disabled':'')+' aria-label="右へ">→</button></div><div class="sort-hint" role="status"><span class="hint-star">✦</span>'+note+'</div><div class="level-dots">'+LEVELS.map((_,i)=>'<button data-level="'+i+'" class="'+(i===level?'active':'')+'">'+(i+1)+'</button>').join('')+'</div></div>'+(win?'<div class="win-layer"><div class="win-dialog"><div class="win-icon">★</div><div class="win-kicker">ESCAPED!</div><h2>脱出成功！</h2><p>'+moves+'回の移動で渋滞を突破しました。</p><div class="win-actions"><button class="btn-dark" data-action="restart">もう一度</button><button class="btn-hot" data-action="next">'+(level===LEVELS.length-1?'最初から遊ぶ':'次のレベルへ →')+'</button></div></div></div>':'')+'</div><div class="game-instructions"><strong>あそびかた</strong><p>動かしたい車を選んで矢印ボタンを押すか、車をドラッグ。車は長い向きにしか動けません。赤い車を右の出口まで移動させればクリアです。</p></div>';
 }
 root.addEventListener('click',e=>{const t=e.target.closest('[data-car],[data-move],[data-action],[data-level]');if(!t)return;if(t.dataset.car){selected=t.dataset.car;render()}else if(t.dataset.move){move(selected,+t.dataset.move)}else if(t.dataset.level!==undefined){start(+t.dataset.level)}else if(t.dataset.action==='restart'){start(level)}else if(t.dataset.action==='next'){start((level+1)%LEVELS.length)}});
 let startPoint=null;root.addEventListener('pointerdown',e=>{const t=e.target.closest('[data-car]');if(t){startPoint={x:e.clientX,y:e.clientY,id:t.dataset.car}}});
 root.addEventListener('pointerup',e=>{if(!startPoint)return;const car=cars.find(c=>c.id===startPoint.id);if(!car){startPoint=null;return;}const distance=car.w>car.h?e.clientX-startPoint.x:e.clientY-startPoint.y;const d=Math.round(distance/55);const id=startPoint.id;startPoint=null;if(Math.abs(distance)>=24&&d!==0){selected=id;move(id,d)}});
 root.tabIndex=0;root.addEventListener('keydown',e=>{let d=0;if(e.key==='ArrowLeft'||e.key==='ArrowUp')d=-1;if(e.key==='ArrowRight'||e.key==='ArrowDown')d=1;if(d){e.preventDefault();move(selected,d)}});
 start(0);
}
