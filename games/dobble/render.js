import {sizeProfile} from './sizing.js';
import {createBody,stepBodies} from './motion.js';
function imageSource(image) {
  const source=typeof image==='object'?image.src:image;
  if(typeof source!=='string')return null;
  return /^(https?:|data:image\/|blob:|\.\.?\/|\/)/.test(source)?source:null;
}
export function renderRepresentation(container,item) {
  if(item.representation==='word'){container.textContent=item.concept.word;return;}
  const source=imageSource(item.concept.image);
  if(source){const img=document.createElement('img');img.src=source;img.alt=item.concept.word;img.referrerPolicy='no-referrer';img.draggable=false;img.addEventListener('error',()=>{container.textContent='⚠';container.title='Image unavailable. Replace it in My Sets.';},{once:true});container.append(img);}
  else container.textContent=typeof item.concept.image==='string'?item.concept.image:'?';
}
// Start apart; moving items can then explore the whole card.
import {createLayout,placeBodies} from './layout.js';
export function mountCards(host,round,settings,onAnswer) {
  host.replaceChildren();host.dataset.count=round.cards.length;
  const groups=[];const observers=[];
  round.cards.forEach((items,cardIndex)=>{
    const card=document.createElement('div');card.className='card';card.setAttribute('role','group');card.setAttribute('aria-label',`Card ${cardIndex+1}`);host.append(card);
    const layout=createLayout(items.length,Math.random,items.map(item=>item.representation));const movers=[];groups.push(movers);
    const entries=items.map((item,index)=>{
      const button=document.createElement('button');const position=layout[index];
      button.className=`item ${item.representation}`;button.dataset.id=item.concept.id;button.dataset.representation=item.representation;button.setAttribute('aria-label',item.concept.word);
      button.dataset.scale=position.scale;button.style.setProperty('--angle',`${position.rotation}deg`);renderRepresentation(button,item);
      button.addEventListener('click',()=>onAnswer(item.concept.id,button));card.append(button);
      const body=createBody(position,item.representation);const entry={button,position,item,body};movers.push(entry);return entry;
    });
    let previousWidth=0;const placementSeed=Math.floor(Math.random()*4294967296);
    function size(){
      const width=card.clientWidth;if(!width)return;
      for(const {button,position,item,body} of entries){
        if(previousWidth&&previousWidth!==width){body.x=position.x;body.y=position.y;}
        const profile=sizeProfile(items.length,position.scale);const word=item.representation==='word';let font=width*(word?profile.font:profile.image/1.05);
        button.style.fontSize=`${font}px`;
        let visualWidth,visualHeight;
        if(word){
          let measured=measureText(item.concept.word,getComputedStyle(button));const limit=width*profile.wordWidth;
          if(measured>limit){font*=limit/measured;button.style.fontSize=`${font}px`;measured=limit;}
          visualWidth=measured;visualHeight=font*1.08;
        }else if(typeof item.concept.image==='object'){
          const image=item.concept.image,ratio=(image.width||1)/(image.height||1),max=width*profile.image;
          visualWidth=ratio>=1?max:max*ratio;visualHeight=ratio>=1?max/ratio:max;
        }else{
          visualWidth=measureText(item.concept.image,getComputedStyle(button));const limit=width*profile.image;
          if(visualWidth>limit){font*=limit/visualWidth;button.style.fontSize=`${font}px`;visualWidth=limit;}
          visualHeight=font*1.05;
        }
        button.style.width=`${visualWidth}px`;button.style.height=`${visualHeight}px`;
        button.style.left=`${body.x*100}%`;button.style.top=`${body.y*100}%`;
        const angle=position.rotation*Math.PI/180;
        body.halfWidth=(Math.abs(Math.cos(angle))*visualWidth+Math.abs(Math.sin(angle))*visualHeight)/width/2+.25/width;
        body.halfHeight=(Math.abs(Math.sin(angle))*visualWidth+Math.abs(Math.cos(angle))*visualHeight)/width/2+.25/width;
      }
      if(previousWidth!==width){
        let seed=placementSeed;const random=()=>((seed=(1664525*seed+1013904223)>>>0)/4294967296);
        placeBodies(entries.map(entry=>entry.body),random);
        for(const {button,body,position} of entries){position.x=body.x;position.y=body.y;button.style.left=`${body.x*100}%`;button.style.top=`${body.y*100}%`;}
      }
      previousWidth=width;
    }
    size();const observer=new ResizeObserver(size);observer.observe(card);observers.push(observer);
  });
  let frame=0,stopped=false;
  const speed={slow:.07,medium:.13,fast:.275}[settings.movement];
  let last=performance.now();
  function tick(now){
    if(stopped)return;
    const elapsed=(now-last)/1000;last=now;
    for(const movers of groups){
      stepBodies(movers.map(mover=>mover.body),elapsed,speed);
      for(const {button,body} of movers){button.style.left=`${body.x*100}%`;button.style.top=`${body.y*100}%`;}
    }
    frame=requestAnimationFrame(tick);
  }
  if(speed)frame=requestAnimationFrame(tick);
  return {stop(){stopped=true;cancelAnimationFrame(frame);},destroy(){stopped=true;cancelAnimationFrame(frame);observers.forEach(observer=>observer.disconnect());}};
}
const canvas=document.createElement('canvas');
function measureText(text,style){const context=canvas.getContext('2d');context.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;return context.measureText(text).width;}
