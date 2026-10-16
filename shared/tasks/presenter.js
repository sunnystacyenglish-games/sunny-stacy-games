import {BridgeTask,taskAnswerDiff} from './model.js';
import {cardContent} from './card.js';
const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};

// Content owns its reveal state; only the game controller applies the result.
export function mountTaskPresenter(host,{onReady=()=>{}}={}){
 let generation=0,bridge=null,revealed=false,ready=false,task,drag=null;
 function stopDrag(){if(!drag)return;const previous=drag;drag=null;previous.ghost?.remove();if(previous.button.hasPointerCapture?.(previous.pointerId))previous.button.releasePointerCapture(previous.pointerId);for(const gap of host.querySelectorAll('.is-drop-target'))gap.classList.remove('is-drop-target');}
 function draggable(button,option){
  button.classList.add('activity-task-draggable');
  button.onpointerdown=e=>{if(revealed||e.button!==0)return;stopDrag();drag={button,option,pointerId:e.pointerId,x:e.clientX,y:e.clientY,ghost:null};button.setPointerCapture(e.pointerId);};
  button.onpointermove=e=>{
   if(!drag||drag.pointerId!==e.pointerId)return;
   if(!drag.ghost&&Math.hypot(e.clientX-drag.x,e.clientY-drag.y)<8)return;
   if(!drag.ghost){const r=button.getBoundingClientRect();drag.ghost=button.cloneNode(true);drag.ghost.className='activity-task-drag-preview';drag.ghost.setAttribute('aria-hidden','true');drag.ghost.style.width=r.width+'px';document.body.append(drag.ghost);}
   drag.ghost.style.left=e.clientX+'px';drag.ghost.style.top=e.clientY+'px';
   const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-gap-id]');
   for(const gap of host.querySelectorAll('[data-gap-id]'))gap.classList.toggle('is-drop-target',gap===target&&bridge.source.gaps.some(g=>g.id===gap.dataset.gapId&&g.groupId===option.groupId));
  };
  button.onpointerup=e=>{
   if(!drag||drag.pointerId!==e.pointerId)return;const moved=!!drag.ghost;
   const target=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-gap-id]');
   const gap=target&&host.contains(target)&&bridge.source.gaps.find(g=>g.id===target.dataset.gapId&&g.groupId===option.groupId);
   stopDrag();if(!moved)return;
   // A drag must not also activate the click-based placement path.
   button.onclick=e=>e.preventDefault();
   if(gap&&!revealed){bridge.select(gap.id);bridge.place(option.id);draw();host.querySelector(`[data-gap-id="${CSS.escape(gap.id)}"]`)?.focus();}
   else draw();
  };
  button.onpointercancel=stopDrag;button.onlostpointercapture=stopDrag;
 }
 const signal=()=>onReady(ready&&(task?.type==='cardDecks'||revealed));
 function section(label){const box=el('section','activity-task-section');box.append(el('h3','activity-task-label',label));return box;}
 function bridgeSentence(answer=false){
  const row=el('div','activity-task-sentence');
  for(const f of bridge.fragments(answer)){
   if(!f.gapId)row.append(el('span','',f.text));
   else if(answer)row.append(el('mark','activity-task-answer',f.text));
   else{
    const button=el('button','activity-task-gap',f.text||'\u00a0');button.type='button';button.dataset.gapId=f.gapId;button.setAttribute('aria-label',`Gap ${bridge.source.gaps.findIndex(g=>g.id===f.gapId)+1}${f.text?': '+f.text:''}`);button.setAttribute('aria-pressed',String(bridge.selected===f.gapId));button.disabled=bridge.revealed;
    button.dataset.groupId=bridge.source.gaps.find(g=>g.id===f.gapId).groupId;
    if(f.optionId)button.dataset.tone=String(bridge.options.findIndex(o=>o.id===f.optionId)%4);
    if(revealed){const correct=bridge.assessment.gaps.find(g=>g.gapId===f.gapId).correct;button.dataset.result=correct?'correct':'incorrect';button.setAttribute('aria-invalid',String(!correct));button.setAttribute('aria-label',button.getAttribute('aria-label')+(correct?' — Correct':' — Incorrect'));}
    button.onclick=()=>{if(bridge.select(f.gapId))draw();};row.append(button);
   }
  }return row;
 }
 function draw(){
  stopDrag();host.replaceChildren();host.classList.add('activity-task');host.dataset.taskType=task.type;
  const original=section('Original');
  if(task.type==='bridge'){
   original.append(bridgeSentence());const options=el('div','activity-task-options');
   for(const option of bridge.available(true)){
    const button=el('button','activity-task-option',option.text);button.type='button';button.dataset.tone=String(bridge.options.indexOf(option)%4);button.disabled=revealed;if(option.text.length>25)button.classList.add('is-long');
    button.dataset.groupId=option.groupId;draggable(button,option);
    button.onclick=()=>{
     const before=button.getBoundingClientRect(),gapId=bridge.selected;
     if(!bridge.place(option.id))return;draw();
     const target=[...host.querySelectorAll('[data-gap-id]')].find(n=>n.dataset.gapId===gapId);target?.focus();
     if(target&&!matchMedia('(prefers-reduced-motion: reduce)').matches){const after=target.getBoundingClientRect();target.animate([{transform:`translate(${before.x-after.x}px,${before.y-after.y}px)`},{transform:'translate(0,0)'}],{duration:180,easing:'ease-out'});}
    };options.append(button);
   }original.append(options);
  }else original.append(el('p','activity-task-text',task.incorrect));
  host.append(original);
  if(revealed){
   const answer=section('Answer');
   if(bridge)answer.append(bridgeSentence(true));
   else{const text=el('p','activity-task-text');for(const token of taskAnswerDiff(task.incorrect,task.correct))text.append(el(token.changed?'mark':'span',token.changed?'activity-task-answer':'',token.text));answer.append(text);}
   host.append(answer);
  }else{
   const button=el('button','activity-task-reveal','◉  Reveal Answer');button.type='button';button.disabled=!!bridge&&!bridge.complete;
   button.onclick=()=>{if(revealed||bridge&&!bridge.reveal())return;revealed=true;draw();signal();};host.append(button);
  }signal();
 }
 return {
  async show(value){
   stopDrag();const token=++generation;task=structuredClone(value);bridge=null;revealed=false;ready=false;host.replaceChildren();signal();
   if(task.type==='cardDecks'){
    host.classList.add('activity-task');host.dataset.taskType=task.type;const card=el('article','activity-task-card');
    const content=await cardContent(task);if(token!==generation)return false;card.append(content);card.querySelector('p')?.classList.add('activity-task-text');host.append(card);ready=true;signal();return true;
   }
   if(task.type==='bridge')bridge=new BridgeTask(task);
   else if(task.type!=='sentenceCorrection')throw Error('Unsupported task content.');
   ready=true;draw();return true;
  },
  clear(){stopDrag();generation++;ready=false;task=null;bridge=null;host.replaceChildren();signal();},
  get canResolve(){return ready&&(task?.type==='cardDecks'||revealed);},
  get automaticResult(){return ready&&revealed&&bridge?bridge.assessment.correct:null;}
 };
}
