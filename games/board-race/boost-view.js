import {BOOSTS} from './boosts.js';
export function presentBoost({game,dialog,heading,icon,ack,title,onResolve}){
 let choices=dialog.querySelector('.boost-choices');if(!choices){choices=document.createElement('div');choices.className='boost-choices';dialog.append(choices);}choices.replaceChildren();ack.hidden=true;const decision=game.decision(),effect=decision.effect;heading.textContent=BOOSTS.find(b=>b.id===effect)?.name||effect;icon.textContent={forward:'+2',back:'−2',again:'↻',skip:'Ⅱ',switch:'⇄',shield:'🛡',pass:'↗',lucky:'⚄',team:'♧',steal:'↶',shuffle:'⤨',reverse:'←'}[effect];
 const send=choice=>{choices.querySelectorAll('button').forEach(b=>b.disabled=true);onResolve(choice);};
 const button=(text,choice)=>{const b=document.createElement('button');b.textContent=text;b.type='button';b.onclick=typeof choice==='function'?choice:()=>send(choice);choices.append(b);return b;};
 const targets=(base={})=>{choices.replaceChildren();game.eligiblePlayers(effect).forEach(p=>button(title(p.id),{...base,recipient:p.id}));};
 if(decision.kind==='ack'){ack.hidden=false;return;}
 if(decision.kind==='shield'){heading.textContent='Use your shield: '+BOOSTS.find(b=>b.id===effect).name+'?';button('Yes',{use:true});button('No',{use:false});}
 if(decision.kind==='pass'){heading.textContent='Pass '+BOOSTS.find(b=>b.id===effect).name+'?';button('Yes',()=>targets({use:true}));button('No',{use:false});}
 if(decision.kind==='optional'){heading.textContent+='?';button('Use effect',effect==='switch'?()=>targets({use:true}):{use:true});button('No thanks',{use:false});}
 if(decision.kind==='target')targets({use:true});
 if(decision.kind==='acquire'){heading.textContent='Keep '+(effect==='shield'?'Shield':'Pass the Boost')+'?';button('Yes',()=>{if(decision.existing&&decision.existing!==effect){choices.replaceChildren();heading.textContent='Choose one ability to keep';button('Keep '+(decision.existing==='shield'?'Shield':'Pass'),{use:true,keep:'old'});button('Keep '+(effect==='shield'?'Shield':'Pass'),{use:true,keep:'new'});}else send({use:true});});button('No thanks',{use:false});}
}
