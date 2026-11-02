const FRUITS=[
 {emoji:'🍒',name:'さくらんぼ',r:17,color:'#fa7b99',points:2},
 {emoji:'🍓',name:'いちご',r:23,color:'#fc8595',points:4},
 {emoji:'🍇',name:'ぶどう',r:30,color:'#a28bf0',points:8},
 {emoji:'🍊',name:'みかん',r:37,color:'#ffb05d',points:16},
 {emoji:'🍎',name:'りんご',r:45,color:'#fa7271',points:32},
 {emoji:'🍐',name:'なし',r:52,color:'#c8e87c',points:64},
 {emoji:'🍑',name:'もも',r:59,color:'#ffc1b2',points:128},
 {emoji:'🍍',name:'パイナップル',r:67,color:'#f1d977',points:256},
 {emoji:'🍈',name:'メロン',r:75,color:'#a2e4a0',points:512},
 {emoji:'🍉',name:'スイカ',r:85,color:'#77ce9e',points:1024}
];
const W=420,H=510,L=10,R=410,B=498,LOSE=91;
function getBest(){try{return +(localStorage.getItem('ml-fruit-best')||0)}catch{return 0}}
function setBest(score){try{if(score>getBest())localStorage.setItem('ml-fruit-best',score)}catch{}}
export function updatePhysics(bodies,steps=2){
 let merges=0,points=0;
 for(let sub=0;sub<steps;sub++){
  for(const f of bodies){f.vy=Math.min(10,f.vy+.23);f.x+=f.vx;f.y+=f.vy;f.vx*=.985;if(f.x-f.r<L){f.x=L+f.r;f.vx=Math.abs(f.vx)*.2}if(f.x+f.r>R){f.x=R-f.r;f.vx=-Math.abs(f.vx)*.2}if(f.y+f.r>B){f.y=B-f.r;f.vy=-Math.abs(f.vy)*.18;f.vx*=.85;if(Math.abs(f.vy)<.4)f.vy=0}}
  let toMerge=[];
  for(let k=0;k<3;k++)for(let i=0;i<bodies.length;i++)for(let j=i+1;j<bodies.length;j++){
   const a=bodies[i],b=bodies[j];if(a.dead||b.dead)continue;
   let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),min=a.r+b.r;if(d>=min)continue;
   if(a.level===b.level&&a.level<FRUITS.length-1){a.dead=b.dead=true;toMerge.push([a,b]);continue;}
   if(d<.0001){dx=.01;dy=.01;d=.014}
   const nx=dx/d,ny=dy/d,depth=min-d;
   const w1=b.r/(a.r+b.r),w2=a.r/(a.r+b.r);
   a.x-=nx*depth*w1*.63;a.y-=ny*depth*w1*.63;b.x+=nx*depth*w2*.63;b.y+=ny*depth*w2*.63;
   const v=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
   if(v<0){const impulse=-(1.1)*v/2;a.vx-=impulse*nx;a.vy-=impulse*ny;b.vx+=impulse*nx;b.vy+=impulse*ny;}
  }
  if(toMerge.length){for(const [a,b] of toMerge){const level=a.level+1,r=FRUITS[level].r;bodies.push({level,r,x:Math.min(R-r,Math.max(L+r,(a.x+b.x)/2)),y:(a.y+b.y)/2,vx:(a.vx+b.vx)*.35,vy:Math.min(-2,(a.vy+b.vy)*.2),dead:false});points+=FRUITS[level].points;merges++;}
   for(let i=bodies.length-1;i>=0;i--)if(bodies[i].dead)bodies.splice(i,1);
  }
 }
 return {merges,points};
}
export default function mount(root){
 let fruits=[],score=0,best=getBest(),next=0,aim=W/2,running=true,over=false,lastDrop=0,frame=0,particles=[],raf=0,message='クリックまたはタップでフルーツを落とそう！';
 const random=()=>Math.floor(Math.random()*3);
 root.innerHTML='<div class="play-surface"><div class="play-toolbar"><div class="play-stats"><span class="stat"><small>SCORE</small><strong id="fruit-score">0</strong></span><span class="stat"><small>BEST</small><strong id="fruit-best">'+best+'</strong></span><span class="stat"><small>NEXT</small><strong id="fruit-next">🍒</strong></span></div><div class="toolbar-buttons"><button data-action="restart">↻ やり直す</button></div></div><div class="fruit-playing"><div class="play-subtitle"><span class="level-marker">FRUIT DROP</span><h2>合体するフルーツ！</h2><p>同じフルーツをぶつけて、最後はスイカを作ろう。</p></div><div class="fruit-canvas-box"><canvas id="fruit-canvas" width="'+W+'" height="'+H+'" aria-label="フルーツ合体ゲームのプレイエリア"></canvas><div class="fruit-gameover" id="fruit-over" hidden><span>FRUIT DROP</span><h3>ゲームオーバー</h3><p id="fruit-over-score"></p><button data-action="restart">もう一度遊ぶ ↻</button></div></div><p class="fruit-message" id="fruit-message">'+message+'</p></div></div><div class="game-instructions"><strong>あそびかた</strong><p>落としたい位置をタップするとフルーツが降ってきます。同じ種類がくっつくと、ひとつ上の大きなフルーツに合体。たくさん合体させてスイカを作ろう！矢印キーで位置移動、スペースキーで落とすこともできます。</p></div>';
 const canvas=root.querySelector('#fruit-canvas'),ctx=canvas.getContext('2d');if(!ctx)return;const scoreNode=root.querySelector('#fruit-score'),bestNode=root.querySelector('#fruit-best'),nextNode=root.querySelector('#fruit-next'),msgNode=root.querySelector('#fruit-message'),overNode=root.querySelector('#fruit-over');
 const sync=()=>{scoreNode.textContent=score;bestNode.textContent=best;nextNode.textContent=FRUITS[next].emoji;msgNode.textContent=message};
 function reset(){fruits=[];score=0;next=random();aim=W/2;running=true;over=false;lastDrop=0;frame=0;particles=[];message='同じフルーツをぶつけて合体させよう！';overNode.hidden=true;sync();}
 function drop(){if(over||!running||performance.now()-lastDrop<330)return;const r=FRUITS[next].r;fruits.push({level:next,r,x:Math.max(L+r,Math.min(R-r,aim)),y:35,vx:0,vy:1,dead:false});next=random();lastDrop=performance.now();message='いい感じ！ 次のフルーツも落としてみよう。';sync();}
 function drawFruit(f,scale=1){ctx.save();ctx.translate(f.x,f.y);ctx.scale(scale,scale);const grad=ctx.createRadialGradient(-f.r*.3,-f.r*.45,3,0,0,f.r);grad.addColorStop(0,'#ffffff');grad.addColorStop(.16,FRUITS[f.level].color);grad.addColorStop(1,FRUITS[f.level].color);ctx.fillStyle=grad;ctx.shadowColor='#101528';ctx.shadowBlur=9;ctx.shadowOffsetY=4;ctx.beginPath();ctx.arc(0,0,f.r-2,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=3;ctx.stroke();ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=Math.floor(f.r*.98)+'px sans-serif';ctx.fillText(FRUITS[f.level].emoji,0,2);ctx.restore();}
 function paint(){
  ctx.clearRect(0,0,W,H);
  const bg=ctx.createLinearGradient(0,0,0,H);bg.addColorStop(0,'#344667');bg.addColorStop(1,'#27334c');ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(255,255,255,.04)';for(let x=40;x<W;x+=40){ctx.fillRect(x,0,1,H)}for(let y=40;y<H;y+=40){ctx.fillRect(0,y,W,1)}
  ctx.strokeStyle='rgba(255,157,157,.75)';ctx.lineWidth=3;ctx.setLineDash([10,8]);ctx.beginPath();ctx.moveTo(L,LOSE);ctx.lineTo(R,LOSE);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#9dacc4';ctx.textAlign='left';ctx.font='bold 12px sans-serif';ctx.fillText('LIMIT LINE',19,LOSE-9);
  ctx.fillStyle='#8ca2c3';ctx.fillRect(0,B,W,12);
  for(const f of fruits)drawFruit(f);
  if(!over){const r=FRUITS[next].r;ctx.save();ctx.globalAlpha=.65;ctx.strokeStyle='#d6f4ff';ctx.lineWidth=2;ctx.setLineDash([7,6]);ctx.beginPath();ctx.moveTo(aim,35+r);ctx.lineTo(aim,LOSE-5);ctx.stroke();ctx.setLineDash([]);drawFruit({level:next,r,x:aim,y:35,vx:0,vy:0},.85);ctx.restore();}
  for(const p of particles){ctx.fillStyle=p.color;ctx.globalAlpha=p.life/35;ctx.fillRect(p.x,p.y,p.size,p.size);p.x+=p.vx;p.y+=p.vy;p.vy+=.1;p.life--}ctx.globalAlpha=1;particles=particles.filter(p=>p.life>0);
 }
 function tick(){
  if(!root.isConnected)return;
  if(running&&!over){const {points,merges}=updatePhysics(fruits);if(points){score+=points;if(score>best){best=score;setBest(best)}message=merges+'回合体！ +'+points+'ポイント';for(let i=0;i<15;i++)particles.push({x:Math.random()*W,y:100+Math.random()*250,vx:(Math.random()-.5)*5,vy:-Math.random()*4,life:35,color:FRUITS[(i+Math.floor(score/10))%FRUITS.length].color,size:4+Math.random()*4});sync();}
   if(frame++%25===0&&fruits.length>0&&performance.now()-lastDrop>1800&&fruits.some(f=>f.y-f.r<LOSE&&Math.abs(f.vy)<1)){over=true;running=false;overNode.hidden=false;root.querySelector('#fruit-over-score').textContent='スコア '+score+' / ベスト '+best;}
  }paint();raf=requestAnimationFrame(tick);}
 canvas.addEventListener('pointermove',e=>{const box=canvas.getBoundingClientRect();aim=Math.max(35,Math.min(W-35,(e.clientX-box.left)/box.width*W));});
 canvas.addEventListener('pointerdown',e=>{e.preventDefault();const box=canvas.getBoundingClientRect();aim=Math.max(35,Math.min(W-35,(e.clientX-box.left)/box.width*W));drop();});
 root.addEventListener('click',e=>{if(e.target.closest('[data-action="restart"]'))reset()});
 root.tabIndex=0;root.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){aim=Math.max(35,aim-17);e.preventDefault()}else if(e.key==='ArrowRight'){aim=Math.min(W-35,aim+17);e.preventDefault()}else if(e.key===' '){drop();e.preventDefault()}});
 next=random();sync();raf=requestAnimationFrame(tick);
}
