import assert from 'node:assert/strict';
import {resolveConfiguration,settingsFromURL,CARD_OPTIONS,gameURL} from '../games/dobble/config.js';
import {resolveSetReference} from '../games/dobble/resolution.js';
import {validatePlayableSet,isWord,isEmoji} from '../shared/content-rules.js';
import {defaults} from '../shared/storage.js';
const make=n=>({id:'set'+n,name:'Test',items:Array.from({length:n},(_,i)=>({id:'i'+i,word:'cat',image:{type:'emoji',value:'🐱'}}))});
for(const n of [5,6,7,13,40])for(const count of CARD_OPTIONS)for(const mode of ['images','words','mixed']){const set=make(n),a=resolveConfiguration(set,{...defaults,count,mode,per:2}),b=resolveConfiguration(set,{...defaults,count,mode,per:10});assert(a.playable);assert.equal(a.settings.per,b.settings.per);assert(a.settings.per<=6);assert(1+a.settings.count*(a.settings.per-1)<=n);if(mode==='mixed')assert(a.settings.count<=2);const url=new URL(gameURL(set,a.settings));assert.equal(url.searchParams.get('set'),set.id);assert(!url.searchParams.has('per')&&!url.searchParams.has('items'));}
for(let n=1;n<5;n++){assert(!resolveConfiguration(make(n),defaults).playable);assert.throws(()=>validatePlayableSet(make(n)));}
for(const emoji of ['🐱','👩🏽‍🏫','🇬🇧','1️⃣','❤️','👨‍👩‍👧']){assert(isEmoji(emoji));assert(!isWord(emoji));}
for(const word of ['cat','ice cream','ёлка','猫','123','café']){assert(isWord(word));assert(!isEmoji(word));}assert(!isEmoji('cat🐱'));
const set=make(5),demo={...make(13),id:'animals-1'};assert.equal(resolveSetReference([demo,set],set.id,demo.id),set);assert.equal(resolveSetReference([demo,set],'missing-uuid',set.id),null);assert.equal(resolveSetReference([demo,set],'',set.id),null);assert.equal(resolveSetReference([demo,set],undefined,set.id),set);
const settings=settingsFromURL('?mode=images&count=2&movement=fast&theme=candy&per=10',defaults);assert.equal(settings.theme,'candy');assert.equal(settings.movement,'fast');assert.equal(settings.per,defaults.per);
console.log('PASS: authoritative IDs, internal density, canonical links, minimum-five and Unicode semantics.');
