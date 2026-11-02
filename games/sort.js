const C={pink:'#ff6f91',blue:'#64c7fc',gold:'#ffd36a',mint:'#6ee0b6',violet:'#b9a1ff',orange:'#ff9a66'};
const N={pink:'ピンク',blue:'水色',gold:'黄色',mint:'ミント',violet:'紫',orange:'オレンジ'};
const LEVELS=[
 {name:'はじめての仕分け',tubes:[['pink','blue','pink','blue'],['blue','pink','blue','pink'],[],[]]},
 {name:'3色のジグザグ',tubes:[['pink','blue','gold','pink'],['blue','gold','pink','blue'],['gold','pink','blue','gold'],[],[]]},
 {name:'カラフルな迷路',tubes:[['pink','blue','gold','mint'],['mint','pink','blue','gold'],['gold','mint','pink','blue'],['blue','gold','mint','pink'],[],[]]},
 {name:'5色を整列',tubes:[['pink','blue','gold','mint'],['violet','pink','blue','gold'],['mint','violet','pink','blue'],['gold','mint','violet','pink'],['blue','gold','mint','violet'],[],[]]},
 {name:'最後のチャレンジ',tubes:[['violet','gold','blue','mint'],['pink','violet','gold','blue'],['mint','pink','violet','gold'],['blue','mint','pink','violet'],['gold','blue','mint','pink'],[],[]]}
];
function solved(tubes){return tubes.every(t=>t.length===0||(t.length===4&&t.every(c=>c===t[0])));}
function getBest(i){try{return JSON.parse(localStorage.getItem('ml-sort-best')||'{}')[i]??null}catch{return null}}
function setBest(i,n){try{let b=JSON.parse(localStorage.getItem('ml-sort-best')||'{}');if(b[i]==null||n<b[i]){b[i]=n;localStorage.setItem('ml-sort-best',JSON.stringify(b));}}catch{}}
export default function mount(root){
 let index=0,tubes=[],selected=-1,moves=0,history=[],won=false,note='試験管をタップして移し替えよう！';
 function start(i){index=i;const saved=LEVELS[index];tubes=saved.tubes.map(t=>[...t]);selected=-1;moves=0;history=[];won=false;note='同じ色の上か、空の試験管に注げます。';render();}
 function pour(from,to){if(from===to)return false;const a=tubes[from],b=tubes[to];if(!a.length||b.length===4)return false;const color=a[a.length-1];if(b.length&&b[b.length-1]!==color)return false;
   history.push(tubes.map(t=>[...t]));let n=0;while(a.length&&a[a.length-1]===color&&b.length<4){b.push(a.pop());n++}moves++;note=n+'個の'+N[color]+'を移動しました。';if(solved(tubes)){won=true;setBest(index,moves)}return true;
 }
 function pick(n){if(won)return;if(selected===-1){if(tubes[n].length){selected=n;note='注ぐ先の試験管を選ぼう。';}}else if(selected===n){selected=-1;note='選択を解除しました。';}else{if(!pour(selected,n)){note='そこには注げません。別の試験管を選んでね。';}selected=-1;}render();}
 function render(){
  const best=getBest(index),lv=LEVELS[index];
  root.innerHTML='<div class="play-surface sort-surface"><div class="play-toolbar"><div class="play-stats"><span class="stat"><small>LEVEL</small><strong>'+String(index+1).padStart(2,'0')+' <i>/ '+String(LEVELS.length).padStart(2,'0')+'</i></strong></span><span class="stat"><small>移動回数</small><strong>'+moves+'</strong></span><span class="stat"><small>BEST</small><strong>'+(best===null?'—':best)+'</strong></span></div><div class="toolbar-buttons"><button type="button" data-action="undo" '+(!history.length||won?'disabled':'')+'>↶ もどす</button><button type="button" data-action="restart">↻ やり直す</button></div></div><div class="sort-playing"><div class="play-subtitle"><span class="level-marker">LEVEL '+String(index+1).padStart(2,'0')+'</span><h2>'+lv.name+'</h2><p>すべての試験管を1色ずつに揃えよう。</p></div><div class="tubes-wrap">'+tubes.map((t,i)=>'<button type="button" class="tube-button '+(selected===i?'is-selected':'')+'" data-tube="'+i+'" aria-label="試験管 '+(i+1)+'、'+(t.length?t.map(c=>N[c]).join('・'):'空')+'"><span class="tube-number">0'+(i+1)+'</span><span class="tube"><span class="tube-contents">'+t.map((c,j)=>'<span class="liquid liquid-'+c+'" style="--slot:'+j+';--color:'+C[c]+'"></span>').join('')+'</span></span><span class="tube-shadow"></span></button>').join('')+'</div><div class="sort-hint" role="status"><span class="hint-star">✦</span>'+note+'</div><div class="level-dots">'+LEVELS.map((_,i)=>'<button type="button" data-level="'+i+'" class="'+(i===index?'active':'')+'" aria-label="レベル'+(i+1)+'">'+(i+1)+'</button>').join('')+'</div></div>'+(won?'<div class="win-layer"><div class="win-dialog"><div class="win-icon">★</div><div class="win-kicker">LEVEL COMPLETE!</div><h2>お見事！</h2><p>'+moves+'回ですべての色が揃いました。</p><div class="win-actions"><button class="btn-dark" data-action="restart">もう一度</button><button class="btn-hot" data-action="next">'+(index===LEVELS.length-1?'最初から遊ぶ':'次のレベルへ →')+'</button></div></div></div>':'')+'</div><div class="game-instructions"><strong>あそびかた</strong><p>色の入った試験管を選んで、移したい先をタップ。同じ色の上か空の試験管にだけ注げます。すべてを1色にまとめればクリア！</p></div>';
 }
 root.addEventListener('click',e=>{const t=e.target.closest('[data-tube], [data-action], [data-level]');if(!t)return;if(t.dataset.tube!==undefined)pick(+t.dataset.tube);else if(t.dataset.level!==undefined)start(+t.dataset.level);else if(t.dataset.action==='undo'){if(history.length&&!won){tubes=history.pop();moves--;selected=-1;note='1手もどしました。';render();}}else if(t.dataset.action==='restart')start(index);else if(t.dataset.action==='next')start((index+1)%LEVELS.length);});
 start(0);
}
