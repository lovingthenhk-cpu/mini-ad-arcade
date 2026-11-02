export const LEVELS=[
 {name:'最初の一筆',walls:[[1,1],[2,2],[3,1],[4,2],[4,4]],stars:[[2,0],[3,3]]},
 {name:'回り道の星',walls:[[1,0],[1,1],[1,3],[2,3],[3,1],[3,4],[4,1]],stars:[[0,3],[3,2],[4,4]]},
 {name:'曲がりくねった道',walls:[[1,1],[1,2],[2,0],[2,2],[3,4],[4,0],[4,3]],stars:[[0,4],[3,3],[5,2]]},
 {name:'星を全部つなげよう',walls:[[0,2],[1,2],[1,4],[2,1],[2,4],[3,1],[3,3],[4,3],[5,1]],stars:[[1,0],[3,2],[4,5]]},
 {name:'最終ステージ',walls:[[0,2],[1,2],[1,4],[2,4],[3,1],[3,4],[4,1],[4,3],[5,3]],stars:[[1,0],[2,3],[4,5],[5,1]]}
];
export function solve(level){
 const walls=new Set(level.walls.map(p=>p.join(','))),stars=level.stars.map(p=>p.join(',')),full=(1<<stars.length)-1;
 const stack=[{x:0,y:0,mask:0,path:[[0,0]],seen:new Set(['0,0'])}];
 while(stack.length){
  const s=stack.pop();if(s.x===5&&s.y===5&&s.mask===full)return s.path;
  for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){const x=s.x+dx,y=s.y+dy,k=x+','+y;if(x<0||x>5||y<0||y>5||walls.has(k)||s.seen.has(k))continue;
   let mask=s.mask;let n=stars.indexOf(k);if(n>=0)mask|=1<<n;
   stack.push({x,y,mask,path:[...s.path,[x,y]],seen:new Set([...s.seen,k])});
  }
 }
 return null;
}
function getBest(i){try{return JSON.parse(localStorage.getItem('ml-line-best')||'{}')[i]??null}catch{return null}}
function setBest(i,n){try{const b=JSON.parse(localStorage.getItem('ml-line-best')||'{}');if(b[i]==null||n<b[i]){b[i]=n;localStorage.setItem('ml-line-best',JSON.stringify(b))}}catch{}}
export default function mount(root){
 let level=0,path=[[0,0]],won=false,note='',isDragging=false;
 const current=()=>path[path.length-1],same=(a,b)=>a[0]===b[0]&&a[1]===b[1],contains=(points,point)=>points.some(p=>same(p,point));
 function start(i){level=i;path=[[0,0]];won=false;note='STARTから道をつなぎ、全部の星を集めてGOALへ！';render();}
 function go(x,y){if(won)return;let p=[x,y],last=current(),l=LEVELS[level];if(same(p,last))return;
 if(path.length>=2&&same(path[path.length-2],p)){path.pop();note='1マスもどりました。';render();return;}
 if(Math.abs(x-last[0])+Math.abs(y-last[1])!==1)return;
 if(contains(l.walls,p)||contains(path,p)){note='そこへは線を引けません。';render();return;}
 path.push(p);const have=l.stars.filter(s=>contains(path,s)).length;const all=have===l.stars.length;if(x===5&&y===5){if(all){won=true;setBest(level,path.length-1);note='全部の星を集めた！'}else{note='星が残っています。ひとつ戻って集めよう！';}}
 else note=have+' / '+l.stars.length+' 個の星を集めました。';render();}
 function render(){
 const l=LEVELS[level],pCount=l.stars.filter(s=>contains(path,s)).length;
 root.innerHTML='<div class="play-surface"><div class="play-toolbar"><div class="play-stats"><span class="stat"><small>LEVEL</small><strong>'+String(level+1).padStart(2,'0')+' <i>/ 0'+LEVELS.length+'</i></strong></span><span class="stat"><small>STARS</small><strong>'+pCount+' <i>/ '+l.stars.length+'</i></strong></span><span class="stat"><small>BEST</small><strong>'+(getBest(level)??'—')+'</strong></span></div><div class="toolbar-buttons"><button data-action="undo" '+(path.length<=1?'disabled':'')+'>↶ もどす</button><button data-action="restart">↻ やり直す</button></div></div><div class="line-playing"><div class="play-subtitle"><span class="level-marker">ONE LINE QUEST</span><h2>'+l.name+'</h2><p>一筆でつないで、すべての星を集めよう。</p></div><div class="line-grid" role="grid" aria-label="6×6 一筆迷路">'+Array.from({length:36},(_,i)=>{const x=i%6,y=Math.floor(i/6),p=[x,y],wall=contains(l.walls,p),star=contains(l.stars,p),visited=contains(path,p),head=same(current(),p),start=x===0&&y===0,goal=x===5&&y===5;return '<button class="line-cell '+(wall?'wall ':'')+(visited?'visited ':'')+(head?'head ':'')+(star?'star ':'')+'" data-cell="'+x+','+y+'" '+(wall?'disabled':'')+' aria-label="'+(start?'スタート':goal?'ゴール':wall?'壁':star?'星':'通路')+'">'+(start?'S':goal?'G':star?'★':'')+'</button>';}).join('')+'<svg class="line-overlay" viewBox="0 0 600 600" preserveAspectRatio="none" aria-hidden="true"><polyline points="'+path.map(([x,y])=>(x*100+50)+','+(y*100+50)).join(' ')+'" fill="none" stroke="#d0ffc0" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" opacity=".9"/></svg></div><div class="line-progress">STEPS <strong>'+String(path.length-1).padStart(2,'0')+'</strong><span class="line-progress-separator">✦</span> 星をタップして進もう</div><div class="sort-hint" role="status"><span class="hint-star">✦</span>'+note+'</div><div class="level-dots">'+LEVELS.map((_,i)=>'<button data-level="'+i+'" class="'+(i===level?'active':'')+'">'+(i+1)+'</button>').join('')+'</div></div>'+(won?'<div class="win-layer"><div class="win-dialog"><div class="win-icon">★</div><div class="win-kicker">ONE LINE COMPLETE!</div><h2>一筆成功！</h2><p>'+l.stars.length+'個の星をすべて集めました。</p><div class="win-actions"><button class="btn-dark" data-action="restart">もう一度</button><button class="btn-hot" data-action="next">'+(level===LEVELS.length-1?'最初から遊ぶ':'次のレベルへ →')+'</button></div></div></div>':'')+'</div><div class="game-instructions"><strong>あそびかた</strong><p>START（S）からGOAL（G）まで、隣のマスをタップするか指でなぞって線をつなげます。壁や自分が通ったマスは通れません。すべての★を集めてゴール！ひとつ前のマスをタップすると戻れます。</p></div>';
 }
 root.addEventListener('click',e=>{const el=e.target.closest('[data-cell],[data-action],[data-level]');if(!el)return;if(el.dataset.cell){const [x,y]=el.dataset.cell.split(',').map(Number);go(x,y)}else if(el.dataset.level!==undefined)start(+el.dataset.level);else if(el.dataset.action==='undo'){if(path.length>1){path.pop();note='一手もどしました。';render()}}else if(el.dataset.action==='restart')start(level);else if(el.dataset.action==='next')start((level+1)%LEVELS.length)});
 root.addEventListener('pointerdown',e=>{if(e.target.closest('.line-grid')){isDragging=true}});
 root.addEventListener('pointermove',e=>{if(!isDragging||!e.target.closest('.line-grid'))return;const hit=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-cell]');if(hit){const [x,y]=hit.dataset.cell.split(',').map(Number);go(x,y)}});
 root.addEventListener('pointerup',()=>{isDragging=false});root.addEventListener('pointercancel',()=>{isDragging=false});
 start(0);
}
