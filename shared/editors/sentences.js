import {baseEditor,el,action,capacity,id,move} from './common.js';
import {iconButton,accordion,toolbar,autoSize} from './controls.js';
import {CONTENT_LIMITS as L} from '../activity/limits.js';
import {sentenceDiff} from './models.js';
export function mountSentenceEditor(options){const expanded=new Set();return baseEditor(options,c=>{
 c.space.classList.add('studio-editor');const rows=c.data.sentences;if(!c.services.compactHeader)capacity(c.space,'Sentence Correction',rows.length,L.sentenceCorrection.sentences,'sentences');c.space.append(toolbar(rows,expanded,c.draw));
 rows.forEach((pair,index)=>{
  const title=el('span','studio-title'),updateTitle=()=>title.textContent=`#${index+1} ${pair.incorrect} → ${pair.correct}`;updateTitle();
  const {section,summary}=accordion(pair.id,expanded,title),body=el('div','studio-body'),fields=el('div','sentence-fields'),controls=el('span','studio-summary-actions');
  controls.onclick=e=>e.stopPropagation();const arrows=el('span','studio-arrows');arrows.append(iconButton('up','Move sentence up',()=>{move(rows,pair,-1);c.changed();c.draw();},index===0),iconButton('down','Move sentence down',()=>{move(rows,pair,1);c.changed();c.draw();},index===rows.length-1));
  const menu=el('details','studio-menu'),menuSummary=el('summary','','⋯');menuSummary.title='More sentence actions';menuSummary.setAttribute('aria-label','More sentence actions');menu.append(menuSummary,action('⧉ Duplicate Sentence',()=>{if(rows.length>=30)return;const copy={...structuredClone(pair),id:id()};rows.splice(index+1,0,copy);expanded.add(copy.id);c.changed();c.draw();},rows.length>=30));
  controls.append(arrows,menu,iconButton('trash','Delete sentence',()=>{rows.splice(index,1);c.changed();c.draw();}));summary.append(controls);
  const views={};function compare(){const result=sentenceDiff(pair.incorrect,pair.correct);for(const [key,side] of [['correct','right'],['incorrect','left']]){const v=views[key];if(!v)continue;v.view.replaceChildren();for(const token of result[side])v.view.append(el(token.changed?'mark':'span','',token.text));if(!pair[key])v.view.append(el('span','editor-capacity','Click to edit'));}}
  for(const key of ['correct','incorrect']){
   const wrap=el('div','studio-sentence-field diff-'+key),label=el('label','',key==='correct'?'✓ Correct':'✕ Incorrect'),textarea=el('textarea'),view=el('button','studio-diff-view');view.type='button';view.setAttribute('aria-label',key==='correct'?'Edit correct sentence':'Edit incorrect sentence');textarea.setAttribute('aria-label',key==='correct'?'Correct sentence':'Incorrect sentence');textarea.value=pair[key];textarea.maxLength=2000;textarea.hidden=true;const resize=autoSize(textarea);
   view.onclick=()=>{view.hidden=true;textarea.hidden=false;resize();textarea.focus();};textarea.oninput=()=>{pair[key]=textarea.value;updateTitle();c.changed();};textarea.onblur=()=>{view.style.minHeight=Math.max(44,textarea.offsetHeight)+'px';textarea.hidden=true;view.hidden=false;compare();};
   label.append(textarea);wrap.append(label,view);fields.append(wrap);views[key]={view,textarea};
  }
  compare();body.append(fields,action('Compare',()=>{for(const v of Object.values(views)){v.textarea.blur();v.textarea.hidden=true;v.view.hidden=false;}compare();}));section.append(body);c.space.append(section);
 });
 c.space.append(action('+ Add sentence',()=>{if(rows.length>=30)return;const pair={id:id(),incorrect:'',correct:''};rows.push(pair);expanded.add(pair.id);c.changed();c.draw();const card=c.space.querySelector('.studio-accordion:last-of-type');card?.querySelector('.studio-diff-view')?.click();},rows.length>=30));if(rows.length>=30)c.space.append(el('p','editor-limit','Maximum 30 sentences reached.'));
});}
