import assert from 'node:assert/strict';
import {LEVELS as parks,carsAt,validMove} from '../games/parking.js';
import {LEVELS as gates,value} from '../games/gates.js';
import {LEVELS as screws,resolveTray} from '../games/screws.js';
import {LEVELS as pins,createState,pullPin,isWon} from '../games/pins.js';
import {LEVELS as lines,solve} from '../games/line.js';
import {moveGrid,canMove} from '../games/merge.js';
import {updatePhysics} from '../games/fruits.js';
import {LEVELS as sorts} from '../games/sort.js';

let checks=0;const test=(condition,label)=>{assert.ok(condition,label);checks++;};
const key=o=>JSON.stringify(o);
for(let index=0;index<parks.length;index++){
 const initial=carsAt(parks[index]),queue=[initial],seen=new Set([key(initial.map(c=>[c.x,c.y]))]);let found=false;
 for(let i=0;i<queue.length&&i<50000;i++){
  const cars=queue[i];if(cars[0].x+cars[0].w===6){found=true;break;}
  for(let j=0;j<cars.length;j++)for(const d of [-1,1]){if(!validMove(cars,cars[j].id,d))continue;const cc=cars.map(x=>({...x}));const car=cc[j];if(car.w>car.h)car.x+=d;else car.y+=d;const k=key(cc.map(c=>[c.x,c.y]));if(!seen.has(k)){seen.add(k);queue.push(cc);}}
 }
 test(found,'Parking level '+(index+1)+' unsolvable');
}
for(let index=0;index<gates.length;index++){let nums=new Set([gates[index].start]);for(const options of gates[index].steps)nums=new Set([...nums].flatMap(n=>options.map(g=>value(n,g))));test(Math.max(...nums)>=gates[index].goal,'Gates '+index+' unreachable');}
for(let index=0;index<screws.length;index++){const order=screws[index].order;let tray=[];for(const color of [...new Set(order)])for(const c of order.filter(c=>c===color)){tray=resolveTray(tray,c).tray;test(tray.length<5,'Screws '+index+' tray overflow');}test(tray.length===0,'Screws '+index+' leaves tray contents');}
for(let level=0;level<pins.length;level++){
 const initial=createState(level),queue=[initial],seen=new Set([key(initial)]);let done=false;
 for(let i=0;i<queue.length;i++){
  const state=queue[i];if(isWon(state)){done=true;break;}
  for(let x=0;x<3;x++)for(let y=0;y<4;y++){if(!state.pins[x][y])continue;const s=pullPin(state,x,y);if(s.failed)continue;const k=key(s);if(!seen.has(k)){seen.add(k);queue.push(s);}}
 }
 test(done,'Pins '+(level+1)+' unsolvable');
}
for(let level=0;level<lines.length;level++)test(!!solve(lines[level]),'Line maze '+(level+1)+' unsolvable');
const b=[2,2,2,2,4,0,4,0,0,0,0,0,0,0,0,0],m=moveGrid(b,'left');test(key(m.board.slice(0,8))===key([4,4,0,0,8,0,0,0]),'2048 merging adjacent equal tiles');test(m.gain===16,'2048 score');test(!canMove([2,4,2,4,4,2,4,2,2,4,2,4,4,2,4,2]),'2048 locked state detection');
let pair=[{x:60,y:60,vx:0,vy:0,r:17,level:0,dead:false},{x:90,y:60,vx:0,vy:0,r:17,level:0,dead:false}];const result=updatePhysics(pair,1);test(result.merges===1&&result.points===4&&pair.length===1&&pair[0].level===1,'Fruit collision merge logic');
for(const [i,l] of sorts.entries()){
 const t=l.tubes;test(t.flat().length%4===0,'Sort '+i+' invalid number of colors');test(t.every(x=>x.length<=4),'Sort '+i+' tube overfilled');
}
console.log('PASS '+checks+' assertions across 8 games.');
