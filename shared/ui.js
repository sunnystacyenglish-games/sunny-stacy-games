import {mountSetupMenu} from './setup-menu.js';
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
 const {sets,settings,onPlay,onCancel,contentState}=options;let menu,started=false;
 const dialog=element('dialog','app-dialog pregame'),form=element('form'),title=element('h2','','Set up Dobble');dialog.setAttribute('aria-label','Set up Dobble');dialog.append(form);
 const select=(label,choices,value)=>{const wrapper=element('label','',label),input=element('select');input.setAttribute('aria-label',label);for(const [key,text] of choices)input.append(new Option(text,String(key)));input.value=String(value);wrapper.append(input);form.append(wrapper);return input;};
 const toggle=(label,value)=>{const wrapper=element('label','',label),input=element('input');input.type='checkbox';input.checked=value;input.setAttribute('aria-label',label);wrapper.append(input);form.append(wrapper);return input;};
 const setSelect=select('Content Set',sets.map(s=>[s.id,s.name]),set.id),theme=select('Theme',THEME_OPTIONS,settings.theme),sound=toggle('Sound',settings.sound);
 const count=select('Number of cards',CARD_OPTIONS.map(v=>[v,v]),settings.count),mode=select('Content type',MODE_OPTIONS,settings.mode),movement=toggle('Movement',settings.movement!=='off'),speed=select('Movement speed',MOVEMENT_OPTIONS.filter(([id])=>id!=='off'),settings.movement==='off'?'slow':settings.movement),autoNext=toggle('Auto next turn',settings.autoNext);
 for(const [name,input] of Object.entries({set:setSelect,theme,sound,count,mode,movementEnabled:movement,movement:speed,autoNext}))input.name=name;
 const note=element('p','help'),rule=element('p','help'),actions=element('div','row'),play=button('Play',()=>{},'primary');play.type='submit';actions.append(button('Cancel',()=>dialog.close()),play);form.append(title,note,rule,actions);
 const raw=()=>({...settings,set:setSelect.value,theme:theme.value,sound:sound.checked,count:+count.value,mode:mode.value,movement:movement.checked?speed.value:'off',autoNext:autoNext.checked,delay:600});
 function constrain(){set=sets.find(s=>s.id===setSelect.value);const content=menu?.sessionSet(set)||set,state=resolveConfiguration(content,raw());for(const option of count.options)option.disabled=!state.counts.includes(+option.value);for(const option of mode.options)option.disabled=!state.modes[option.value];count.value=String(state.settings.count);mode.value=state.settings.mode;speed.closest('label').hidden=!movement.checked;note.textContent=state.note;rule.textContent=state.settings.mode==='mixed'?'Word ↔ Image uses 1–2 cards.':'With 3–4 cards, find the concept shared by every card.';play.disabled=!state.playable;menu?.sync();return state;}
 for(const input of [setSelect,count,mode,movement,speed,autoNext])input.addEventListener('change',constrain);
 menu=mountSetupMenu({dialog,form,title,setSelect,themeSelect:theme,sound,getSets:()=>sets,setSets:next=>{sets.splice(0,sets.length,...next);},onContentChange:constrain,gameplay:[count.closest('label'),mode.closest('label'),movement.closest('label'),speed.closest('label'),autoNext.closest('label'),rule],status:[note],footer:actions,committedTheme:()=>settings.theme,state:contentState});
 form.onsubmit=event=>{event.preventDefault();const configuration=constrain();if(!configuration.playable)return;const content=menu.sessionSet(set);menu.commit();started=true;saveSettings(configuration.settings);onPlay(content,configuration.settings);dialog.close();};
 dialog.addEventListener('close',()=>{menu.destroy();dialog.remove();if(!started)onCancel?.();},{once:true});document.body.append(dialog);menu.begin();constrain();dialog.showModal();return dialog;
}
