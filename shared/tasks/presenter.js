import {BridgeTask,taskAnswerDiff} from './model.js';
import {cardContent} from './card.js';
const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};

// Content owns its reveal state; only the game controller applies the result.
export function mountTaskPresenter(host,{onReady=()=>{}}={}){
 let generation=0,bridge=null,revealed=false,ready=false,task;
 const signal=()=>onReady(ready&&(task?.type==='cardDecks'||revealed));
 function section(label){const box=el('section','activity-task-section');box.append(el('h3','activity-task-label',label));return box;}
 function bridgeSentence(answer=false){
  const row=el('div','activity-task-sentence');
  for(const f of bridge.fragments(answer)){
   if(!f.gapId)row.append(el('span','',f.text));
   else if(answer)row.append(el('mark','activity-task-answer',f.text));
   else{
    const button=el('button','activity-task-gap',f.text||'\u00a0');button.type='button';button.dataset.gapId=f.gapId;button.setAttribute('aria-label',`Gap ${bridge.source.gaps.findIndex(g=>g.id===f.gapId)+1}${f.text?': '+f.text:''}`);button.setAttribute('aria-pressed',String(bridge.selected===f.gapId));button.disabled=bridge.revealed;
    if(f.optionId)button.dataset.tone=String(bridge.options.findIndex(o=>o.id===f.optionId)%4);
    button.onclick=()=>{if(bridge.select(f.gapId))draw();};row.append(button);
   }
  }return row;
 }
 function draw(){
  host.replaceChildren();host.classList.add('activity-task');host.dataset.taskType=task.type;
  const original=section('Original');
  if(task.type==='bridge'){
   original.append(bridgeSentence());const options=el('div','activity-task-options');
   for(const option of bridge.available()){
    const button=el('button','activity-task-option',option.text);button.type='button';button.dataset.tone=String(bridge.options.indexOf(option)%4);button.disabled=revealed||!bridge.selected;if(option.text.length>25)button.classList.add('is-long');
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
   const token=++generation;task=structuredClone(value);bridge=null;revealed=false;ready=false;host.replaceChildren();signal();
   if(task.type==='cardDecks'){
    host.classList.add('activity-task');host.dataset.taskType=task.type;const card=el('article','activity-task-card');
    const content=await cardContent(task);if(token!==generation)return false;card.append(content);card.querySelector('p')?.classList.add('activity-task-text');host.append(card);ready=true;signal();return true;
   }
   if(task.type==='bridge')bridge=new BridgeTask(task);
   else if(task.type!=='sentenceCorrection')throw Error('Unsupported task content.');
   ready=true;draw();return true;
  },
  clear(){generation++;ready=false;task=null;bridge=null;host.replaceChildren();signal();},
  get canResolve(){return ready&&(task?.type==='cardDecks'||revealed);}
 };
}
