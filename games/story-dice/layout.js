// Square cells are fitted to both dimensions; content is measured inside each cell.
export function layoutDice(table){
 const nodes=[...table.querySelectorAll('.die')];if(!nodes.length)return;
 const width=table.clientWidth-12,height=table.clientHeight-12;if(width<=0||height<=0)return;
 const gap=6;let best;
 for(let columns=1;columns<=nodes.length;columns++){
  const rows=Math.ceil(nodes.length/columns),side=Math.floor(Math.min((width-gap*(columns-1))/columns,(height-gap*(rows-1))/rows,360));
  if(!best||side>best.side)best={columns,rows,side};
 }
 const {columns,rows,side}=best,metadata=side>=180?30:side>=95?23:16,padding=side>=180?10:side<85?2:4,contentHeight=Math.max(1,side-metadata-padding-4),contentWidth=Math.max(1,side-padding*2-2),wanted=Math.min(30,Math.max(11,Math.round(side*.085))),minFont=side<85?7:11;
 const measure=document.createElement('div');measure.className='dice-measure';document.body.append(measure);
 table.dataset.fit='ok';table.style.overflowY='hidden';
 const totalHeight=rows*side+(rows-1)*gap;let y=6+(height-totalHeight)/2;
 for(let row=0;row<rows;row++){
  const members=nodes.slice(row*columns,(row+1)*columns),rowWidth=members.length*side+(members.length-1)*gap;
  members.forEach((node,column)=>{
   const label=node.querySelector('.die-label').cloneNode(true);label.style.width=contentWidth+'px';label.style.lineHeight=side<85?'1.05':'1.15';measure.replaceChildren(label);let font=wanted,labelHeight;
   for(;font>=minFont;font-=.5){label.style.setProperty('font-size',font+'px','important');labelHeight=Math.ceil(label.getBoundingClientRect().height);if(labelHeight+Math.min(24,side*.18)+3<=contentHeight)break;}
   font=Math.max(minFont,font);label.style.setProperty('font-size',font+'px','important');labelHeight=Math.ceil(label.getBoundingClientRect().height);
   // Vocabulary takes priority over surplus image whitespace on crowded tables.
   const image=Math.max(0,Math.min(side*.64,contentHeight-labelHeight-3));
   node.style.left=(6+(width-rowWidth)/2+column*(side+gap))+'px';node.style.top=y+'px';node.style.width=side+'px';node.style.height=side+'px';
   node.style.setProperty('--label-size',font+'px');node.style.setProperty('--label-leading',side<85?'1.05':'1.15');node.style.setProperty('--meta-font',side<85?'6px':side<180?'8px':'10px');node.style.setProperty('--face',image+'px');node.style.setProperty('--label-width',contentWidth+'px');node.style.setProperty('--metadata-height',metadata+'px');node.style.setProperty('--die-padding',padding+'px');node.style.setProperty('--entry',Math.max(25,table.clientHeight-y-side)+'px');
  });y+=side+gap;
 }
 measure.remove();
}
