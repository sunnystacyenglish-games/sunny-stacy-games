import assert from 'node:assert/strict';
import {GradedRace} from '../games/board-race/graded-engine.js';
function race(mode='race'){return new GradedRace({mode,size:12,players:2,special:false},()=>0);}
function settle(g,n){assert.equal(g.beginRoll(n),true);g.settleRoll();assert.equal(g.phase,'TASK_GATE');}
function move(g){while(g.phase==='MOVING')g.step();if(g.phase==='CONTENT')g.finishContent();}
let g=race();settle(g,4);assert.equal(g.player.position,-1);const attempt=g.taskAttempt;assert.equal(g.answerTask(false,attempt),true);assert.equal(g.players[0].position,-1);assert.equal(g.current,1);assert.equal(g.answerTask(true,attempt),false);
settle(g,3);g.answerTask(true,g.taskAttempt);move(g);assert.equal(g.players[1].position,2);assert.equal(g.current,0);
for(const correct of [false,true]){g=race();g.turnPartner=1;settle(g,3);g.answerTask(correct,g.taskAttempt);move(g);assert.equal(g.phase,'TASK_GATE');assert.equal(g.current,1);assert.equal(g.players[0].position,correct?2:-1);assert.equal(g.players[1].position,-1);g.answerTask(!correct,g.taskAttempt);move(g);assert.equal(g.players[1].position,correct?-1:2);assert.equal(g.phase,'READY');}
g=race();g.players.forEach(p=>p.position=11);g.turnPartner=1;settle(g,1);g.answerTask(true,g.taskAttempt);move(g);assert.equal(g.phase,'TASK_GATE');g.answerTask(true,g.taskAttempt);move(g);assert.deepEqual(g.winners,[0,1]);assert.equal(g.phase,'COMPLETE');
g=race('endless');g.player.reverse=true;g.player.totalSpacesMoved=5;g.player.position=5;settle(g,2);g.answerTask(true,g.taskAttempt);move(g);assert.equal(g.players[0].position,3);assert.equal(g.players[0].totalSpacesMoved,3);
g=race();g.specials[1]='forward';settle(g,2);g.answerTask(true,g.taskAttempt);while(g.phase==='MOVING')g.step();assert.equal(g.phase,'SPECIAL');g.resolveSpecial();assert.equal(g.phase,'MOVING');move(g);assert.equal(g.players[0].position,3);
console.log('PASS graded movement gate, duplicate-result guard, individual Team Up, joint Finish, Reverse and existing special movement');
