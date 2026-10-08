import assert from 'node:assert/strict';
import {BoardRace,distributeSpecials} from '../games/board-race/engine.js';
import {validateDecks} from '../shared/editors/models.js';
for(const mode of ['race','endless'])for(let n=12;n<=40;n++)for(let seed=1;seed<=100;seed++){
 let r=seed;const random=()=>((r=Math.imul(r,1664525)+1013904223>>>0)/2**32);
 const boosts=distributeSpecials(n,mode,true,random,['reverse']);assert.equal(Object.keys(boosts).length,Math.round(n*.25));assert(Object.values(boosts).every(e=>e==='reverse'));assert.deepEqual(distributeSpecials(n,mode,false,random),{});
}
const game=new BoardRace({mode:'endless',size:40,special:false},()=>0),p=game.player;
for(let i=0;i<40;i++)game.moveOne(p,1);assert.deepEqual([p.position,p.lap,p.totalSpacesMoved],[0,2,40]);
for(let repeat=0;repeat<10;repeat++){for(let i=0;i<4;i++)game.moveOne(p,-1);assert.deepEqual([p.position,p.lap,p.totalSpacesMoved],[36,1,36]);for(let i=0;i<4;i++)game.moveOne(p,1);assert.deepEqual([p.position,p.lap,p.totalSpacesMoved],[0,2,40]);}
p.lap++;for(let i=0;i<40;i++)game.moveOne(p,-1);assert.deepEqual([p.position,p.lap,p.totalSpacesMoved],[0,2,0]);game.moveOne(p,-1);assert.deepEqual([p.position,p.lap,p.totalSpacesMoved],[0,2,0]);
const data={decks:Array.from({length:6},(_,i)=>({id:'d'+i,name:'Deck',color:'#123456',cards:[]}))};assert.throws(()=>validateDecks(data),/maximum 5/);assert.equal(validateDecks(data,{previousDeckCount:6}).decks.length,6);data.decks.push({...data.decks[0],id:'d7'});assert.throws(()=>validateDecks(data,{previousDeckCount:6}),/maximum 6/);
console.log('PASS Delta 4: 5800 density configurations, signed crossings, origin clamp, independent bonus laps, five-deck creation and legacy validation');

const {deckComposition}=await import('../games/board-race/decks.js');for(let count=1;count<=5;count++)for(const w of [160,230,400,800])for(const h of [90,140,300,600]){const c=deckComposition(count,w,h);for(let i=0;i<count;i++){const [x,y]=c.positions[i];assert(x-c.width/2>=0&&x+c.width/2+7<=w);assert(y-c.height/2>=0&&y+c.height/2+7<=h);for(let j=0;j<i;j++)assert(Math.abs(x-c.positions[j][0])>=c.width+9||Math.abs(y-c.positions[j][1])>=c.height+9);}}console.log('PASS 80 deck compositions: bounds, shadows and pile separation');
