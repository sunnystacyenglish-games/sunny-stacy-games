import assert from 'node:assert/strict';
import {QuizTask,validateQuiz} from '../shared/tasks/quiz.js';
import {LabelTask,acceptedLabels} from '../shared/tasks/label-it.js';
const q={id:'q',mode:'multiple',text:'Choose',answers:['a','b','c','d'].map(id=>({id,text:id})),correctIds:['a','c']};
assert.throws(()=>validateQuiz({questions:[{...q,correctIds:['a']}]}));
assert.throws(()=>validateQuiz({questions:[{...q,correctIds:['a','b','c','d']}]}));
const t=new QuizTask(q,{random:()=>0});const order=t.answers.map(a=>a.id);t.select('a');assert.equal(t.check().correct,false);assert.deepEqual(t.feedback,{a:'correct'});assert.equal(t.check(),null);assert(t.retry());assert.deepEqual(t.answers.map(a=>a.id),order);t.select('c');assert(t.check().correct);assert.equal(t.result.status,'correct');assert.equal(t.result.attemptCount,2);assert.equal(t.reveal(),false);
const failed=new QuizTask(q);for(let i=0;i<3;i++){failed.select('b');failed.check();if(i<2){failed.retry();failed.select('b');}}assert.equal(failed.result.status,'incorrect');assert.equal(failed.result.attemptCount,3);
const multiplayer=new QuizTask(q,{players:2});multiplayer.select('b');multiplayer.check();assert.equal(multiplayer.result.status,'incorrect');assert.equal(multiplayer.retry(),false);
const revealed=new QuizTask(q);revealed.select('b');revealed.check();revealed.reveal();assert.deepEqual(revealed.feedback,{a:'correct',c:'correct'});assert.equal(revealed.result.status,'revealed');assert.equal(revealed.check(),null);
assert.deepEqual(acceptedLabels('sofa\n SOFA \nand/or\nA, B\nback\\slash'),['sofa','and/or','A, B','back\\slash']);
const labels=new LabelTask({background:{type:'asset',assetId:'image'},targets:[{id:'zone',x:0,y:0,width:.3,height:.4,acceptedAnswers:['the sofa','couch']}]});labels.select('zone');labels.write(' THE   SOFA ');assert(labels.check());assert(labels.complete);assert.equal(labels.write('wrong'),false);
const r=new LabelTask(labels.source);r.select('zone');r.reveal();assert.equal(r.complete,false);assert.equal(r.check(),false);assert.equal(r.write('couch'),false);
console.log('PASS Quiz ID validation, selection feedback, retry limits, reveal guards; Label It normalization, locking and completion');

const {QuizBag}=await import('../shared/tasks/model.js');
const items=['one','two','three'].map(id=>({...q,id})),bag=new QuizBag(items,{shuffle:false});
assert.equal(bag.next().id,'one');bag.record('one',false);assert.equal(bag.next().id,'two');bag.record('two',true);assert.equal(bag.next().id,'three');bag.record('three',true);assert.equal(bag.next().id,'one');
for(const mode of ['single','trueFalse']){const question={id:mode,mode,text:'Question',answers:[{id:'yes',text:mode==='trueFalse'?'True':'Yes'},{id:'no',text:mode==='trueFalse'?'False':'No'}],correctIds:['yes']};const t=new QuizTask(question);t.select('no');t.select('yes');assert.equal(t.selected.size,1);assert(t.check().correct);if(mode==='trueFalse')assert.deepEqual(t.answers.map(a=>a.id),['yes','no']);}
console.log('PASS authored first pass, deferred failure and single/True-False selection');

assert(multiplayer.reveal());assert.equal(multiplayer.result.status,'revealed');assert.deepEqual(multiplayer.feedback,{a:'correct',c:'correct'});assert.equal(multiplayer.reveal(),false);
