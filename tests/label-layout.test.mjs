import assert from 'node:assert/strict';
import {placeAnswer,overlap} from '../games/label-it/answer-placement.js';
import {LabelTask,acceptedLabels} from '../shared/tasks/label-it.js';
const source={background:{type:'asset',assetId:'test'},targets:[{id:'a',x:.1,y:.1,width:.2,height:.2,acceptedAnswers:['Cat','Kitten']}]};
for(const sensitive of [false,true]){const task=new LabelTask(source,{caseSensitive:sensitive});task.select('a');task.write('  cat  ');assert.equal(task.check(),!sensitive);if(sensitive){task.write(' Cat ');assert(task.check());}}
assert.deepEqual(acceptedLabels('Cat\ncat\n Cat ',{preserveCase:true}),['Cat','cat']);
for(const width of [300,390,1000])for(const target of [{x:10,y:10,width:20,height:20},{x:width/2,y:220,width:40,height:80},{x:10,y:10,width:width-20,height:380}]){const bounds={x:0,y:0,width,height:600},size={width:Math.min(300,width),height:180};const placed=placeAnswer({bounds,target,size});if(placed){assert(!overlap(placed,target));assert(placed.x>=0&&placed.y>=0&&placed.x+placed.width<=width&&placed.y+placed.height<=600);}}
assert.equal(placeAnswer({bounds:{x:0,y:0,width:300,height:300},target:{x:0,y:0,width:300,height:300},size:{width:280,height:180}}),null);
console.log('PASS Label case sensitivity, authored variants and bounded non-overlapping callout placement');
