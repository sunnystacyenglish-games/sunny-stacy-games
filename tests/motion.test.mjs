import assert from 'node:assert/strict';
import {createBody,stepBodies,outsideCard,overlaps} from '../games/dobble/motion.js';
import {createLayout,placeBodies} from '../games/dobble/layout.js';
let seed=753;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
let frames=0,minTravel=1;
assert(!overlaps({x:.5,y:.45,halfWidth:.15,halfHeight:.02},{x:.5,y:.51,halfWidth:.15,halfHeight:.02}),'Words can approach closely without a large circular bubble');
for(const count of [1,2,3,4,5,6,7,8,9,10])for(const type of ['word','image','mixed'])for(const speed of [.07,.13,.275]){
  const bodies=createLayout(count,random).map(position=>createBody(position,type,random));
  bodies.forEach((body,i)=>{const word=type==='word'||type==='mixed'&&i%2;body.halfWidth=word?(count>4?.112:(i%2?.145:.05)):(count>4?.08:.081);body.halfHeight=word?(count>4?.037:.045):(count>4?.08:.081);});
  placeBodies(bodies,random);
  const initial=bodies.map(b=>({...b}));const travel=bodies.map(()=>0);
  for(let frame=0;frame<7200;frame++){
    stepBodies(bodies,frame===100?20:1/60,speed,random);frames++;
    bodies.forEach((b,i)=>{
      assert(!outsideCard(b));
      bodies.slice(i+1).forEach(other=>assert(!overlaps(b,other)));
      travel[i]=Math.max(travel[i],Math.hypot(b.x-initial[i].x,b.y-initial[i].y));
    });
  }
  travel.forEach(distance=>assert(distance>.25,'An item remained confined near its starting position'));
  minTravel=Math.min(minTravel,...travel);
}
console.log(`PASS: ${frames} motion frames, no collisions or escaped bounds; every item travelled at least ${minTravel.toFixed(3)} card widths from its start.`);
