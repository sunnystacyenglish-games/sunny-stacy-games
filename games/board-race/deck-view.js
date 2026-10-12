import {concealedCardPart,normalizeDeckBlur} from './deck-blur.js';
import {revealTask} from '../../shared/concept-blur.js';
import {deckComposition} from './decks.js';
import {cardContent} from '../../shared/tasks/card.js';
import {playWrong} from '../../shared/audio.js';
import {contrastInk} from './track-palette.js';
export function createDeckView({board,sound,blur=()=>({}),onDraw,onContinue}){
 const host=document.createElement('div');host.className='race-decks';board.append(host);const dialog=document.createElement('dialog');dialog.className='race-card-dialog';dialog.setAttribute('aria-label','Deck card');document.body.append(dialog);let buttons=new Map(),animations=[],epoch=0,layoutKey='',travelling=false,pendingLayout=null;
 const names=document.createElement('details');names.className='deck-names';const summary=document.createElement('summary');summary.textContent='Deck names';names.append(summary);board.parentElement.after(names);names.hidden=true;
 dialog.addEventListener('cancel',e=>e.preventDefault());
 function cancel(){epoch++;travelling=false;pendingLayout=null;layoutKey='';names.hidden=true;for(const a of animations)a.cancel();animations=[];dialog.close();host.replaceChildren();}
 function render(decks,center,required){
  if(travelling){pendingLayout=[decks,center,required];return;}
  const key=JSON.stringify([center,decks.map(d=>[d.key,d.deck.name,d.deck.color])]);
  if(key!==layoutKey){layoutKey=key;host.style.cssText=`left:${center.x}px;top:${center.y}px;width:${center.width}px;height:${center.height}px`;
   const {positions,width,height}=deckComposition(decks.length,center.width,center.height);host.replaceChildren();buttons.clear();names.replaceChildren(summary);names.hidden=false;
   decks.forEach((entry,i)=>{const button=document.createElement('button'),label=document.createElement('span');button.type='button';button.className='race-deck';label.textContent=entry.deck.name;button.append(label);button.setAttribute('aria-label',`Deck ${i+1}: ${entry.deck.name}`);button.style.cssText=`left:${positions[i][0]}px;top:${positions[i][1]}px;width:${width}px;height:${height}px;--deck-color:${entry.deck.color};color:${contrastInk(entry.deck.color)};font-size:${Math.max(13,Math.min(32,width*.16))}px`;
    button.onclick=()=>onDraw(entry.key,button);buttons.set(entry.key,button);host.append(button);
    const full=document.createElement('p');full.textContent=entry.deck.name;names.append(full);
   });
  }
  for(const [key,button] of buttons)button.classList.toggle('required',key===required);
 }
 function deny(button){button.getAnimations().forEach(a=>a.cancel());button.animate([{translate:'0px'},{translate:'-5px'},{translate:'5px'},{translate:'-3px'},{translate:'0px'}],{duration:300});playWrong(sound());}
 async function travel(key,returning=false){
  const token=epoch,button=buttons.get(key);if(!button)return false;travelling=true;
  const a=button.getBoundingClientRect(),b=dialog.getBoundingClientRect(),dx=a.x+a.width/2-b.x-b.width/2,dy=a.y+a.height/2-b.y-b.height/2,sx=a.width/b.width,sy=a.height/b.height;
  const at=(x,y,xs,ys,angle=0)=>`translate(${x}px,${y}px) scale(${xs},${ys}) rotateY(${angle}deg)`;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,duration=reduced?120:returning?650:1100;
  const frames=reduced?[{opacity:returning?1:0},{opacity:returning?0:1}]:returning?
   [{transform:at(0,0,1,1),opacity:1},{transform:at(dx,dy-24,sx,sy),opacity:1,offset:.8},{transform:at(dx,dy,sx,sy),opacity:0}]:
   [{transform:at(dx,dy,sx,sy,180),offset:0},{transform:at(dx,dy-24,sx,sy,180),offset:.18},{transform:at(dx*.65,dy*.65-24,sx,sy,180),offset:.36},{transform:at(dx*.5,dy*.5,sx,sy,90),offset:.5},{transform:at(dx*.35,dy*.35,sx,sy,0),offset:.64},{transform:at(0,0,1,1),offset:1}];
  const front=dialog.querySelector('.race-card-front'),back=dialog.querySelector('.race-card-back');
  back.style.display=returning?'none':'grid';back.style.fontSize=(parseFloat(getComputedStyle(button).fontSize)/sx)+'px';back.style.transform=`rotateY(180deg) scaleY(${sx/sy})`;front.style.opacity=returning||reduced?'1':'0';back.style.opacity=returning||reduced?'0':'1';
  const animation=dialog.animate(frames,{duration,easing:'ease-in-out',fill:'both'}),faces=[];
  if(!returning&&!reduced){faces.push(front.animate([{opacity:0},{opacity:0,offset:.499},{opacity:1,offset:.5},{opacity:1}],{duration,fill:'both'}),back.animate([{opacity:1},{opacity:1,offset:.499},{opacity:0,offset:.5},{opacity:0}],{duration,fill:'both'}));}
  animations.push(animation,...faces);try{await animation.finished;}catch{return false;}
  front.style.opacity='1';back.style.opacity='0';back.style.transform='none';back.style.display='none';animation.cancel();faces.forEach(a=>a.cancel());animations=animations.filter(a=>a!==animation&&!faces.includes(a));travelling=false;if(pendingLayout){const next=pendingLayout;pendingLayout=null;render(...next);}return token===epoch;
 }
 function fitText(){const p=dialog.querySelector('.race-card-body p');if(!p)return;const length=p.textContent.length;p.style.fontSize=Math.max(22,Math.min(length<60?44:length<200?34:26,innerWidth*.07))+'px';}
 let resizeFrame=0;const resize=()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{if(dialog.open)fitText();});};addEventListener('resize',resize);
 async function open(draw){
  const token=++epoch;dialog.style.setProperty('--deck-color',draw.deck.deck.color);dialog.style.setProperty('--card-ink',contrastInk(draw.deck.deck.color));
  const front=document.createElement('div');front.className='race-card-front';const heading=document.createElement('h2');heading.textContent=draw.deck.deck.name;front.append(heading);
  const body=document.createElement('div');body.className='race-card-body';body.append(await cardContent(draw.card));body.dataset.kind=draw.card.image?(draw.card.text?'mixed':'image'):'text';front.append(body);
  const footer=document.createElement('div');footer.className='race-card-actions';const part=concealedCardPart(draw.card,normalizeDeckBlur(blur()?.[draw.deck.key]));let revealed=!part,ready=false;
  const done=document.createElement('button');done.className='primary';done.textContent='Done / Continue';done.disabled=true;done.onclick=()=>{if(!ready||!revealed||done.disabled)return;done.disabled=true;onContinue();};
  if(part){const concealed=body.querySelector(part==='text'?'p':'img');concealed.classList.add('concealed-answer');concealed.setAttribute('aria-hidden','true');concealed.inert=true;
   const line=document.createElement('div');line.className='card-reveal-line';const reveal=document.createElement('button');reveal.type='button';reveal.textContent='◉ Reveal Answer';reveal.disabled=true;
   reveal.onclick=()=>{if(!ready||revealed)return;revealTask(dialog);revealed=true;const status=document.createElement('span');status.textContent='Revealed';status.setAttribute('role','status');line.replaceChildren(status);done.disabled=false;done.focus({preventScroll:true});};line.append(reveal);footer.append(line);
  }
  footer.append(done);front.append(footer);const back=document.createElement('div');back.className='race-card-back';back.setAttribute('aria-hidden','true');back.textContent=draw.deck.deck.name;back.style.color=contrastInk(draw.deck.deck.color);
  if(token!==epoch)return false;dialog.replaceChildren(front,back);dialog.showModal();fitText();const ok=await travel(draw.deck.key);if(ok){ready=true;done.disabled=!revealed;const reveal=footer.querySelector('.card-reveal-line button');if(reveal)reveal.disabled=false;}return ok;
 }
 return {render,deny,open,async close(key){const ok=await travel(key,true);if(ok)dialog.close();return ok;},cancel,destroy(){removeEventListener('resize',resize);cancelAnimationFrame(resizeFrame);cancel();host.remove();names.remove();dialog.remove();}};
}


