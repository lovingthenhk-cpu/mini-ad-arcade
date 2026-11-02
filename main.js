import mountSort from './games/sort.js';
import mountParking from './games/parking.js';
import mountGates from './games/gates.js';
import mountMerge from './games/merge.js';
import mountScrews from './games/screws.js';

const games=[
  {id:'sort',number:'01',title:'ウォーターソート',eng:'COLOR SORT',genre:'パズル',description:'色が揃うと、気持ちいい。試験管の色をきれいに分けよう。',difficulty:'かんたん〜',tint:'rose',symbol:'◉',mount:mountSort},
  {id:'parking',number:'02',title:'パーキングジャム',eng:'PARKING JAM',genre:'ロジック',description:'その車、邪魔です！渋滞を動かして赤い車を脱出させよう。',difficulty:'ひらめき',tint:'sky',symbol:'➜',mount:mountParking},
  {id:'gates',number:'03',title:'ゲートラッシュ',eng:'GATE RUSH',genre:'計算・選択',description:'×3か、+20か。正しいゲートを選んで仲間を増やそう！',difficulty:'判断力',tint:'lime',symbol:'×3',mount:mountGates},
  {id:'merge',number:'04',title:'数字マージ 2048',eng:'NUMBER MERGE',genre:'数字パズル',description:'2、4、8、16……同じ数字を重ねて2048を作ろう。',difficulty:'中毒性',tint:'violet',symbol:'2048',mount:mountMerge},
  {id:'screws',number:'05',title:'ねじ外しパズル',eng:'SCREW MASTER',genre:'色合わせ',description:'3本同じ色を揃えてネジを片付けよう。トレイは5本まで。',difficulty:'順番がカギ',tint:'rose',symbol:'✳',mount:mountScrews}
];
const home=document.querySelector('#home'),view=document.querySelector('#game-view'),grid=document.querySelector('#games-grid');
const escapeHtml=(s)=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function artFor(g){
  if(g.id==='sort')return '<div class="art-sort"><div class="art-tube"><i class="block coral"></i><i class="block cyan"></i><i class="block coral"></i></div><div class="art-tube"><i class="block cyan"></i><i class="block amber"></i><i class="block cyan"></i></div><div class="art-tube"><i class="block amber"></i><i class="block coral"></i><i class="block amber"></i></div><div class="art-tube"></div></div>';
  if(g.id==='parking')return '<div class="art-parking"><div class="park-road"></div><div class="park-car pc-red">→</div><div class="park-car pc-blue"></div><div class="park-car pc-yellow"></div><div class="park-car pc-purple"></div></div>';
  if(g.id==='gates')return '<div class="art-gates"><div class="gate-card g-green">×3</div><div class="gate-card g-red">−5</div><div class="gate-crowd">● ● ● ● ●<br> ● ● ● ●</div></div>';
  if(g.id==='merge')return '<div class="art-merge"><span>2</span><span>4</span><span>8</span><span>4</span><span>16</span><span>2</span></div>';
  if(g.id==='screws')return '<div class="art-screws">'+[0,1,2,0,1,2,2,0].map(x=>'<i style="--screw-color:'+['#ff789a','#67cfff','#ffd36d'][x]+'"></i>').join('')+'</div>';
  if(g.id==='pins')return '<div class="art-pins"><span class="pin-dot one"></span><span class="pin-dot two"></span><span class="pin-dot three"></span><span class="pin-bar"></span><span class="pin-bucket">◡</span></div>';
  return '';
}
function showGallery(){
 grid.innerHTML=games.map(g=>'<a class="game-card game-'+g.tint+'" href="#/'+escapeHtml(g.id)+'"><div class="game-card-visual"><div class="card-topline"><span>GAME '+g.number+'</span><span class="card-asterisk">✳</span></div>'+artFor(g)+'<div class="art-corner">↗</div></div><div class="game-card-info"><div class="game-meta"><span>'+escapeHtml(g.genre)+'</span><span>● '+escapeHtml(g.difficulty)+'</span></div><h3>'+escapeHtml(g.title)+'</h3><p>'+escapeHtml(g.description)+'</p><span class="play-link">PLAY NOW <span>→</span></span></div></a>').join('');
 document.querySelector('#games-count').textContent=String(games.length).padStart(2,'0')+' GAMES AVAILABLE';
}
function route(){
  const key=decodeURIComponent(location.hash.replace(/^#\/?/,''));const game=games.find(g=>g.id===key);
  if(!game){home.hidden=false;view.hidden=true;document.title='MINI//LOOP — 広告みたいなミニゲームが、ちゃんと遊べる。';if(key==='games')document.querySelector('#games').scrollIntoView({behavior:'smooth'});return;}
  home.hidden=true;view.hidden=false;view.innerHTML='<div class="game-page-head"><a class="back-link" href="#/">← ゲーム一覧にもどる</a><span class="game-page-label">MINI//LOOP · GAME '+game.number+'</span></div><div class="game-title-row"><div><span class="game-category">'+escapeHtml(game.genre)+' / '+escapeHtml(game.eng)+'</span><h1>'+escapeHtml(game.title)+'</h1><p>'+escapeHtml(game.description)+'</p></div><span class="game-title-stamp">LET’S PLAY! ✳</span></div><div id="game-mount"></div>';
  game.mount(document.querySelector('#game-mount'));document.title=game.title+' | MINI//LOOP';window.scrollTo({top:0,behavior:'instant'});
}
showGallery();window.addEventListener('hashchange',route);route();
