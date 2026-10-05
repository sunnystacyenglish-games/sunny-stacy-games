import assert from 'node:assert/strict';
import {SpySession,prepareScene,TARGET_TRANSITION_MS} from '../games/i-spy/engine.js';
import {normalizeGameplay} from '../games/i-spy/activity.js';
const source={background:{type:'asset',assetId:'bg'},assets:[],objects:['a','b','c','decoy'].map((id,i)=>({id,assetId:'image',x:i*.2,y:.2,width:.1,height:.2})),targets:[{id:'one',prompt:'Find three apples',objectIds:['a','b','c']},{id:'two',prompt:'Find red',objectIds:['a']}]};
const original=JSON.stringify(source),s=new SpySession(source);
assert.equal(s.hit('decoy').kind,'wrong');assert.equal(s.found.size,0);
assert.equal(s.hit('b').kind,'correct');assert.equal(s.hit('b').kind,'already-found');assert.equal(s.found.size,1);
s.hit('a');assert.equal(s.hit('c').completed,true);assert.equal(s.hit('decoy').kind,'ignored');assert.equal(s.hit('a').kind,'ignored');
assert.equal(s.advance(),true);assert.equal(s.advance(),false);assert.equal(s.found.size,0);assert.equal(s.target.id,'two');assert.equal(s.hit('a').completed,true);s.advance();assert.equal(s.sessionComplete,true);assert.equal(s.hit('a').kind,'ignored');assert.equal(s.advance(),false);
assert.equal(new SpySession(source).found.size,0);assert.equal(JSON.stringify(source),original);
const orders=new Set();for(let seed=1;seed<=100;seed++){let x=seed;const random=()=>((x=(x*1664525+1013904223)>>>0)/2**32);const shuffled=new SpySession(source,{targetOrder:'shuffle'},random);orders.add(shuffled.targetOrder.join());assert.deepEqual([...shuffled.targetOrder].sort(),['one','two']);assert.equal(shuffled.scene.objects.length,4);}
// Deterministic extreme samples demonstrate both permutations.
orders.add(new SpySession(source,{targetOrder:'shuffle'},()=>.99).targetOrder.join());assert.equal(orders.size,2);
assert.equal(JSON.stringify(source),original);
const repaired=prepareScene({...source,targets:[{id:'bad',prompt:'',objectIds:['a']},{id:'missing',prompt:'Missing',objectIds:['absent']},{id:'valid',prompt:'Valid',objectIds:['a','a','absent']},null]});assert.equal(repaired.skippedTargets,3);assert.deepEqual(repaired.targets[0].answers.map(a=>a.sceneObjectId),['a']);assert.deepEqual(repaired.objects,source.objects);
assert.throws(()=>prepareScene({...source,targets:[]}),/no playable targets/);assert.throws(()=>prepareScene({}),/background/);
assert.deepEqual(normalizeGameplay({unwanted:true}),{targetOrder:'in-order',wrongAnswerSound:true,showProgress:true});assert.equal(TARGET_TRANSITION_MS,650);
console.log('PASS I Spy: multi-answer, repeat, decoy, transition lock, many-to-many, replay, shuffle, immutability, malformed targets and settings');
