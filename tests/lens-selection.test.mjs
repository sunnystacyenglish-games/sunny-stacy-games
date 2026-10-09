import assert from 'node:assert/strict';
import {SpySession} from '../games/i-spy/engine.js';
import {selectLensAnswer} from '../games/i-spy/lens-selection.js';
const source={background:{type:'asset',assetId:'bg'},assets:[],objects:[
 {id:'a',assetId:'a',x:.4,y:.4,width:.02,height:.02},
 {id:'decoy',assetId:'a',x:.5,y:.5,width:.02,height:.02}],
 hotspots:[{id:'h',x:.44,y:.4,width:.02,height:.02}],
 targets:[{id:'t',prompt:'Find both',answers:[{id:'a',type:'object',sceneObjectId:'a'},{id:'h',type:'hotspot',hotspotId:'h'}]}]};
const s=new SpySession(source),lens={x:.43,y:.41,radius:100,width:1000,height:500,magnification:2};
const before=JSON.stringify(source);
assert.equal(selectLensAnswer(s,lens).id,'a','Equidistant regions respect authored order');
assert.equal(s.found.size,0,'Inspecting does not score');
s.hit('a');assert.equal(selectLensAnswer(s,lens).id,'h','Found answer excluded');
assert.equal(selectLensAnswer(s,{...lens,x:.8}),null,'Empty region');
assert.equal(selectLensAnswer(s,{...lens,x:.51,y:.51,radius:10}),null,'Distractor cannot score');
assert.equal(selectLensAnswer(s,{...lens,x:.55,radius:100}),null,'Use source radius, not enlarged outer radius');
assert.equal(selectLensAnswer(s,{...lens,x:.45,y:.41,radius:1}).id,'h','Tiny hotspot selectable');
s.hit(null,.45,.41);assert.equal(selectLensAnswer(s,lens),null,'Transition locked');
s.advance();assert.equal(selectLensAnswer(s,lens),null,'Completion locked');
assert.equal(JSON.stringify(source),before,'Saved data unchanged');
console.log('PASS lens selection: one nearest eligible answer, ties, duplicates, distractors, magnification and locks');
