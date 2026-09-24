import assert from 'node:assert/strict';
import {createLayout,placeBodies} from '../games/dobble/layout.js';
import {sizeProfile} from '../games/dobble/sizing.js';
import {outsideCard,overlaps,createBody,stepBodies} from '../games/dobble/motion.js';
let seed=713;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);let checks=0;
for(let count=2;count<=10;count++)for(let run=0;run<120;run++){
 const types=Array.from({length:count},(_,i)=>run%3===0?'image':run%3===1?'word':i%2?'word':'image');
 const layout=createLayout(count,random,types),before=layout.map(p=>[p.scale,p.rotation]);
 const bodies=layout.map((p,i)=>{const profile=sizeProfile(count,p.scale),w=types[i]==='image'?profile.image:profile.wordWidth,h=types[i]==='image'?profile.image:profile.font*1.08;const angle=p.rotation*Math.PI/180;assert(Math.abs(p.rotation)<=(types[i]==='word'?20:40));return {...createBody(p,types[i],random),halfWidth:(Math.abs(Math.cos(angle))*w+Math.abs(Math.sin(angle))*h)/2+.25/180,halfHeight:(Math.abs(Math.sin(angle))*w+Math.abs(Math.cos(angle))*h)/2+.25/180};});
 placeBodies(bodies,random);const xs=bodies.map(b=>b.x),ys=bodies.map(b=>b.y);if(count>=5){assert(Math.max(...xs)-Math.min(...xs)>.35);assert(Math.max(...ys)-Math.min(...ys)>.35);}
 for(let f=0;f<20;f++){for(const [i,b] of bodies.entries()){assert(!outsideCard(b));assert(!bodies.slice(i+1).some(other=>overlaps(b,other)));}stepBodies(bodies,1/60,.275,random);}
 assert.deepEqual(layout.map(p=>[p.scale,p.rotation]),before);checks++;
}
console.log('PASS: '+checks+' measured compositions, rotated footprints, coverage, motion and stable sizes/angles.');
