import assert from 'node:assert/strict';
import {RotationPool,createRound,requiredConcepts} from '../games/dobble/engine.js';
let seed=2181;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);let total=0;
for(const size of [25,40])for(const per of [3,4,5,6,7,8,9,10])for(const count of [1,2,3,4])for(const mode of ['images','words','mixed']){
 const items=Array.from({length:size},(_,i)=>({id:String(i),word:'word '+i,image:'🐱'}));const settings={per,count,mode};
 if(requiredConcepts(settings)>size||mode==='mixed'&&count>2){assert.throws(()=>createRound(items,settings));continue;}
 const pool=new RotationPool(items,random);let previous=null;const seen=new Set();
 for(let cycle=0;cycle<4;cycle++){const targets=new Set();for(let n=0;n<size;n++){const round=createRound(items,settings,previous,random,pool);assert(!targets.has(round.answer));targets.add(round.answer);assert.notEqual(round.answer,previous?.answer);
 for(const card of round.cards){assert.equal(card.length,per);assert.equal(new Set(card.map(x=>x.concept.id)).size,per);card.forEach(x=>seen.add(x.concept.id));}
 for(let a=0;a<count;a++)for(let b=a+1;b<count;b++)assert.deepEqual(round.cards[a].filter(x=>round.cards[b].some(y=>x.concept.id===y.concept.id)).map(x=>x.concept.id),[round.answer]);
 if(mode==='mixed'){const first=round.cards[0].find(x=>x.concept.id===round.answer);const second=count===1?round.cue:round.cards[1].find(x=>x.concept.id===round.answer);assert.notEqual(first.representation,second.representation);}
 previous=round;total++;}assert.equal(targets.size,size);}
 assert.equal(seen.size,size);assert([...pool.usage.values()].every(value=>value>0));assert(Math.max(...pool.usage.values())-Math.min(...pool.usage.values())<=2);
}
for(let per=3;per<=10;per++){const size=requiredConcepts({count:2,per});const items=Array.from({length:size},(_,i)=>({id:String(i)}));assert.equal(createRound(items,{count:2,per,mode:'words'}).cards[0].length,per);assert.throws(()=>createRound(items.slice(1),{count:2,per,mode:'words'}));}
console.log('PASS: '+total+' seeded flexible rounds; target coverage, distractor fairness, strict pair intersections, Mixed, sizes 3–10 and insufficient sets.');
