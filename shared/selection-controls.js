import {createWheelPicker} from './wheel-picker.js';
const controls=new Map();
function enhance(select){if(select.multiple||select.closest('.unified-setup,#missingSet,#missing')||!select.options.length)return;let entry=controls.get(select);const options=[...select.options].map(o=>({value:o.value,label:o.textContent,disabled:o.disabled||select.disabled}));const signature=JSON.stringify(options),theme=/theme/i.test(select.name||select.id),label=select.getAttribute('aria-label')||select.closest('label')?.firstChild?.textContent?.trim()||'Choose an option';
 if(!entry||entry.signature!==signature){entry?.host.remove();const change=value=>{select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}));refresh();};let widget;
 if(options.length>4&&!theme)widget=createWheelPicker({options,value:select.value,onChange:change,label});
 else{const host=document.createElement('div');host.className='option-buttons'+(theme?' theme-options':'');host.setAttribute('role','group');host.setAttribute('aria-label',label);for(const o of options){const b=document.createElement('button');b.type='button';b.textContent=o.label;b.dataset.value=o.value;b.disabled=o.disabled;b.onclick=()=>change(o.value);if(theme)b.dataset.themeOption=o.value;host.append(b);}widget={element:host,setValue:value=>{for(const b of host.children)b.setAttribute('aria-pressed',String(b.dataset.value===value));}};}
 select.hidden=true;select.tabIndex=-1;select.setAttribute('aria-hidden','true');select.after(widget.element);entry={host:widget.element,widget,signature};controls.set(select,entry);}
 entry.widget.setValue(select.value);
}
function refresh(){for(const select of document.querySelectorAll('dialog[open] select,#grammar select'))enhance(select);for(const [select,entry] of controls)if(!select.isConnected){entry.host.remove();controls.delete(select);}}
let pending;function schedule(){if(pending)return;pending=requestAnimationFrame(()=>{pending=0;refresh();});}
new MutationObserver(records=>{if(records.some(r=>r.type==='attributes'||[...r.addedNodes].some(n=>n.nodeType===1&&(n.matches('dialog,select,option')||n.querySelector?.('dialog,select')))))schedule();}).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['open','disabled']});
document.addEventListener('change',schedule);document.addEventListener('toggle',schedule,true);schedule();
