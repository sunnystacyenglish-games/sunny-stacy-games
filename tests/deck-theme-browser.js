import {createActivity} from '../shared/activity/definition.js';
import {activityRegistry} from '../shared/activity/catalog.js';
import {contentRepository} from '../shared/content-library.js';
import {transact} from '../shared/database.js';
import {deckKey} from '../games/board-race/decks.js';
import {BoostRace} from '../games/board-race/boost-engine.js';
import {THEME_IDS} from '../shared/themes.js';
const f=document.querySelector('iframe'),out=document.querySelector('pre'),pause=ms=>new Promise(r=>setTimeout(r,ms)),check=(v,m)=>{if(!v)throw Error(m)};
const wait=async fn=>{for(let i=0;i<800;i++){if(fn())return;await pause(25)}throw Error('Timeout '+fn)};
const rng=seed=>()=>((seed=Math.imul(seed,1664525)+1013904223>>>0)/2**32);
const luminance=s=>s.match(/[\d.]+/g).slice(0,3).map(Number).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>(Math.max(luminance(a),luminance(b))+.05)/(Math.min(luminance(a),luminance(b))+.05);
document.querySelector('#run').onclick=async()=>{const storage='sunny-stacy.board-race.settings.v1',saved=localStorage.getItem(storage);let activity;out.textContent='Running';document.querySelector('#run').disabled=true;try{
 activity=createActivity({name:'__Theme test',gameType:'authoring-cardDecks',content:{type:'cardDecks',version:1,data:{decks:['#dd784d','#3f7dcc','#ab79bf'].map((color,i)=>({id:'d'+i,name:['Ask a question','CVC a','Hobbies'][i],color,cards:[{id:'c'+i,text:'Ask your partner a question.'}]}))}}},activityRegistry);await contentRepository.save(activity);const authored=JSON.stringify(activity),refs=activity.content.data.decks.map(d=>({key:deckKey(activity.id,d.id),color:d.color}));
 let seed,target;for(let s=1;s<1000;s++){const g=new BoostRace({mode:'endless',size:12,special:true,boosts:['shield']},rng(s));const hit=Object.keys(g.specials).find(i=>+i>=1&&+i<=6);if(g.current===0&&hit){seed=s;target=+hit;break;}}
 for(const [index,theme] of THEME_IDS.entries()){
  const mode=index%2?'decks':'concepts';f.src='../games/board-race/?contentMode='+mode+'&set=animals-1&deckRefs='+encodeURIComponent(JSON.stringify(refs))+'&theme='+theme+'&mode=endless&size=12&players=2&style=tiles&special=true&sound=false&boosts='+encodeURIComponent('["shield"]');await new Promise(r=>f.onload=r);const d=f.contentDocument,w=f.contentWindow,$=id=>d.getElementById(id);await wait(()=>$('setup')?.open);
  for(const tab of d.querySelectorAll('[role=tab]')){tab.click();for(const control of d.querySelectorAll('dialog[open] input:not([type=checkbox]):not([type=range]):not([type=color]),dialog[open] select')){if(!control.getClientRects().length)continue;const cs=w.getComputedStyle(control);check(contrast(cs.color,cs.backgroundColor)>=4.5,theme+' value contrast '+control.id);control.focus();check(w.getComputedStyle(control).outlineStyle!=='none',theme+' focus');}}
  if(mode==='decks'){const selects=[...d.querySelectorAll('.deck-blur-label select')];['word-blur','picture-blur','none'].forEach((value,i)=>{selects[i].value=value;selects[i].dispatchEvent(new w.Event('change',{bubbles:true}));});const first=d.querySelector('.setup-deck-choice input');first.click();d.querySelector('.setup-deck-choice input').click();check([...d.querySelectorAll('.deck-blur-label select')].some(s=>s.value==='word-blur'),'Reselection keeps Blur');check($('displayLabel').hidden,'Concept blur hidden for decks');}
  $('setupForm').requestSubmit();await wait(()=>$('pawns').open);w.Math.random=rng(seed);$('startGame').click();await wait(()=>!$('roll').disabled);const before=$('players').textContent;
  check(!d.querySelector('.race-tile.special'),'Boost concealed before landing');w.Math.random=()=>(target-.5)/6;$('roll').click();await wait(()=>$('specialOverlay').open);
  const tile=d.querySelector('.race-tile.special'),segment=d.querySelector('.track-segment.special');check(tile&&segment,'Boost revealed');const fill=w.getComputedStyle(segment).fill,ink=w.getComputedStyle(tile.querySelector('span')).color;check(luminance(fill)>.1&&contrast(fill,ink)>=4.5,theme+' boost fill/text');check(d.querySelectorAll('.race-piece').length===2,'Pawns remain');
  [...d.querySelectorAll('.boost-choices button')].find(b=>b.textContent==='Yes').click();await wait(()=>!$('roll').disabled);$('settingsOpen').click();await wait(()=>$('setup').open);
  if(mode==='decks'){check(Object.values(JSON.parse(localStorage.getItem(storage)).deckBlur).includes('word-blur'),'Blur persisted');check(d.querySelector('.deck-blur-label select').value==='word-blur','Reopened Blur');}
  $('cancelSetup').click();check($('players').textContent!==before,'Progress retained');out.textContent+='\nPASS '+theme+': controls, focus, '+mode+', hidden/revealed boost, settings';
 }
 check(JSON.stringify(await contentRepository.get(activity.id))===authored,'Authored data unchanged');out.textContent+='\nALL THEME CHECKS PASSED';
 }catch(e){out.textContent+='\nFAIL '+e.stack;console.error(e)}finally{if(activity)await transact('readwrite',s=>s.delete(activity.id),'activities');saved===null?localStorage.removeItem(storage):localStorage.setItem(storage,saved);document.querySelector('#run').disabled=false;}};
