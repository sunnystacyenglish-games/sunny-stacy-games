import assert from 'node:assert/strict';
import {WordSession} from '../games/wordly/session.js';
const pool=['cat','dog','fish','lion'].map((word,id)=>({id:String(id),word}));
const random=new WordSession(pool,'random',()=>0);for(let i=0;i<8;i++){assert.equal(random.next(),pool[0]);random.finish(true);assert(!random.done);}
let seed=32;const rng=()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32);
for(let run=0;run<100;run++){
 const session=new WordSession(pool,'mastery',rng),first=[];
 for(let i=0;i<4;i++){const word=session.next();assert.equal(session.next(),word);first.push(word.id);session.finish(['cat','fish'].includes(word.word));assert.equal(session.finish(true),false);}
 assert.equal(new Set(first).size,4);assert.equal(session.mastered.size,2);
 const second=[];for(let i=0;i<2;i++){const word=session.next();second.push(word.word);session.finish(word.word==='dog');}
 assert.deepEqual(second.sort(),['dog','lion']);assert.equal(session.pass,2);
 for(let i=0;i<3;i++){assert.equal(session.next().word,'lion');session.finish(false);assert(!session.done);}
 assert.equal(session.next().word,'lion');session.finish(true);assert(session.done);assert.equal(session.next(),null);assert.equal(session.mastered.size,4);
 session.reset();assert(!session.done);assert.equal(session.mastered.size,0);assert.equal(session.pending.length,4);assert(session.next());
}
console.log('PASS unrestricted Random repeats; 100 mastery sessions: initial coverage, failed-only subsequent passes, permanent success removal, completion count, restart');
