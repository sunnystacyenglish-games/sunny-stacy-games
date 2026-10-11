import {element} from '../shared/ui.js';
import {imageURL} from '../shared/images.js';
import {activityAssets} from '../shared/activity/repository.js';
import {sentenceDiff} from '../shared/editors/models.js';
const fallback=(host,text)=>host.replaceChildren(element('span','muted',text));
function image(host,src,alt){if(!src)return fallback(host,'Image unavailable');const img=new Image();img.alt=alt;img.loading='lazy';img.decoding='async';img.referrerPolicy='no-referrer';img.onload=()=>host.classList.add('loaded');img.onerror=()=>fallback(host,'Image unavailable');img.src=src;host.append(img);}
export async function renderPreview(host,item){
 const data=item.record.content?.data||{};
 if(item.type==='conceptSet'){
  host.classList.add('library-concepts');const concepts=item.record.items||[];
  for(const concept of concepts.filter(c=>c.image).slice(0,4)){const cell=element('span','library-concept');host.append(cell);if(concept.image.type==='emoji')cell.textContent=concept.image.value;else image(cell,imageURL(concept.image),concept.word);}
  if(!host.children.length)fallback(host,concepts.slice(0,4).map(c=>c.word).join(' · ')||'Concepts');
 }else if(item.type==='scene'){
  if(!data.background)return fallback(host,'Scene');
  try{image(host,await activityAssets.mediaURL(data.background),item.name);}catch{fallback(host,'Image unavailable');}
 }else if(item.type==='cardDecks'){
  host.classList.add('library-decks');for(const deck of (data.decks||[]).filter(d=>/^#[0-9a-f]{6}$/i.test(d.color)).slice(0,5)){const pile=element('span','library-pile');pile.style.setProperty('--deck-color',deck.color);pile.title=deck.name;pile.setAttribute('aria-label',deck.name);host.append(pile);}if(!host.children.length)fallback(host,'Card Decks');
 }else if(item.type==='bridge'){
  host.classList.add('library-bridge');const bridge=data.bridges?.[0];for(const brick of (bridge?.bricks||[]).slice(0,6)){const gap=bridge.gaps?.some(g=>g.brickId===brick.id);host.append(element('span','library-brick'+(gap?' is-gap':''),brick.text));}if(!host.children.length)fallback(host,'Bridges');
 }else if(item.type==='sentenceCorrection'){
  host.classList.add('library-sentences');const pair=data.sentences?.[0];if(!pair)return fallback(host,'Sentence Correction');const diff=sentenceDiff(pair.incorrect||'',pair.correct||'');for(const [side,label] of [['right','Correct'],['left','Incorrect']]){const line=element('div','library-diff '+side);line.setAttribute('aria-label',label);line.append(element('span','diff-sign',side==='right'?'✓ ':'✕ '));for(const token of diff[side])line.append(element(token.changed?'mark':'span','',token.text));host.append(line);}
 }else fallback(host,'Content');
}
