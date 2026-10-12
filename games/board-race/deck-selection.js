import {contentRepository} from '../../shared/content-library.js';
import {availableDecks,validateSelectedDecks} from './decks.js';
import {normalizeDeckBlurMap} from './deck-blur.js';
const el=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
export function mountDeckSelection(panel,onChange){
 const concepts=el('div');concepts.append(...panel.children);
 const label=el('label','Content type'),source=el('select');source.id='contentMode';source.append(new Option('Concepts','concepts'),new Option('Cards / Decks','decks'));label.append(source);
 const host=el('section');host.hidden=true;let catalog=[],selected=[],blur={};panel.append(label,concepts,host);
 function draw(){
  concepts.hidden=source.value==='decks';host.hidden=source.value!=='decks';host.replaceChildren(el('h3','Choose 1–5 decks'));
  for(const documentId of new Set(catalog.map(d=>d.documentId))){
   const entries=catalog.filter(d=>d.documentId===documentId),group=el('section');group.className='setup-deck-group';group.append(el('h4',entries[0].documentName));
   for(const entry of entries){
    const row=el('div'),choice=el('label'),input=el('input'),isSelected=selected.some(x=>x.key===entry.key);input.type='checkbox';input.checked=isSelected;input.disabled=!isSelected&&selected.length>=5;
    input.onchange=()=>{selected=input.checked?[...selected,structuredClone(entry)]:selected.filter(x=>x.key!==entry.key);draw();onChange();};
    row.className='setup-deck-row';choice.className='setup-deck-choice';choice.append(input,el('span',entry.deck.name));row.append(choice);
    if(isSelected){
     const color=el('input');color.type='color';color.value=selected.find(x=>x.key===entry.key).deck.color;color.setAttribute('aria-label','Color for '+entry.deck.name);color.oninput=()=>{selected.find(x=>x.key===entry.key).deck.color=color.value;onChange();};row.prepend(color);
     const blurLabel=el('label','Blur'),select=el('select');blurLabel.className='deck-blur-label';select.setAttribute('aria-label','Blur for '+entry.documentName+' · '+entry.deck.name);
     for(const [value,text] of [['word-blur','Word Blur'],['picture-blur','Picture Blur'],['none','Nothing']])select.append(new Option(text,value));select.value=blur[entry.key]||'none';select.onchange=()=>{blur[entry.key]=select.value;onChange();};blurLabel.append(select);row.append(blurLabel);
    }group.append(row);
   }host.append(group);
  }
  for(const missing of selected.filter(x=>!catalog.some(d=>d.key===x.key))){const row=el('p','Missing deck'),remove=el('button','Remove');remove.type='button';remove.onclick=()=>{selected=selected.filter(x=>x.key!==missing.key);draw();onChange();};row.append(remove);host.append(row);}
  if(!catalog.length)host.append(el('p','No decks yet. Create a Card Deck in Content Studio.'));
 }
 source.onchange=()=>{draw();onChange();};
 return {setMode(mode){source.value=mode==='decks'?'decks':'concepts';draw();},hideType(){label.hidden=true;},get mode(){return source.value},read(){return validateSelectedDecks(selected)},blurMap(){return {...blur};},async begin(settings){catalog=availableDecks(await contentRepository.list());source.value=settings.contentMode||'concepts';blur=normalizeDeckBlurMap(settings.deckBlur);selected=(settings.deckRefs||[]).map(ref=>{const found=catalog.find(x=>x.key===ref.key);return found?{...structuredClone(found),deck:{...structuredClone(found.deck),color:ref.color||found.deck.color}}:{key:ref.key,deck:{name:'Missing deck',cards:[]}};});draw();onChange();},refs(){return selected.map(x=>({key:x.key,color:x.deck.color}))}};
}
