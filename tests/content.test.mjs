import assert from 'node:assert/strict';
import {validateSet,setRepository} from '../shared/sets.js';
import {parseImport} from '../shared/transfer.js';

const item={id:'cat',word:'cat',image:{type:'emoji',value:'🐱'}};
for(const count of [1,5,10,13,20,50])assert.equal(validateSet({id:'set',name:'Test',items:Array.from({length:count},(_,i)=>({...item,id:`c-${i}`}))}).items.length,count);
for(const bad of [{...item,word:''},{...item,image:null},{...item,image:{type:'url',value:'javascript:alert(1)'}},{...item,image:{type:'upload',blob:'fake'}}])assert.throws(()=>validateSet({id:'set',name:'Test',items:[bad]}));
assert.throws(()=>validateSet({id:'set',name:'Test',items:[item,item]}));
assert.throws(()=>parseImport('{oops'));assert.throws(()=>parseImport('{"schema":"other"}'));
const json=JSON.stringify({schema:'sunny-stacy-content-set',version:1,set:{name:'Portable',items:[item]}});assert.equal(parseImport(json).items[0].word,'cat');
assert.throws(()=>validateSet({id:'set',name:'Test',imageSource:'invalid',items:[item]}));
console.log('PASS: arbitrary set sizes, invalid data/URLs, duplicate IDs, JSON schema.');
if(!globalThis.indexedDB){const fallback=await setRepository.list();assert.equal(fallback[0].id,'animals-1');assert(setRepository.warnings.length);await assert.rejects(()=>setRepository.create({name:'Unavailable',items:Array.from({length:5},(_,i)=>({...item,id:'i'+i}))}));console.log('PASS: unavailable storage keeps built-in sets playable and rejects unsaved writes.');}
