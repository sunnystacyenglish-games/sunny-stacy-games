import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Chomp,MasteryBag,ordinal} from '../games/chomp/engine.js';
import {CHARACTERS} from '../games/chomp/characters.js';
import {toothTargets} from '../games/chomp/creature.js';
let seed=25;const random=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
for(const character of CHARACTERS){
 const ids=character.layers.filter(g=>g.tooth).map(g=>g.id);assert.equal(ids.length,10);assert.equal(toothTargets(character).length,10);
 for(const g of character.layers)assert(fs.existsSync(new URL(`../games/chomp/assets/layer-${CHARACTERS.indexOf(character)}-${g.id}.webp`,import.meta.url)));assert(fs.existsSync(new URL('../games/chomp/assets/'+character.closed,import.meta.url)));
 for(let players=1;players<=4;players++)for(let round=0;round<100;round++){
  const game=new Chomp({teeth:ids,players,random}),danger=game.danger;assert.equal(game.press(ids[0]),null);let owner=game.player;
  assert(game.resolve(false,game.attempt));assert(!game.resolve(true,game.attempt));assert.equal(game.press(ids[0]),null);game.resolved();assert.equal(game.player,(owner+1)%players);
  const order=ids.filter(id=>id!==danger).concat(danger);
  for(const id of order){const attempt=game.attempt;assert(game.resolve(true,attempt));game.resolved();assert(!game.resolve(false,attempt));const press=game.press(id);assert(press);assert.equal(game.press(id),null);assert.equal(game.press(ids.find(x=>x!==id)),null);assert.equal(game.danger,danger);game.pressedDone();if(press.danger){game.complete();assert.equal(game.state,'ROUND_COMPLETE');}else{assert.equal(game.state,'TASK_ACTIVE');assert.equal(game.press(id),null);}}
  assert.equal(game.used.size,10);assert.equal(game.resolve(true,game.attempt),false);assert.equal(game.press(danger),null);
 }
}
assert.deepEqual([1,2,3,4,11,12,13,21,22,23,111].map(ordinal),['1st','2nd','3rd','4th','11th','12th','13th','21st','22nd','23rd','111th']);
for(const count of [1,2,6,30]){const source=Array.from({length:count},(_,i)=>({key:'id'+i,group:'d',text:'Same text'})),bag=new MasteryBag(source,random),seen=new Set();let last;for(let i=0;i<count;i++){const t=bag.next();assert(!seen.has(t.key));seen.add(t.key);bag.record(t.key,i%2===0);last=t.key;}for(let i=0;i<100;i++){const t=bag.next();if(count>1)assert.notEqual(t.key,last);last=t.key;bag.record(t.key,i%3!==0);}assert.equal(source[0].text,'Same text');}
const fair=new MasteryBag(Array.from({length:30},(_,i)=>({key:'a'+i,group:'a'})).concat(Array.from({length:30},(_,i)=>({key:'b'+i,group:'b'}))),random);let counts={a:0,b:0};for(let i=0;i<60;i++){const t=fair.next();counts[t.group]++;assert(Math.abs(counts.a-counts.b)<=1);fair.record(t.key,true);}
const failed=new MasteryBag([{key:'a'},{key:'b'},{key:'c'}],random);const first=failed.next();failed.record(first.key,false);const second=failed.next();assert.notEqual(first.key,second.key);failed.record(second.key,true);const third=failed.next();assert.notEqual(third.key,first.key);failed.record(third.key,true);const retry=failed.next();assert.equal(retry.key,first.key);failed.record(retry.key,true);
console.log('PASS CHOMP: eight character assets, 3200 finite rounds, 1–4 players, fixed danger, invalid/double inputs, failure turns, ordinal results, mastery coverage/retries/singletons and deck fairness');
