import {LEVELS,carsAt,validMove} from '../games/parking.js';
for(let i=0;i<LEVELS.length;i++){
 const first=carsAt(LEVELS[i]),key=c=>c.map(t=>String.fromCharCode(65+t.x)+String.fromCharCode(65+t.y)).join(''),queue=[{cars:first,path:[]}],seen=new Set([key(first)]);let solution=null;
 for(let n=0;n<queue.length&&n<200000;n++){
  const {cars,path}=queue[n];if(cars[0].x+cars[0].w===6){solution=path;break;}
  for(let j=0;j<cars.length;j++)for(const d of [-1,1]){
   if(!validMove(cars,cars[j].id,d))continue;
   const copy=cars.map(x=>({...x}));if(copy[j].w>copy[j].h)copy[j].x+=d;else copy[j].y+=d;
   const k=key(copy);if(!seen.has(k)){seen.add(k);queue.push({cars:copy,path:[...path,[copy[j].id,d]]})}
  }
 }
 if(!solution){console.log('LEVEL',i+1,'NOT SOLVED, states',seen.size);process.exitCode=1}
 else console.log('LEVEL',i+1,'solved in',solution.length,'one-cell moves,',seen.size,'states searched:',JSON.stringify(solution));
}
