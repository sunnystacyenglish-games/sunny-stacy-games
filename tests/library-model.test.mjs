import assert from 'node:assert/strict';
import {libraryItems,selectLibrary,sortLibrary,contentStats} from '../shared/library-model.js';
const folders=[{id:'f',name:'Zoo'}],sets=[{id:'same',name:' Zebra ',folderId:'f',items:[{}],updatedAt:20},{id:'old',name:'Old',items:[]}],activities=[{id:'same',name:'Apple',content:{type:'scene',data:{targets:[{},{}]}},metadata:{createdAt:'2026-01-01T00:00:00Z'}}];
const before=JSON.stringify({sets,activities}),items=libraryItems(sets,activities,new Map([['same','f']]));assert.notEqual(items[0].key,items[2].key);assert.equal(items[0].id,items[2].id);assert.equal(contentStats(items[2]),'2 targets');
assert.deepEqual(selectLibrary(items,{folderId:'f',folders,sort:'az'}).map(i=>i.name),[' Zebra ','Apple']);
assert.equal(selectLibrary(items,{folderId:'f',folders,search:' APP ',type:'scene'}).length,1);assert.equal(selectLibrary(items,{folderId:'f',folders,search:' APP ',type:'bridge'}).length,0);assert.equal(selectLibrary(items,{folders}).length,1);
assert.deepEqual(sortLibrary(items,'created').map(i=>i.name),['Apple',' Zebra ','Old']);assert.equal(sortLibrary(items,'edited')[0].name,' Zebra ');assert.deepEqual(sortLibrary([{id:'2',name:'B'},{id:'1',name:'A'}]).map(i=>i.id),['1','2']);assert.equal(JSON.stringify({sets,activities}),before);
assert.equal(selectLibrary([{...items[0],folderId:'missing'}],{folders}).length,1);
console.log('PASS unified keys, type/search/folder combination, sorting, missing timestamps, stale folder fallback, counts and immutable records');
