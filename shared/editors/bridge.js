import {baseEditor,el,action,input,capacity,id} from './common.js';
import {iconButton,accordion,toolbar,autoSize} from './controls.js';
import {reconcileLines} from './lines.js';
import {CONTENT_LIMITS as L} from '../activity/limits.js';
export function mountBridgeEditor(options){const expanded=new Set();return baseEditor(options,c=>{
 c.space.classList.add('studio-editor');const rows=c.data.bridges;if(!c.services.compactHeader)capacity(c.space,'Bridges',rows.length,L.bridge.bridges);c.space.append(toolbar(rows,expanded,c.draw));
 rows.forEach((b,bi)=>{
  const title=el('span','studio-title'),updateTitle=()=>title.textContent=`#${bi+1} ${b.bricks.map(x=>x.text).join(' ')}`;updateTitle();const {section,summary}=accordion(b.id,expanded,title),remove=iconButton('trash','Delete bridge',e=>{e.stopPropagation();rows.splice(bi,1);c.changed();c.draw();});summary.append(remove);
  const body=el('div','studio-body bridge-columns'),right=el('div','bridge-live'),blocks=el('div','bridge-blocks');let selected=null;
  const field=input('Sentence · Enter divides blocks',b.bricks.map(x=>x.text).join('\n'),value=>{b.bricks=reconcileLines(b.bricks,value,id);b.gaps=b.gaps.filter(g=>b.bricks.some(x=>x.id===g.brickId));updateTitle();c.changed();drawBlocks();},{area:true});autoSize(field.querySelector('textarea'));body.append(field,right);right.append(blocks);
  function drawBlocks(){blocks.replaceChildren();right.querySelector('.gap-panel')?.remove();b.bricks.forEach(brick=>{
   const gap=b.gaps.find(g=>g.brickId===brick.id),button=action(brick.text||'…',()=>{
    let active=b.gaps.find(g=>g.brickId===brick.id);if(!active){if(b.gaps.length>=L.bridge.gapsPerBridge)return;const group={id:id(),distractors:[]};b.groups.push(group);active={id:id(),brickId:brick.id,groupId:group.id};b.gaps.push(active);c.changed();}selected=active.id;drawBlocks();
   },!gap&&b.gaps.length>=L.bridge.gapsPerBridge);button.className='bridge-block'+(gap?' is-gap':'');button.setAttribute('aria-pressed',String(!!gap));button.title=gap?'Edit gap':'Select gap';button.dataset.brickId=brick.id;blocks.append(button);
  });const gap=b.gaps.find(g=>g.id===selected);if(gap)drawGap(gap);}
  function drawGap(gap){
   const group=b.groups.find(g=>g.id===gap.groupId),panel=el('div','gap-panel studio-gap'),head=el('div','studio-inline');head.append(el('strong','',b.bricks.find(x=>x.id===gap.brickId)?.text),iconButton('close','Close distractors',()=>{selected=null;drawBlocks();}));panel.append(head);
   const field=input('Distractors · Enter divides answers',group.distractors.map(d=>d.text).join('\n'),value=>{group.distractors=value===''?[]:reconcileLines(group.distractors,value,id);c.changed();},{area:true});autoSize(field.querySelector('textarea'));panel.append(field);
   const label=el('label','editor-field','Answer group'),select=el('select');b.groups.forEach((g,n)=>select.append(new Option('Group '+(n+1),g.id)));select.append(new Option('+ New group','new'));select.value=gap.groupId;select.onchange=()=>{if(select.value==='new'){const g={id:id(),distractors:[]};b.groups.push(g);gap.groupId=g.id;}else gap.groupId=select.value;c.changed();drawBlocks();};label.append(select);panel.append(label,action('Remove Gap',()=>{b.gaps=b.gaps.filter(g=>g.id!==gap.id);selected=null;c.changed();drawBlocks();}));right.append(panel);
  }
  drawBlocks();section.append(body);section.addEventListener('toggle',()=>{if(section.open)autoSize(field.querySelector('textarea'))();});c.space.append(section);
 });
 c.space.append(action('+ Add bridge',()=>{if(rows.length>=L.bridge.bridges)return;const b={id:id(),bricks:[{id:id(),text:''}],gaps:[],groups:[]};rows.push(b);expanded.add(b.id);c.changed();c.draw();c.space.querySelector('.studio-accordion:last-of-type textarea')?.focus();},rows.length>=L.bridge.bridges));if(rows.length>=20)c.space.append(el('p','editor-limit','Maximum 20 bridges reached.'));
});}
