let serial=0;
export function createWheelPicker({options,value,onChange,label='Choose an option'}){
 const host=document.createElement('div');host.className='wheel-picker';host.tabIndex=0;host.setAttribute('role','listbox');host.setAttribute('aria-label',label);const id='wheel-'+ ++serial;let selected=value,timer,muted=0,drag=null;
 const buttons=options.map((o,i)=>{const b=document.createElement('button');b.type='button';b.className='wheel-option';b.id=id+'-'+i;b.setAttribute('role','option');b.tabIndex=-1;b.textContent=o.label;b.disabled=!!o.disabled;b.onclick=()=>{if(drag?.moved)return;choose(i,true);};host.append(b);return b;});
 const valid=i=>i>=0&&i<options.length&&!options[i].disabled;
 function nearest(i){for(let distance=0;distance<options.length;distance++)for(const n of [i-distance,i+distance])if(valid(n))return n;return -1;}
 function mark(i){buttons.forEach((b,n)=>b.setAttribute('aria-selected',String(n===i)));if(i>=0)host.setAttribute('aria-activedescendant',buttons[i].id);}
 function choose(i,emit){i=nearest(i);if(i<0)return;const changed=selected!==options[i].value;selected=options[i].value;mark(i);muted=performance.now()+250;host.scrollTo({top:i*40,behavior:emit?'smooth':'instant'});if(emit&&changed)onChange(selected);}
 host.addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(()=>{if(drag)return;choose(Math.round(host.scrollTop/40),true);},110);});
 host.onkeydown=e=>{const current=options.findIndex(o=>o.value===selected);let i=current;if(e.key==='ArrowDown')i=current+1;else if(e.key==='ArrowUp')i=current-1;else if(e.key==='Home')i=0;else if(e.key==='End')i=options.length-1;else return;e.preventDefault();if(i<0||i>=options.length)return;const direction=i>=current?1:-1;while(i>=0&&i<options.length&&!valid(i))i+=direction;if(valid(i))choose(i,true);};
 host.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse')return;drag={y:e.clientY,top:host.scrollTop,moved:false};host.setPointerCapture(e.pointerId);});
 host.addEventListener('pointermove',e=>{if(!drag)return;if(Math.abs(e.clientY-drag.y)>4)drag.moved=true;if(drag.moved){e.preventDefault();host.scrollTop=drag.top+drag.y-e.clientY;}});
 host.addEventListener('pointerup',e=>{if(!drag)return;const moved=drag.moved;drag=null;if(host.hasPointerCapture(e.pointerId))host.releasePointerCapture(e.pointerId);if(moved){muted=0;choose(Math.round(host.scrollTop/40),true);host.addEventListener('click',e=>e.stopPropagation(),{once:true,capture:true});}else choose(Math.floor((host.scrollTop+e.clientY-host.getBoundingClientRect().top-40)/40),true);});
 host.addEventListener('pointercancel',()=>{drag=null;});
 return {element:host,setValue(next){selected=next;choose(options.findIndex(o=>o.value===next),false);}};
}
