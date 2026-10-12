import {contentRepository} from '../content-library.js';
import {taskSnapshot} from './model.js';
import {cardContent} from './card.js';
const labels={concepts:'Concepts',decks:'Cards / Decks',cardDecks:'Card Decks',sentenceCorrection:'Sentence Correction',bridge:'Bridges'};
const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
// Wrap an existing Concepts panel rather than duplicating its exclusion/folder UI.
export function mountTaskSelection(panel,{types,legacyModes=[],onChange=()=>{}}){
 const concepts=el('div');concepts.append(...panel.children);
 const typeLabel=el('label','Content type'),type=el('select');type.setAttribute('aria-label','Content type');for(const id of ['concepts',...legacyModes,...types])type.append(new Option(labels[id],id));typeLabel.append(type);
 const authored=el('section'),label=el('label','Content'),select=el('select');select.setAttribute('aria-label','Task content');label.append(select);
 const deckLabel=el('label','Deck'),deck=el('select');deck.setAttribute('aria-label','Task deck');deckLabel.append(deck);authored.append(label,deckLabel);panel.append(typeLabel,concepts,authored);
 let documents=[],chosen={},generation=0,error='';
 function draw(){
  concepts.hidden=types.includes(type.value);authored.hidden=!types.includes(type.value);deckLabel.hidden=type.value!=='cardDecks';
  const prior=chosen[type.value]||{};select.replaceChildren(new Option('Choose content',''),...documents.filter(d=>d.content.type===type.value).map(d=>new Option(d.name,d.id)));
  if(prior.id&&!documents.some(d=>d.id===prior.id))select.append(new Option('Content unavailable',prior.id));select.value=prior.id||'';
  const selected=documents.find(d=>d.id===select.value);deck.replaceChildren(new Option('Choose a deck',''),...(selected?.content.data.decks||[]).map(d=>new Option(d.name,d.id)));deck.value=prior.deckId||'';onChange();
 }
 type.onchange=draw;
 select.onchange=()=>{chosen[type.value]={id:select.value,deckId:''};draw();};
 deck.onchange=()=>{chosen[type.value]={id:select.value,deckId:deck.value};onChange();};
 return {
  get mode(){return type.value;},
  read(){if(error)throw Error(error);return taskSnapshot(documents.find(d=>d.id===select.value),{deckId:deck.value});},
  reference(){return {contentMode:type.value,contentId:select.value,taskDeckId:deck.value};},
  async load(){const snapshot=this.read();const fresh=await contentRepository.get(snapshot.documentId);const result=taskSnapshot(fresh,{deckId:deck.value});for(const item of result.items)if(item.image)await cardContent(item);return result;},
  async begin(settings){const token=++generation;type.value=[...types,...legacyModes].includes(settings.contentMode)?settings.contentMode:'concepts';chosen[type.value]={id:settings.contentId||'',deckId:settings.taskDeckId||''};error='';try{const next=await contentRepository.list();if(token!==generation)return;documents=next;}catch{if(token!==generation)return;documents=[];error='Content storage is unavailable. Try again.';}draw();}
 };
}
