import {contentRepository} from '../shared/content-library.js';
const frame=document.querySelector('iframe'),log=document.querySelector('#log'),run=document.querySelector('#run');let doc;
const assert=(v,m)=>{if(!v)throw Error(m);},pause=ms=>new Promise(r=>setTimeout(r,ms));
async function wait(fn,m){for(let i=0;i<500;i++){if(fn())return;await pause(30);}throw Error(m);}
function click(selector){const b=doc.querySelector(selector);assert(b&&!b.disabled,'Available '+selector);b.click();}
const source={id:'bridges-auto-test',name:'Bridges auto check',gameType:'authoring-bridge',schemaVersion:1,content:{type:'bridge',version:1,data:{bridges:[{id:'sentence',bricks:[{id:'a',text:'I'},{id:'b',text:'go'},{id:'c',text:'by bus'}],gaps:[{id:'verb',brickId:'b',groupId:'verbs'},{id:'travel',brickId:'c',groupId:'travel'}],groups:[{id:'verbs',distractors:[{id:'wrong',text:'goes'},{id:'same',text:'go'}]},{id:'travel',distractors:[{id:'wrong',text:'on bus'}]}]}]}},themeConfig:{theme:'notebook'},gameplayConfig:{},metadata:{createdAt:'2026-10-16T00:00:00Z',updatedAt:'2026-10-16T00:00:00Z'}};
async function scenario(game,success,mode='race',width=1000){
 frame.style.width=width+'px';frame.src=`../games/${game}/?contentMode=bridge&contentId=bridges-auto-test&sound=false&players=2&special=false&size=12&mode=${mode}&theme=board-game`;
 await new Promise(r=>frame.onload=r);doc=frame.contentDocument;await wait(()=>doc.querySelector('#setup[open]')&&!doc.querySelector('#play').disabled,'setup');click('#play');
 if(game==='board-race'){await wait(()=>doc.querySelector('#pawns[open]'),'pawns');click('#startGame');await wait(()=>!doc.querySelector('#roll').disabled,'roll');click('#roll');await wait(()=>doc.querySelector('#task[open] .activity-task-gap'),'task');}
 else await wait(()=>doc.querySelector('.activity-task-gap'),'CHOMP task');
 const positions=()=>[...doc.querySelectorAll('.race-piece')].map(e=>e.getAttribute('aria-label')).join('|'),before=positions(),player=doc.querySelector('.player.active')?.dataset.player;
 assert(!doc.querySelector('[data-result]'),'No assessment before reveal');
 for(const gap of [...doc.querySelectorAll('.activity-task-gap')]){gap.click();const text=gap.dataset.gapId==='verb'?(success?'go':'goes'):'by bus';const candidates=[...doc.querySelectorAll('.activity-task-option')].filter(o=>o.textContent===text);candidates.at(-1).click();}
 assert(!doc.querySelector('[data-result]'),'Placement does not reveal correctness');const next=doc.querySelector('.teacher-actions button:not([hidden]):last-child');assert(next.disabled,'Continue locked');
 click('.activity-task-reveal');assert(doc.querySelectorAll('[data-result=incorrect]').length===(success?0:1),'Incorrect gaps highlighted');assert(doc.querySelectorAll('[data-result=correct]').length===(success?2:1),'Correct gaps highlighted');assert([...doc.querySelectorAll('.activity-task-gap,.activity-task-option')].every(e=>e.disabled),'Locked after reveal');assert(!next.disabled,'Continue enabled');
 if(game==='board-race')assert(positions()===before,'Reveal does not move');else assert(!doc.querySelector('[data-hit][aria-disabled=false]'),'Reveal does not unlock teeth');
 next.click();next.click();
 if(game==='board-race'){await wait(()=>doc.body.dataset.state==='READY','next turn');assert((positions()!==before)===success,'Movement matches automatic result');}
 else if(success){await wait(()=>doc.body.dataset.state==='WAIT_FOR_TOOTH','tooth selection');assert(doc.querySelector('[data-hit][aria-disabled=false]'),'Correct unlocks teeth');}
 else{await wait(()=>doc.body.dataset.state==='TASK_ACTIVE'&&doc.querySelector('.player.active').dataset.player!==player,'Incorrect advances player');assert(!doc.querySelector('[data-hit][aria-disabled=false]'),'Incorrect keeps teeth locked');}
 assert(doc.documentElement.scrollWidth<=width+1,'No horizontal overflow');log.textContent+=`PASS ${game} ${mode} ${success?'Correct':'Incorrect'} ${width}px\n`;
}
run.onclick=async()=>{if(location.port!=='4180')return;run.disabled=true;log.textContent='';try{await contentRepository.save(source);for(const success of [false,true]){await scenario('chomp',success);for(const mode of ['race','endless'])await scenario('board-race',success,mode);}await scenario('chomp',false,'race',390);await scenario('board-race',false,'race',390);assert(JSON.stringify(await contentRepository.get(source.id))===JSON.stringify(source),'Source unchanged');log.textContent+='ALL BRIDGES ASSESSMENT CHECKS PASSED';}catch(e){log.textContent+='FAIL '+e.stack;}finally{run.disabled=false;}};
