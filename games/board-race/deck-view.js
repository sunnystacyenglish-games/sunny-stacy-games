import {deckComposition} from './decks.js';
import {activityAssets} from '../../shared/activity/repository.js';
import {playWrong} from '../../shared/audio.js';
import {contrastInk} from './track-palette.js';
export function createDeckView({board,sound,onDraw,onContinue}){
 const host=document.createElement('div');host.className='race-decks';board.append(host);const dialog=document.createElement('dialog');dialog.className='race-card-dialog';dialog.setAttribute('aria-label','Deck card');document.body.append(dialog);let buttons=new Map(),animations=[],epoch=0;
 dialog.addEventListener('cancel',e=>e.preventDefault());
 function cancel(){epoch++;for(const a of animations)a.cancel();animations=[];dialog.close();host.replaceChildren();}
 function render(decks,center,required){host.style.cssText=`left:${center.x}px;top:${center.y}px;width:${center.width}px;height:${center.height}px`;const {positions,width,height}=deckComposition(decks.length,center.width,center.height);host.replaceChildren();buttons.clear();decks.forEach((entry,i)=>{const button=document.createElement('button');button.type='button';button.className='race-deck'+(required===entry.key?' required':'');button.textContent=entry.deck.name;button.setAttribute('aria-label',`Deck ${i+1}: ${entry.deck.name}`);button.style.cssText=`left:${positions[i][0]}px;top:${positions[i][1]}px;width:${width}px;height:${height}px;--deck-color:${entry.deck.color};color:${contrastInk(entry.deck.color)}`;button.onclick=()=>onDraw(entry.key,button);buttons.set(entry.key,button);host.append(button);});}
 function deny(button){button.getAnimations().forEach(a=>a.cancel());button.animate([{translate:'0px'},{translate:'-5px'},{translate:'5px'},{translate:'-3px'},{translate:'0px'}],{duration:300});playWrong(sound());}
 async function travel(key,returning=false){
  const token=epoch,button=buttons.get(key);if(!button)return false;
  const a=button.getBoundingClientRect(),b=dialog.getBoundingClientRect(),dx=a.x+a.width/2-b.x-b.width/2,dy=a.y+a.height/2-b.y-b.height/2,sx=a.width/b.width,sy=a.height/b.height;
  const at=(x,y,xs,ys,angle=0)=>`translate(${x}px,${y}px) scale(${xs},${ys}) rotateY(${angle}deg)`;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches,duration=reduced?120:returning?650:1100;
  const frames=reduced?[{opacity:returning?1:0},{opacity:returning?0:1}]:returning?
   [{transform:at(0,0,1,1),opacity:1},{transform:at(dx,dy-24,sx,sy),opacity:1,offset:.8},{transform:at(dx,dy,sx,sy),opacity:0}]:
   [{transform:at(dx,dy,sx,sy,180),offset:0},{transform:at(dx,dy-24,sx,sy,180),offset:.18},{transform:at(dx*.65,dy*.65-24,sx,sy,180),offset:.36},{transform:at(dx*.5,dy*.5,sx,sy,90),offset:.5},{transform:at(dx*.35,dy*.35,sx,sy,0),offset:.64},{transform:at(0,0,1,1),offset:1}];
  const front=dialog.querySelector('.race-card-front'),back=dialog.querySelector('.race-card-back');
  back.style.fontSize=(parseFloat(getComputedStyle(button).fontSize)/sx)+'px';back.style.transform=`rotateY(180deg) scaleY(${sx/sy})`;front.style.opacity=returning||reduced?'1':'0';back.style.opacity=returning||reduced?'0':'1';
  const animation=dialog.animate(frames,{duration,easing:'ease-in-out',fill:'both'}),faces=[];
  if(!returning&&!reduced){faces.push(front.animate([{opacity:0},{opacity:0,offset:.499},{opacity:1,offset:.5},{opacity:1}],{duration,fill:'both'}),back.animate([{opacity:1},{opacity:1,offset:.499},{opacity:0,offset:.5},{opacity:0}],{duration,fill:'both'}));}
  animations.push(animation,...faces);try{await animation.finished;}catch{return false;}
  front.style.opacity='1';back.style.opacity='0';animation.cancel();faces.forEach(a=>a.cancel());animations=animations.filter(a=>a!==animation&&!faces.includes(a));return token===epoch;
 }
 function fitText(){const p=dialog.querySelector('p');if(!p)return;const front=dialog.querySelector('.race-card-front');let low=20,high=54;const available=Math.max(80,innerHeight-180-(front.querySelector('img')?.getBoundingClientRect().height||0));for(let i=0;i<9;i++){const middle=(low+high)/2;p.style.fontSize=middle+'px';if(p.scrollHeight>available||p.scrollWidth>p.clientWidth+1)high=middle;else low=middle;}p.style.fontSize=low+'px';}
 let resizeFrame=0;const resize=()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{if(dialog.open)fitText();});};addEventListener('resize',resize);
 async function open(draw){const token=++epoch;dialog.style.setProperty('--deck-color',draw.deck.deck.color);dialog.style.setProperty('--card-ink',contrastInk(draw.deck.deck.color));const front=document.createElement('div');front.className='race-card-front';const heading=document.createElement('h2');heading.textContent=draw.deck.deck.name;front.append(heading);if(draw.card.image){const image=document.createElement('img');image.alt='';image.src=await activityAssets.mediaURL(draw.card.image);await image.decode().catch(()=>{throw Error('This card image could not load. Check its source.');});front.append(image);}if(draw.card.text){const text=document.createElement('p');text.textContent=draw.card.text;front.append(text);}const done=document.createElement('button');done.className='primary';done.textContent='Done / Continue';done.disabled=true;done.onclick=()=>{done.disabled=true;onContinue();};front.append(done);const back=document.createElement('div');back.className='race-card-back';back.setAttribute('aria-hidden','true');back.textContent=draw.deck.deck.name;back.style.color=contrastInk(draw.deck.deck.color);if(token!==epoch)return false;dialog.replaceChildren(front,back);dialog.showModal();fitText();const ok=await travel(draw.deck.key);if(ok)done.disabled=false;return ok;}
 return {render,deny,open,async close(key){const ok=await travel(key,true);if(ok)dialog.close();return ok;},cancel,destroy(){removeEventListener('resize',resize);cancelAnimationFrame(resizeFrame);cancel();host.remove();dialog.remove();}};
}
