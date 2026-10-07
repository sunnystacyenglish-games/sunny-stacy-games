import {PAWN_COLORS,pawnColor} from './activity.js';
import {pawnGraphic} from './pawn.js';
export function mountPawnPicker(host,settings){
 host.replaceChildren();const rows=[];
 const occupied=(hex,index)=>settings.colors.some((value,j)=>j!==index&&j<settings.players&&pawnColor(value)===hex);
 function sync(){rows.forEach((row,i)=>{const hex=pawnColor(settings.colors[i]);row.preview.replaceChildren(pawnGraphic(hex));row.input.value=hex;row.rgb.textContent='RGB '+[1,3,5].map(at=>parseInt(hex.slice(at,at+2),16)).join(', ');row.buttons.forEach(({button,color})=>{button.disabled=occupied(color.hex,i);button.setAttribute('aria-pressed',String(color.hex===hex));});});}
 for(let i=0;i<settings.players;i++){
  const section=document.createElement('section');section.className='pawn-row';const heading=document.createElement('div');heading.className='pawn-heading';const name=document.createElement('strong');name.textContent=settings.names[i];const preview=document.createElement('span');preview.className='pawn-preview';heading.append(name,preview);
  const group=document.createElement('div');group.className='pawn-options';group.setAttribute('role','group');group.setAttribute('aria-label',settings.names[i]+' pawn colour');const buttons=[];
  for(const color of PAWN_COLORS){const button=document.createElement('button');button.type='button';button.className='colour-swatch';button.style.setProperty('--swatch',color.hex);button.setAttribute('aria-label',color.name);button.onclick=()=>{if(occupied(color.hex,i))return;settings.colors[i]=color.id;error.textContent='';sync();};buttons.push({button,color});group.append(button);}
  const label=document.createElement('label');label.className='custom-colour';label.append('Custom colour');const input=document.createElement('input');input.type='color';input.setAttribute('aria-label',settings.names[i]+' custom colour');const rgb=document.createElement('output'),error=document.createElement('span');error.className='pawn-colour-error';error.setAttribute('role','status');label.append(input,rgb);input.oninput=()=>{const hex=input.value.toLowerCase();if(occupied(hex,i)){error.textContent='This colour is already used.';input.value=pawnColor(settings.colors[i]);return;}settings.colors[i]=hex;error.textContent='';sync();};
  section.append(heading,group,label,error);host.append(section);rows.push({preview,input,rgb,buttons});
 }sync();
}
