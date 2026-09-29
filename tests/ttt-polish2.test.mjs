import assert from 'node:assert/strict';
import {TicTacToe} from '../games/tic-tac-toe/engine.js';
import {cannonParticles,particlePosition,VICTORY_NOTES} from '../games/tic-tac-toe/celebration.js';
const items=Array.from({length:5},(_,i)=>({id:String(i),word:'item '+i}));
for(const starter of [.1,.9]){const game=new TicTacToe(items,()=>starter,{steal:false}),first=game.current;game.choose(4);const concept=game.concept,used=game.bag.consumed;assert.equal(game.answer(false,game.attempt),'missed');assert.equal(game.bag.consumed,used);assert.equal(game.concept,concept);game.finish();assert.equal(game.pending,null);assert.equal(game.board[4],null);assert.notEqual(game.current,first);assert.equal(game.state,'SELECT_CELL');assert(game.choose(4));assert.equal(game.bag.consumed,used+1);assert.notEqual(game.concept.id,concept.id);}
const game=new TicTacToe(items,()=>.1);game.choose(0);game.answer(false,game.attempt);game.steal=false;game.answer(false,game.attempt);game.finish();assert.equal(game.current,'X');assert.equal(game.board[0],null);
for(const [w,h] of [[390,844],[844,390],[1366,768],[1920,1080]]){const particles=cannonParticles(w,h);assert.equal(particles.filter(p=>p.side==='left').length,32);assert.equal(particles.filter(p=>p.side==='right').length,32);for(const p of particles){assert(p.y>=h);assert(p.vy<0);assert.equal(p.vx>0,p.side==='left');const apex=-p.vy/p.gravity,top=particlePosition(p,apex);assert(top.y<h*.33&&top.y>0);assert(particlePosition(p,3.2).y>h);assert(particlePosition(p,.2).y<h);}}
assert(Math.max(...VICTORY_NOTES.map(n=>n.at+n.duration))>=1.3);
console.log('PASS Steal OFF loss of turn / same square / bag draw only on choose; active steal finishes; twin cannon origins, varied ballistic rise/apex/fall; 1.32s sting.');

const {loadPreferences,savePreferences,gameURL}=await import('../games/tic-tac-toe/settings.js');
let stored=null;globalThis.localStorage={getItem:()=>stored,setItem:(_,value)=>stored=value};globalThis.location={search:''};
assert.equal(loadPreferences().steal,true);savePreferences({...loadPreferences(),steal:false});assert.equal(loadPreferences().steal,false);assert.equal(new URL(gameURL(loadPreferences())).searchParams.get('steal'),'false');globalThis.location.search='?steal=true';assert.equal(loadPreferences().steal,true);
console.log('PASS Steal defaults ON, remembered OFF and explicit URL override.');
