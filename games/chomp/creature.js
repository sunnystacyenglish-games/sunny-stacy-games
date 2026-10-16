import {CHARACTERS} from './characters.js';
const ns='http://www.w3.org/2000/svg',svgNode=(tag,attrs={})=>{const n=document.createElementNS(ns,tag);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,v);return n;};
export const characterFor=theme=>CHARACTERS.find(c=>c.theme===theme)||CHARACTERS[0];
// Non-overlapping nearest-tooth cells enlarge touch targets inside the mouth.
export function toothTargets(character){
 const teeth=character.layers.filter(g=>g.tooth),centers=teeth.map(g=>({id:g.id,x:g.x+g.w/2,y:g.y+g.h/2}));
 const left=Math.min(...centers.map(p=>p.x))-45,right=Math.max(...centers.map(p=>p.x))+45,top=Math.min(...centers.map(p=>p.y))-40,bottom=Math.max(...centers.map(p=>p.y))+40;
 return centers.map(a=>{let polygon=[[left,top],[right,top],[right,bottom],[left,bottom]];
  for(const b of centers){if(a===b)continue;const nx=b.x-a.x,ny=b.y-a.y,k=(b.x*b.x+b.y*b.y-a.x*a.x-a.y*a.y)/2,inside=p=>p[0]*nx+p[1]*ny<=k,result=[];
   for(let i=0;i<polygon.length;i++){const p=polygon[i],q=polygon[(i+1)%polygon.length],ip=inside(p),iq=inside(q);if(ip)result.push(p);if(ip!==iq){const t=(k-nx*p[0]-ny*p[1])/(nx*(q[0]-p[0])+ny*(q[1]-p[1]));result.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]);}}polygon=result;
  }return {id:a.id,polygon};
 });
}
export function mountCreature(host,onPress){
 let generation=0,character,open,closed,svg,hits=[],ready=false;
 const url=file=>new URL('assets/'+file,import.meta.url).href;
 function stop(){generation++;host.querySelectorAll('*').forEach(n=>n.getAnimations?.().forEach(a=>a.cancel()));host.classList.remove('chomping');}
 return {
  async load(theme){stop();ready=false;const token=generation;character=characterFor(theme);host.replaceChildren();
   const files=character.layers.map(g=>g.asset||`layer-${CHARACTERS.indexOf(character)}-${g.id}.webp`).concat(character.closed);
   await Promise.all(files.map(async file=>{const image=new Image();image.src=url(file);await image.decode().catch(()=>{throw Error('Character artwork could not load. Please reload before playing.');});}));if(token!==generation)return false;
   svg=svgNode('svg',{viewBox:character.box.join(' '),'aria-label':character.name});open=svgNode('g');closed=svgNode('image',{href:url(character.closed),width:1600,height:900,visibility:'hidden'});
   character.layers.forEach((g,i)=>{const placed=svgNode('g',{transform:`translate(${g.x} ${g.y}) rotate(${g.r} ${g.w/2} ${g.h/2})`}),layer=svgNode('g');if(g.tooth){layer.dataset.tooth=g.id;layer.style.transformOrigin=`0px ${g.h}px`;layer.style.transformBox='view-box';}layer.append(svgNode('image',{href:url(files[i]),width:g.w,height:g.h}));placed.append(layer);open.append(placed);});
   hits=toothTargets(character).map((hit,i)=>{const p=svgNode('polygon',{points:hit.polygon.map(p=>p.join(',')).join(' '),fill:'transparent',role:'button',tabindex:-1,'aria-label':'Tooth '+(i+1),'aria-disabled':'true'});p.dataset.hit=hit.id;p.onfocus=()=>{if(p.matches(':focus-visible'))host.querySelector(`[data-tooth="${hit.id}"]`)?.classList.add('keyboard-focus');};p.onblur=()=>host.querySelector(`[data-tooth="${hit.id}"]`)?.classList.remove('keyboard-focus');p.onclick=()=>{if(ready&&p.getAttribute('aria-disabled')==='false')onPress(hit.id);};p.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();p.onclick();}};open.append(p);return p;});
   svg.append(open,closed);const burst=document.createElement('div');burst.className='burst';burst.setAttribute('aria-hidden','true');burst.innerHTML='<b>CHOMP!</b>';host.append(svg,burst);ready=true;return true;
  },
  update(game){if(!ready)return;for(const hit of hits){const enabled=game.state==='WAIT_FOR_TOOTH'&&!game.used.has(hit.dataset.hit);hit.setAttribute('aria-disabled',String(!enabled));hit.setAttribute('tabindex',enabled?'0':'-1');hit.classList.toggle('available',enabled);if(game.used.has(hit.dataset.hit)){const tooth=host.querySelector(`[data-tooth="${hit.dataset.hit}"]`);tooth.style.transform='scaleY(.30)';hit.setAttribute('aria-label',hit.getAttribute('aria-label').replace(' (pressed)','')+' (pressed)');}}},
  close(){if(!ready)return;open.setAttribute('visibility','hidden');closed.removeAttribute('visibility');host.classList.add('chomping');svg.setAttribute('aria-label',character.name+' — CHOMP!');},
  destroy:stop
 };
}
