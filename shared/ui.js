import {applyTheme} from '../games/dobble/theme-view.js';
import {THEME_OPTIONS} from './themes.js';
import {loadSettings,saveSettings} from './storage.js';
import {resolveConfiguration,gameURL,CARD_OPTIONS,MODE_OPTIONS,MOVEMENT_OPTIONS} from '../games/dobble/config.js';
export function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
export function button(text,handler,className=''){const node=element('button',className,text);node.type='button';node.addEventListener('click',handler);return node;}
export function message(text,error=false){const host=document.querySelector('#message');host.textContent=text;host.classList.toggle('error',error);host.hidden=!text;}
export function confirmDialog(title,description,action='Delete'){
  return new Promise(resolve=>{
    const dialog=element('dialog','app-dialog');dialog.setAttribute('aria-label',title);dialog.append(element('h2','',title),element('p','',description));
    const actions=element('div','row');actions.append(button('Cancel',()=>dialog.close('cancel')),button(action,()=>dialog.close('yes'),'primary'));dialog.append(actions);document.body.append(dialog);
    dialog.addEventListener('close',()=>{const accepted=dialog.returnValue==='yes';dialog.remove();resolve(accepted);},{once:true});dialog.showModal();
  });
}
export function chooseGame(set,options){
 if(!options){location.href=gameURL(set,loadSettings());return;}
 const {sets,settings,onPlay,onSelect,onCancel}=options;const committedTheme=settings.theme;
 const dialog=element('dialog','app-dialog pregame');dialog.setAttribute('aria-label','Set up Dobble');
 const title=element('h2','','Set up Dobble'),summary=element('p','set-summary');dialog.append(title,summary);
 const label=element('label','','Content Set'),select=element('select');select.setAttribute('aria-label','Content Set');for(const entry of sets){const option=element('option','',entry.name);option.value=entry.id;select.append(option);}select.value=set.id;label.append(select);dialog.append(label);
 const controls=element('div','pregame-controls'),note=element('p','help');note.setAttribute('role','status');let state=resolveConfiguration(set,settings);
 select.onchange=()=>{set=sets.find(entry=>entry.id===select.value);state=resolveConfiguration(set,state.settings);sync();};
 function group(key,label,options){const field=element('fieldset');field.append(element('legend','',label));const row=element('div','choice-row');for(const [value,text] of options){const option=button(String(text),()=>{state=resolveConfiguration(set,{...state.settings,[key]:value});if(key==='theme')applyTheme(state.settings.theme);sync();});option.dataset.key=key;option.dataset.value=String(value);row.append(option);}field.append(row);controls.append(field);}
 group('count','Number of cards',CARD_OPTIONS.map(v=>[v,v]));group('mode','Card content',MODE_OPTIONS);group('movement','Movement',MOVEMENT_OPTIONS);group('theme','Theme',THEME_OPTIONS);group('sound','Sound',[[true,'On'],[false,'Off']]);group('autoNext','Auto next cards',[[true,'On'],[false,'Off']]);group('delay','Correct-answer delay',[[350,'Fast'],[600,'Normal'],[1000,'Slow']]);
 let started=false;const actions=element('div','row pregame-actions'),play=button('Play',()=>{state=resolveConfiguration(set,state.settings);if(!state.playable)return;started=true;saveSettings(state.settings);dialog.close();onPlay(set,state.settings);},'primary');actions.append(button('Cancel',()=>dialog.close()),play);dialog.append(controls,note,actions);
 function sync(){summary.textContent=set.name+' · '+set.items.length+' concepts · Dobble will use this set.';for(const option of controls.querySelectorAll('button')){const key=option.dataset.key,value=option.dataset.value;option.disabled=key==='count'?!state.counts.includes(+value):key==='mode'?!state.modes[value]:false;const active=String(state.settings[key])===value;option.setAttribute('aria-pressed',String(active));option.classList.toggle('selected',active);}note.textContent=state.note+(state.settings.mode==='mixed'?' Word ↔ Image uses 1–2 cards.':'');play.disabled=!state.playable;}
 sync();document.body.append(dialog);dialog.addEventListener('close',()=>{dialog.remove();if(!started){applyTheme(committedTheme);onCancel?.();}},{once:true});dialog.showModal();return dialog;
}
