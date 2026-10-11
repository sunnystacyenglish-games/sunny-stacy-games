import {baseEditor,el,action,input,capacity,id,move,preview} from './common.js';
import {imageInput} from './image-input.js';
import {bindCardImages} from './card-image-input.js';
import {iconButton,accordion,toolbar,autoSize,imagePreview} from './controls.js';
import {CONTENT_LIMITS as L} from '../activity/limits.js';
export function mountDeckEditor(options){
 const expanded=new Set(),uploads=new WeakMap();let context;
 const editor=baseEditor(options,c=>{
  context=c;c.space.classList.add('studio-editor');const decks=c.data.decks,total=decks.reduce((n,d)=>n+d.cards.length,0);
  if(!c.services.compactHeader)capacity(c.space,'Card Decks',decks.length,L.cardDecks.decks,'decks');
  const bar=toolbar(decks,expanded,c.draw),grid=el('div','studio-deck-grid');
  bar.append(action('+ Add deck',()=>{if(decks.length>=L.cardDecks.decks)return;const deck={id:id(),name:'New deck',color:'#3f7dcc',cards:[]};decks.push(deck);expanded.add(deck.id);c.changed();c.draw();},decks.length>=L.cardDecks.decks));
  c.space.append(bar,el('p','editor-capacity',`${c.services.compactHeader?'':total+' / 100 cards · '}Maximum 30 cards per deck${decks.length>=5?' · Maximum 5 decks reached':''}`),grid);
  decks.forEach((deck,di)=>{
   const title=el('strong','studio-title',deck.name),{section,summary}=accordion(deck.id,expanded,title),dot=el('span','deck-color-dot');section.classList.add('deck-section');section.dataset.deckId=deck.id;section.style.borderLeftColor=deck.color;dot.style.background=deck.color;summary.prepend(dot);summary.append(el('span','',`${deck.cards.length} / 30`));
   const body=el('div','studio-body'),head=el('div','studio-inline');head.append(input('Deck name',deck.name,v=>{deck.name=v;title.textContent=v;c.changed();}),iconButton('trash','Delete deck',()=>{decks.splice(di,1);c.changed();c.draw();}));
   const colors=el('div','studio-colors'),presets=['#3f7dcc','#65a765','#e4b34e','#dd784d','#ab79bf','#dd7fa6'];
   const selectColor=value=>{deck.color=value;section.style.borderLeftColor=value;dot.style.background=value;for(const b of colors.querySelectorAll('[data-color]'))b.setAttribute('aria-pressed',String(b.dataset.color.toLowerCase()===value.toLowerCase()));c.changed();};
   for(const color of presets){const b=action('',()=>selectColor(color));b.className='studio-swatch';b.style.background=color;b.dataset.color=color;b.title='Color '+color;b.setAttribute('aria-label','Color '+color);b.setAttribute('aria-pressed',String(deck.color.toLowerCase()===color));colors.append(b);}
   const custom=el('label','studio-custom','+'),picker=el('input');picker.type='color';picker.value=deck.color;picker.setAttribute('aria-label','Custom deck color');picker.title='Custom deck color';picker.oninput=()=>selectColor(picker.value);custom.title='Custom deck color';custom.append(picker);colors.append(custom);body.append(head,colors);
   deck.cards.forEach((card,i)=>{
    const row=el('div','deck-card studio-card');row.dataset.cardId=card.id;const arrows=el('div','studio-arrows');
    arrows.append(iconButton('up','Move card up',()=>{move(deck.cards,card,-1);c.changed();c.draw();},i===0),iconButton('down','Move card down',()=>{move(deck.cards,card,1);c.changed();c.draw();},i===deck.cards.length-1));
    const field=input('Card text',card.text,v=>{card.text=v;c.changed();},{area:true});field.classList.add('studio-card-text');autoSize(field.querySelector('textarea'));
    let image;if(card.image){image=action('',()=>imagePreview(card.image,c.services,{alt:card.text||'Card image',remove:()=>{uploads.set(card,(uploads.get(card)||0)+1);delete card.image;c.changed();c.draw();},replace:async file=>{await assign(card,file,true);return card.image;}}));image.className='studio-thumbnail';image.setAttribute('aria-label','Preview card image');image.title='Preview card image';image.append(preview(card.image,c.services,card.text||'Card image'));}
    else{image=imageInput('▧',file=>assign(card,file,true));image.classList.add('editor-icon');image.innerHTML=iconButton('image','Add image',()=>{}).innerHTML;image.setAttribute('aria-label','Add image');image.title='Add image';}
    row.append(arrows,el('span','studio-number','#'+(i+1)),field,image,iconButton('trash','Delete card',()=>{deck.cards.splice(i,1);c.changed();c.draw();}));body.append(row);
   });
   const full=deck.cards.length>=30||total>=100;if(full)body.append(el('p','editor-limit',deck.cards.length>=30?'Maximum 30 cards per deck reached.':'Maximum 100 cards reached.'));
   body.append(action('+ Add card',()=>{if(deck.cards.length>=30||c.data.decks.reduce((n,d)=>n+d.cards.length,0)>=100)return;deck.cards.push({id:id(),text:''});c.changed();c.draw();const target=[...c.space.querySelectorAll('[data-deck-id]')].find(n=>n.dataset.deckId===deck.id);target?.querySelector('.deck-card:last-of-type textarea')?.focus();},full));section.append(body);section.addEventListener('toggle',()=>{if(section.open)for(const t of section.querySelectorAll('textarea'))autoSize(t)();});grid.append(section);
  });
 });
 function assign(card,file,rethrow=false){const version=(uploads.get(card)||0)+1;uploads.set(card,version);return context.work(async()=>{const image=await context.services.upload(file);if(uploads.get(card)===version&&context.data.decks.some(d=>d.cards.includes(card)))card.image=image;},rethrow);}
 const unbind=bindCardImages(options.host,key=>context.data.decks.flatMap(d=>d.cards).find(c=>c.id===key),assign);return {...editor,destroy(){unbind();editor.destroy();}};
}

