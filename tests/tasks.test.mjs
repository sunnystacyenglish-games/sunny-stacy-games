import assert from 'node:assert/strict';
import {BridgeTask,TaskBag,taskSnapshot,taskAnswerDiff} from '../shared/tasks/model.js';
const tail=' A long unchanged classroom sentence.'.repeat(100);
assert.equal(taskAnswerDiff('She go.'+tail,'She goes.'+tail).filter(x=>x.changed).map(x=>x.text).join(''),'goes');
const bridge={id:'bridge',bricks:[{id:'a',text:'I'},{id:'b',text:'go'},{id:'c',text:'to school'},{id:'d',text:'by bus'}],gaps:[{id:'verb',brickId:'b',groupId:'verbs'},{id:'travel',brickId:'d',groupId:'travel'}],groups:[{id:'verbs',distractors:[{id:'same1',text:'go'},{id:'same2',text:'go'}]},{id:'travel',distractors:[{id:'no',text:'on bus'}]}]};
const original=JSON.stringify(bridge),task=new BridgeTask(bridge);
assert.equal(task.reveal(),false);assert.equal(task.place('missing'),false);
task.select('travel');assert.equal(task.available().length,2);assert.equal(task.available(true).length,5);const foreign=task.available(true).find(o=>o.groupId!=='travel');assert.equal(task.place(foreign.id),false);const travel=task.available()[1];task.place(travel.id);assert.equal(task.available(true).some(o=>o.id===travel.id),false);
task.select('verb');assert.equal(task.available().length,3);const [answer,copy1,copy2]=task.available();assert.notEqual(copy1.id,copy2.id);task.place(copy1.id);assert.equal(task.complete,true);assert.equal(task.available().some(o=>o.id===copy1.id),false);
task.place(copy2.id);assert.equal(task.available().some(o=>o.id===copy1.id),true);assert.equal(task.place(travel.id),false);
const learner=task.fragments();assert.equal(task.reveal(),true);assert.equal(task.select('travel'),false);assert.equal(task.place(answer.id),false);assert.deepEqual(task.fragments(),learner);assert.equal(task.fragments(true).find(f=>f.gapId==='travel').text,'by bus');assert.equal(JSON.stringify(bridge),original);
const shared=structuredClone(bridge);shared.gaps[1].groupId='verbs';const multi=new BridgeTask(shared);multi.select('verb');const instance=multi.available()[0];multi.place(instance.id);multi.select('travel');assert.equal(multi.place(instance.id),false);
for(const count of [1,2,5]){const bag=new TaskBag(Array.from({length:count},(_,i)=>({id:String(i),text:'task'})),()=>.4);let last;for(let i=0;i<30;i++){const value=bag.next();if(count>1)assert.notEqual(value.id,last);last=value.id;value.text='changed';}assert.ok(bag.items.every(i=>i.text==='task'));}
const doc={id:'doc',name:'Decks',content:{type:'cardDecks',data:{decks:[{id:'d',name:'Only this deck',color:'#abcdef',cards:[{id:'card',text:'Hello'}]},{id:'other',name:'Other',color:'#123456',cards:[]}]}}};
assert.throws(()=>taskSnapshot(doc),/Choose a deck/);assert.throws(()=>taskSnapshot(doc,{deckId:'other'}),/at least one/);const snapshot=taskSnapshot(doc,{deckId:'d'});assert.equal(snapshot.items.length,1);assert.equal(snapshot.items[0].deckId,'d');snapshot.items[0].text='mutated';assert.equal(doc.content.data.decks[0].cards[0].text,'Hello');
assert.throws(()=>taskSnapshot({content:{type:'sentenceCorrection',data:{sentences:[]}}}),/Add a sentence/);
console.log('PASS task snapshots, independent deck identity, singleton/repeating bags, gap groups, duplicate options, replacement, reveal lock and author-data isolation');
