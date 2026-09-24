import {maxItemsPerCard} from './engine.js';
import {normalizeSettings,saveSettings} from '../../shared/storage.js';
export function setupSettings(settings,sets,onApply,onOpen) {
  const dialog=document.querySelector('#settingsDialog'),form=document.querySelector('#settingsForm');
  for(const set of sets){const option=document.createElement('option');option.value=set.id;option.textContent=set.name;form.elements.set.append(option);}
  function constrain(){const mixed=form.elements.mode.value==='mixed';for(const option of form.elements.count.options)option.disabled=mixed && +option.value>2;if(mixed && +form.elements.count.value>2)form.elements.count.value='2';const size=sets.find(set=>set.id===form.elements.set.value)?.items.length||0;const count=+form.elements.count.value,max=maxItemsPerCard(size,count);for(const option of form.elements.per.options)option.disabled=+option.value>max;if(+form.elements.per.value>max)form.elements.per.value=String(max);document.querySelector('#capacityNote').textContent=`${size} concepts · up to ${max} per card with ${count} card(s).`;form.querySelector('[type=submit]').disabled=size<1;document.querySelector('#rulesNote').textContent=mixed?'Word + Image uses 1–2 cards so the match is always a picture and a word.':'With 3–4 cards, find the one concept shared by every card.';}
  function fill(){for(const [key,value] of Object.entries(settings)){const control=form.elements.namedItem(key);if(control.type==='checkbox')control.checked=value;else control.value=String(value);}constrain();}
  document.querySelector('#settingsOpen').onclick=()=>{fill();onOpen();dialog.showModal();};
  document.querySelector('#settingsClose').onclick=()=>dialog.close();
  for(const name of ['mode','set','count','per'])form.elements[name].addEventListener('change',constrain);
  form.onsubmit=event=>{event.preventDefault();const raw=Object.fromEntries(new FormData(form));for(const key of ['count','per','delay'])raw[key]=+raw[key];for(const key of ['sound','autoNext'])raw[key]=form.elements[key].checked;Object.assign(settings,normalizeSettings(raw));const saved=saveSettings(settings);document.querySelector('#storageNote').textContent=saved?'Settings are saved in this browser.':'Browser storage is unavailable. Settings apply to this visit only.';dialog.close();onApply(saved);};
  fill();return dialog;
}
