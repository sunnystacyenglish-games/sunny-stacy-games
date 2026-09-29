import {createSettingsPreview} from '../../shared/settings-preview.js';
import {applyTheme} from './theme-view.js';
import {resolveConfiguration} from './config.js';
import {normalizeSettings,saveSettings} from '../../shared/storage.js';
export function setupSettings(settings,sets,onApply,onOpen) {
  const dialog=document.querySelector('#settingsDialog'),form=document.querySelector('#settingsForm');
  let settingsAtOpen=null;
  const preview=createSettingsPreview(settings,['theme'],()=>applyTheme(settings.theme));
  dialog.addEventListener('close',()=>preview.cancel());
  form.elements.theme.addEventListener('change',()=>preview.update({theme:form.elements.theme.value}));
  form.elements.set.replaceChildren();for(const set of sets){const option=document.createElement('option');option.value=set.id;option.textContent=set.name;form.elements.set.append(option);}
  function constrain(){const set=sets.find(set=>set.id===form.elements.set.value);const state=resolveConfiguration(set,{...settings,mode:form.elements.mode.value,count:+form.elements.count.value});for(const option of form.elements.mode.options)option.disabled=!state.modes[option.value];for(const option of form.elements.count.options)option.disabled=!state.counts.includes(+option.value);for(const name of ['mode','count'])form.elements[name].value=String(state.settings[name]);document.querySelector('#capacityNote').textContent=state.note;form.querySelector('[type=submit]').disabled=!state.playable;document.querySelector('#rulesNote').textContent=state.settings.mode==='mixed'?'Word ↔ Image uses 1–2 cards so the match is always a picture and a word.':'With 3–4 cards, find the one concept shared by every card.';return state;}
  function fill(){for(const [key,value] of Object.entries(settings)){const control=form.elements.namedItem(key);if(!control)continue;if(control.type==='checkbox')control.checked=value;else control.value=String(value);}constrain();}
  document.querySelector('#settingsOpen').onclick=()=>{settingsAtOpen={...settings};
    // Keep the current content box fixed across themes with different border widths.
    for(const card of document.querySelectorAll('#game .card'))card.style.borderWidth=getComputedStyle(card).borderTopWidth;
    preview.begin();fill();onOpen();dialog.showModal();};
  document.querySelector('#settingsClose').onclick=()=>dialog.close();
  document.querySelector('#settingsCancel').onclick=()=>dialog.close();
  for(const name of ['mode','set','count'])form.elements[name].addEventListener('change',constrain);
  form.onsubmit=event=>{event.preventDefault();if(!constrain().playable)return;const raw=Object.fromEntries(new FormData(form));for(const key of ['count','delay'])raw[key]=+raw[key];for(const key of ['sound','autoNext'])raw[key]=form.elements[key].checked;const next=resolveConfiguration(sets.find(set=>set.id===raw.set),normalizeSettings(raw)).settings;const restart=['set','mode','count','movement'].some(key=>next[key]!==settingsAtOpen?.[key]);Object.assign(settings,next);preview.commit();const saved=saveSettings(settings);document.querySelector('#storageNote').textContent=saved?'Settings are saved in this browser.':'Browser storage is unavailable. Settings apply to this visit only.';dialog.close();onApply(saved,restart);};
  fill();return dialog;
}

