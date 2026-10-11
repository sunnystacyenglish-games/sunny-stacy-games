import {el,action,preview} from './common.js';
import {imageInput} from './image-input.js';

const symbols={trash:'♜',image:'▧',up:'▲',down:'▼',copy:'⧉',more:'⋯',plus:'+',close:'×'};
export function iconButton(name,label,fn,disabled=false){
 const button=action(symbols[name]||name,fn,disabled);button.className='editor-icon'+(name==='trash'?' danger':'');
 if(name==='trash')button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
 if(name==='image')button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="8" cy="8" r="2" fill="currentColor"/><path d="m4 18 5-5 3 3 4-6 4 8" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
 button.setAttribute('aria-label',label);button.title=label;return button;
}
export function accordion(key,expanded,title){
 const section=el('details','editor-section studio-accordion'),summary=el('summary','studio-summary');
 section.open=expanded.has(key);section.addEventListener('toggle',()=>{if(!section.isConnected)return;if(section.open)expanded.add(key);else expanded.delete(key);});
 summary.append(title);section.append(summary);return {section,summary};
}
export function toolbar(rows,expanded,draw){const bar=el('div','studio-toolbar');bar.append(action('Expand All',()=>{rows.forEach(x=>expanded.add(x.id));draw();}),action('Collapse All',()=>{expanded.clear();draw();}));return bar;}
const resizers=new WeakMap();
export function autoSize(field){
 if(resizers.has(field))return resizers.get(field);
 field.rows=1;field.classList.add('studio-textarea');
 const resize=()=>{if(!field.isConnected||!field.clientWidth)return;field.style.height='auto';field.style.height=field.scrollHeight+2+'px';};
 let width=-1;const observer=new ResizeObserver(()=>{if(!field.isConnected){observer.disconnect();return;}if(width!==field.clientWidth){width=field.clientWidth;resize();}});observer.observe(field);
 field.addEventListener('input',resize);resizers.set(field,resize);requestAnimationFrame(resize);return resize;
}
export function imagePreview(ref,services,{alt='Image',remove,replace}={}){
 const dialog=el('dialog','studio-image-preview');dialog.setAttribute('aria-label','Image preview');
 const close=iconButton('close','Close image preview',()=>dialog.close()),image=preview(ref,services,alt),actions=el('div','studio-toolbar');close.classList.add('preview-close');
 if(remove){const button=action('Delete Image',()=>{remove();dialog.close();});button.classList.add('danger');actions.append(button);}
 if(replace)actions.append(imageInput('Replace Image',async file=>{const next=await replace(file);if(next)image.src=await services.mediaURL(next);}));
 dialog.append(close,image,actions);dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
 dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();return dialog;
}
