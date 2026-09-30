// Measure vocabulary at its normal font size; only the illustrated face scales.
export function layoutDice(table){
 const nodes=[...table.querySelectorAll('.die')];if(!nodes.length)return;
 const width=table.clientWidth-16,height=table.clientHeight-16;if(width<=0||height<=0)return;
 const gap=6,measure=document.createElement('div');measure.className='dice-measure';document.body.append(measure);
 const cache=new Map();const compact=innerHeight<=500?12:innerWidth<=600?13:15;let labelSize=compact;
 function textHeight(node,selector,w){const source=node.querySelector(selector),key=selector+'|'+source.textContent+'|'+w+'|'+labelSize;if(cache.has(key))return cache.get(key);if(!source.textContent)return 0;const copy=source.cloneNode(true);copy.style.width=w+'px';if(selector==='.die-label')copy.style.setProperty('font-size',labelSize+'px','important');measure.replaceChildren(copy);const h=Math.ceil(copy.getBoundingClientRect().height);cache.set(key,h);return h;}
 let best,fallback;
 for(let columns=1;columns<=Math.min(nodes.length,Math.floor(width/76));columns++){
  const cellWidth=Math.floor((width-gap*(columns-1))/columns),labelWidth=Math.min(190,cellWidth-10),rows=Math.ceil(nodes.length/columns),overheads=[];
  for(let r=0;r<rows;r++){let category=0,label=0;for(const node of nodes.slice(r*columns,(r+1)*columns)){category=Math.max(category,textHeight(node,'.die-category',labelWidth));label=Math.max(label,textHeight(node,'.die-label',labelWidth));}overheads.push({category,label,total:category+label+18});}
  const room=(height-gap*(rows-1)-overheads.reduce((sum,v)=>sum+v.total,0))/rows;
  const face=Math.floor(Math.min(cellWidth-10,room,260/Math.pow(nodes.length,.16)));
  const minimumHeight=overheads.reduce((sum,v)=>sum+v.total+24,0)+gap*(rows-1);
  if(!fallback||minimumHeight<fallback.minimumHeight)fallback={columns,cellWidth,rows,face:24,overheads,minimumHeight};
  if(room<24||face<12)continue;
  // Maximise actual die size, without shrinking or scaling the vocabulary.
  if(!best||face>best.face)best={columns,cellWidth,rows,face,overheads};
 }
 const constrained=!best;if(!best)best=fallback;if(!best){measure.remove();return;}table.dataset.fit=constrained?'constrained':'ok';table.style.overflowY=constrained?'auto':'hidden';
 // Enlarge the words only in spare room; never sacrifice the chosen face size.
 const wanted=Math.min(28,compact+Math.max(0,(best.face-55)*.075));
 for(let size=Math.floor(wanted);size>=compact;size--){labelSize=size;const overheads=[];for(let r=0;r<best.rows;r++){let category=0,label=0;for(const node of nodes.slice(r*best.columns,(r+1)*best.columns)){category=Math.max(category,textHeight(node,'.die-category',Math.min(190,best.cellWidth-10)));label=Math.max(label,textHeight(node,'.die-label',Math.min(190,best.cellWidth-10)));}overheads.push({category,label,total:category+label+18});}if(overheads.reduce((sum,v)=>sum+v.total+Math.max(best.face,24),0)+gap*(best.rows-1)<=height){best.overheads=overheads;break;}}
 measure.remove();
 best.cellWidth=Math.min(best.cellWidth,Math.max(best.face+10,200));
 const {columns,cellWidth,face,overheads}=best;
 const totalHeight=overheads.reduce((sum,v)=>sum+v.total+Math.max(face,24),0)+gap*(best.rows-1);
 let y=8+Math.max(0,(height-totalHeight)/2);
 for(let r=0;r<best.rows;r++){
  const row=nodes.slice(r*columns,(r+1)*columns),h=overheads[r].total+Math.max(face,24),rowWidth=row.length*cellWidth+(row.length-1)*gap;
  row.forEach((node,c)=>{node.style.left=(8+(width-rowWidth)/2+c*(cellWidth+gap))+'px';node.style.top=y+'px';node.style.width=cellWidth+'px';node.style.height=h+'px';node.style.setProperty('--label-size',labelSize+'px');node.style.setProperty('--face',face+'px');node.style.setProperty('--label-width',Math.min(190,cellWidth-10)+'px');node.style.setProperty('--category-height',overheads[r].category+'px');node.style.setProperty('--entry',Math.max(25,table.clientHeight-y-h)+'px');});
  y+=h+gap;
 }
}

