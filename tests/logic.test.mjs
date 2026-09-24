import assert from 'node:assert/strict';
import {DECK,createRound,GameSession} from '../games/dobble/engine.js';
import {exampleSets} from '../data/example-sets.js';
import {defaults,normalizeSettings} from '../shared/storage.js';
let checks=0;
for(let i=0;i<13;i++)for(let j=i+1;j<13;j++){assert.equal(DECK[i].filter(id=>DECK[j].includes(id)).length,1);checks++;}
const items=exampleSets[0].items;
let seed=12897;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
for(const mode of ['images','words','mixed'])for(const count of [1,2,3,4])for(const per of [3,4]){
  if(mode==='mixed'&&count>2)continue;
  let previous=null;
  for(let i=0;i<500;i++){
    const round=createRound(items,{...defaults,mode,count,per},previous,random);
    assert.equal(round.cards.length,count);assert.notEqual(round.answer,previous?.answer);
    for(const card of round.cards){assert.equal(card.length,per);assert.equal(new Set(card.map(x=>x.concept.id)).size,per);assert(card.some(x=>x.concept.id===round.answer));}
    for(let a=0;a<count;a++)for(let b=a+1;b<count;b++)assert.equal(round.cards[a].filter(x=>round.cards[b].some(y=>y.concept.id===x.concept.id)).length,1);
    if(mode==='mixed'){const a=round.cards[0].find(x=>x.concept.id===round.answer);const b=count===1?round.cue:round.cards[1].find(x=>x.concept.id===round.answer);assert.notEqual(a.representation,b.representation);}
    previous=round;checks++;
  }
}
let tasks=new Map(),serial=0;const settings={...defaults};
const game=new GameSession({nextRound:previous=>createRound(items,settings,previous,random),schedule:fn=>{tasks.set(++serial,fn);return serial;},cancel:id=>tasks.delete(id)});
game.start();const initial=game.round;
assert.equal(game.answer('wrong',settings),'wrong');assert.equal(game.score,0);assert.equal(game.round,initial);
assert.equal(game.answer(initial.answer,settings),'correct');for(let i=0;i<20;i++)assert.equal(game.answer(initial.answer,settings),'locked');assert.equal(game.score,1);assert.equal(tasks.size,1);
let fn=[...tasks.values()][0];tasks.clear();fn();assert.equal(game.roundNumber,2);assert.equal(game.roundLocked,false);
game.answer(game.round.answer,settings);game.start();assert.equal(tasks.size,0);assert.equal(game.roundNumber,3);
game.answer(game.round.answer,{...settings,autoNext:false});assert.equal(tasks.size,0);assert(game.roundLocked);game.resetScore();assert.equal(game.score,0);assert(game.roundLocked);
assert.deepEqual(normalizeSettings(null),defaults);assert.equal(normalizeSettings({mode:'mixed',count:4}).count,2);assert.equal(normalizeSettings({delay:-1}).delay,600);
console.log(`PASS: ${checks} deck/round checks; wrong click, double click, automatic/manual transition, auto-next off, score reset, settings validation.`);
