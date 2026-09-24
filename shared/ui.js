import {loadSettings,saveSettings} from './storage.js';
import {resolveConfiguration,gameURL,CARD_OPTIONS,ITEM_OPTIONS,MODE_OPTIONS,MOVEMENT_OPTIONS} from '../games/dobble/config.js';
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
export function chooseGame(set){
  const dialog=element('dialog','app-dialog pregame');dialog.setAttribute('aria-label','Set up Dobble');
  dialog.append(element('h2','',set.name),element('p','set-summary',set.items.length+' concepts · Dobble will use this set.'));
  const controls=element('div','pregame-controls'),note=element('p','help');note.setAttribute('role','status');
  let state=resolveConfiguration(set,loadSettings());
  function group(key,label,options){const field=element('fieldset');field.append(element('legend','',label));const row=element('div','choice-row');for(const [value,text] of options){const option=button(String(text),()=>{state=resolveConfiguration(set,{...state.settings,[key]:value});sync();});option.dataset.key=key;option.dataset.value=String(value);row.append(option);}field.append(row);controls.append(field);}
  group('count','Number of cards',CARD_OPTIONS.map(value=>[value,value]));group('per','Items per card',ITEM_OPTIONS.map(value=>[value,value]));group('mode','Card content',MODE_OPTIONS);group('movement','Movement',MOVEMENT_OPTIONS);
  const actions=element('div','row pregame-actions'),play=button('Play',()=>{state=resolveConfiguration(set,state.settings);if(!state.playable){sync();return;}saveSettings(state.settings);location.href=gameURL(set,state.settings);},'primary');
  actions.append(button('Cancel',()=>dialog.close()),play);dialog.append(controls,note,actions);
  function sync(){for(const option of controls.querySelectorAll('button')){const key=option.dataset.key,value=option.dataset.value;option.disabled=key==='count'?!state.counts.includes(+value):key==='per'?!state.perOptions.includes(+value):key==='mode'?!state.modes[value]:false;const selected=String(state.settings[key])===value;option.setAttribute('aria-pressed',String(selected));option.classList.toggle('selected',selected);}note.textContent=state.note+(state.settings.mode==='mixed'?' Word ↔ Image uses 1–2 cards.':'');play.disabled=!state.playable;}
  sync();document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();
}
