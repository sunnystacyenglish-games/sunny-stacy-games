import {themes,normalizeTheme} from '../../shared/themes.js';
let host,current;
export function applyTheme(id){
 const theme=themes.find(t=>t.id===normalizeTheme(id))||themes[0];document.body.dataset.theme=theme.id;
 if(current===theme.id)return;current=theme.id;
 if(!host){host=document.createElement('div');host.className='theme-scenery';host.setAttribute('aria-hidden','true');document.body.prepend(host);}
 host.replaceChildren();
 const layer=name=>{const el=document.createElement('div');el.className=name;host.append(el);return el;};
 if(theme.id==='space'){layer('ss-stars');layer('ss-orbit');}
 if(theme.id==='ocean'){
  const bubbles=layer('ss-bubbles');for(const [x,y,d] of [[3,19,18],[8,27,8],[1,34,11],[90,18,23],[95,30,9],[87,37,12],[94,70,18],[2,73,25]]){const e=document.createElement('i');e.style.cssText=`left:${x}%;top:${y}%;width:${d}px;height:${d}px`;bubbles.append(e);}layer('ss-sand');
 }
 if(theme.id==='magic-school'){
  layer('ss-magic-dust');const stars=layer('ss-magic-stars');for(const [x,y,d] of [[7,23,16],[91,31,13],[4,63,11],[94,69,17],[23,90,10],[74,87,12],[33,8,11],[63,14,9]]){const e=document.createElement('span');e.textContent='✦';e.style.cssText=`left:${x}%;top:${y}%;font-size:${d}px`;stars.append(e);}
 }
 theme.images.forEach((file,i)=>{const img=document.createElement('img');img.className=`theme-decor theme-d${i}`;img.src=new URL('../../shared/theme-assets/'+file,import.meta.url);img.alt='';img.draggable=false;host.append(img);});
}
