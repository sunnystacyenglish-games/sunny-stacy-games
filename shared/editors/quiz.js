import {baseEditor,el,action,input,id,move,preview} from './common.js';
import {accordion,iconButton,toolbar} from './controls.js';
import {imageInput} from './image-input.js';

export function mountQuizEditor(options){
 const expanded=new Set();
 return baseEditor(options,c=>{
  c.space.classList.add('studio-editor');const rows=c.data.questions;c.space.append(toolbar(rows,expanded,c.draw));
  const changed=()=>{c.changed();c.draw();};
  function media(owner,label){
   const box=el('div','editor-row');
   if(owner.image)box.append(preview(owner.image,c.services,label),action('Remove image',()=>{delete owner.image;changed();}));
   box.append(imageInput(owner.image?'Replace image':'Add image',file=>c.work(async()=>{owner.image=await c.services.upload(file);},true)));return box;
  }
  for(const [index,q] of rows.entries()){
   const title=el('span','studio-title',`#${index+1} ${q.text||'Question'}`),{section,summary}=accordion(q.id,expanded,title),body=el('div','studio-body');
   const controls=el('span','studio-summary-actions');controls.onclick=e=>e.stopPropagation();
   controls.append(iconButton('up','Move question up',()=>{move(rows,q,-1);changed();},index===0),iconButton('down','Move question down',()=>{move(rows,q,1);changed();},index===rows.length-1),action('Duplicate Question',()=>{const copy=structuredClone(q),ids=new Map(copy.answers.map(a=>[a.id,id()]));copy.id=id();copy.answers.forEach(a=>a.id=ids.get(a.id));copy.correctIds=copy.correctIds.map(key=>ids.get(key));rows.splice(index+1,0,copy);expanded.add(copy.id);changed();}),iconButton('trash','Delete question',()=>{rows.splice(index,1);changed();}));summary.append(controls);
   const label=el('label','editor-field','Question type'),mode=el('select');for(const [key,name] of [['single','Single Choice'],['multiple','Multiple Choice'],['trueFalse','True / False']])mode.append(new Option(name,key));mode.value=q.mode;label.append(mode);
   mode.onchange=async()=>{
    const {confirmDialog}=await import('../ui.js');
    if(mode.value==='trueFalse'&&q.mode!=='trueFalse'&&!await confirmDialog('Switch to True / False?','Existing answer options will be replaced by fixed True / False options.','Replace options')){mode.value=q.mode;return;}
    const previous=q.mode;q.mode=mode.value;
    if(q.mode==='trueFalse'){q.answers=['True','False'].map(text=>({id:id(),text}));q.correctIds=[];}
    else if(previous==='trueFalse'){q.answers=[{id:id(),text:''},{id:id(),text:''}];q.correctIds=[];}
    else if(q.mode==='single'&&q.correctIds.length>1)q.correctIds=[];
    changed();
   };
   body.append(label,input('Question',q.text,value=>{q.text=value;title.textContent=`#${index+1} ${value||'Question'}`;c.changed();},{area:true}),media(q,'Question image'));
   for(const [answerIndex,a] of q.answers.entries()){
    const row=el('section','quiz-editor-answer'),key=el('label','editor-field','Correct answer'),mark=el('input');mark.type=q.mode==='multiple'?'checkbox':'radio';mark.name='key-'+q.id;mark.checked=q.correctIds.includes(a.id);mark.setAttribute('aria-label','Correct answer '+(answerIndex+1));key.append(mark);
    mark.onchange=()=>{q.correctIds=q.mode==='multiple'?(mark.checked?[...q.correctIds,a.id]:q.correctIds.filter(v=>v!==a.id)):[a.id];c.changed();};
    row.append(key);
    if(q.mode==='trueFalse')row.append(el('p','',a.text));
    else row.append(input('Answer '+(answerIndex+1),a.text,v=>{a.text=v;c.changed();},{area:true}),media(a,'Answer image'),action('Remove answer',()=>{q.answers.splice(answerIndex,1);q.correctIds=q.correctIds.filter(v=>v!==a.id);changed();},q.answers.length<=2));
    body.append(row);
   }
   if(q.mode!=='trueFalse')body.append(action('+ Add answer',()=>{q.answers.push({id:id(),text:''});changed();},q.answers.length>=8));
   section.append(body);c.space.append(section);
  }
  c.space.append(action('+ Add Question',()=>{const q={id:id(),mode:'single',text:'',answers:[{id:id(),text:''},{id:id(),text:''}],correctIds:[]};rows.push(q);expanded.add(q.id);changed();}));
 });
}
