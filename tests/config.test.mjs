import assert from 'node:assert/strict';
import {resolveConfiguration,settingsFromURL,ITEM_OPTIONS,CARD_OPTIONS,MODE_OPTIONS} from '../games/dobble/config.js';
import {validateSet,validatePlayableSet,validConceptCount} from '../shared/content-rules.js';
import {setRepository} from '../shared/sets.js';
import {defaults} from '../shared/storage.js';
const make=size=>({id:'set'+size,name:'Set '+size,items:Array.from({length:size},(_,i)=>({id:'i'+i,word:'word'+i,image:{type:'emoji',value:'🐱'}}))});
assert.deepEqual(ITEM_OPTIONS,[2,3,4,5,6,7,8,9,10]);assert.deepEqual(CARD_OPTIONS,[1,2,3,4]);assert.equal(MODE_OPTIONS.length,3);
for(const size of [5,6,7,9,13,19,40])for(const mode of ['images','words','mixed'])for(const count of CARD_OPTIONS)for(const per of ITEM_OPTIONS){const set=make(size),state=resolveConfiguration(set,{...defaults,mode,count,per});assert(state.playable);assert(state.settings.per>=2);assert(state.settings.per<=Math.min(10,Math.floor((size-1)/state.settings.count)+1));assert(state.perOptions.includes(state.settings.per));if(mode==='mixed'){assert(state.settings.count<=2);assert(!state.counts.includes(3));}assert.equal(state.settings.per,Math.min(per,state.maximum));}
for(const size of [1,2,3,4]){const set=make(size);assert(validateSet(set));assert.throws(()=>validatePlayableSet(set),/Minimum: 5/);assert(!resolveConfiguration(set,defaults).playable);assert.deepEqual(resolveConfiguration(set,defaults).perOptions,[]);await assert.rejects(()=>setRepository.create(set),/Minimum: 5/);}
const bad=make(5);bad.items[4].word='';assert.equal(validConceptCount(bad),4);assert(!resolveConfiguration(bad,defaults).playable);
const noImages=make(5);noImages.items.forEach(item=>item.image=null);const availability=resolveConfiguration(noImages,defaults);assert(!availability.modes.images&&!availability.modes.mixed);assert(availability.modes.words);
const url=settingsFromURL('?mode=mixed&count=4&per=10&movement=fast&sound=false&delay=1000',defaults);assert.equal(url.count,2);assert.equal(url.per,10);assert.equal(url.movement,'fast');assert.equal(url.sound,false);assert.equal(settingsFromURL('?movement=bad&per=999',defaults).per,4);
console.log('PASS: fixed options, shared adaptive constraints, minimum-five writes, legacy reads, mode availability and launch settings.');
