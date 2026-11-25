import {baseEditor,el,action,input,id,move,preview} from './common.js';
import {iconButton,autoSize,imagePreview} from './controls.js';
import {imageInput} from './image-input.js';
import {validateQuiz} from '../tasks/quiz.js';

export function quizIssue(q){
 if(!q.text.trim()&&!q.image)return {key:'question',status:'Needs question',message:'Add question text or an image.'};
 const empty=q.answers.find(a=>!a.text.trim()&&!a.image);
 if(empty)return {key:empty.id,status:'Needs answer',message:'Add answer text or an image.'};
 try{validateQuiz({questions:[q]});return null;}catch(e){return {key:'answers',status:'Needs correct answer',message:e.message};}
}
export function mountQuizEditor(options){
 const expanded=new Set(options.activity.content.data.questions.slice(0,1).map(q=>q.id));let all=false,attempted=false,ctx,focusKey;
 const openOne=key=>{if(!all)expanded.clear();expanded.add(key);};
 const editor=baseEditor(options,c=>{
  ctx=c;c.space.classList.add('studio-editor','quiz-editor');const rows=c.data.questions;
  const changed=(focus)=>{focusKey=focus;c.changed();c.draw();};
  if(rows.length){const bar=el('div','studio-toolbar');bar.append(action('Expand All',()=>{all=true;rows.forEach(q=>expanded.add(q.id));c.draw();}),action('Collapse All',()=>{all=false;expanded.clear();c.draw();}));c.space.append(bar);}
  function media(owner,label){
   const box=el('div','quiz-media');
   if(owner.image){const thumb=action('',()=>imagePreview(owner.image,c.services,{alt:label,remove:()=>{delete owner.image;changed();},replace:file=>c.work(async()=>{owner.image=await c.services.upload(file);},true).then(()=>owner.image)}));thumb.className='studio-thumbnail';thumb.setAttribute('aria-label',label+' — view, replace or remove');thumb.append(preview(owner.image,c.services,label));box.append(thumb);}
   else {const add=imageInput('Add image',file=>c.work(async()=>{owner.image=await c.services.upload(file);},true));add.innerHTML=iconButton('image','Add image',()=>{}).innerHTML;add.className='editor-icon';add.setAttribute('aria-label','Add '+label.toLowerCase());add.title='Add '+label.toLowerCase();box.append(add);}
   return box;
  }
  for(const [index,q] of rows.entries()){
   const section=el('details','editor-section studio-accordion quiz-question');section.dataset.questionId=q.id;section.open=expanded.has(q.id);
   const summary=el('summary','studio-summary'),number=el('span','quiz-number',String(index+1).padStart(2,'0')),title=el('span','studio-title',q.text||'Question image'),kind=el('span','quiz-kind'),status=el('span','quiz-readiness');
   if(!q.text&&!q.image)title.textContent='Untitled question';
   const typeNames={single:'Single choice',multiple:'Multiple choice',trueFalse:'True / False'};kind.textContent=typeNames[q.mode];summary.append(number,title,kind,status);
   section.addEventListener('toggle',()=>{if(!section.isConnected)return;if(section.open){openOne(q.id);if(!all)for(const other of c.space.querySelectorAll('.quiz-question'))if(other!==section)other.open=false;}else expanded.delete(q.id);});
   const menu=el('span','quiz-menu'),trigger=iconButton('more','Question '+(index+1)+' actions',()=>{panel.hidden=!panel.hidden;trigger.setAttribute('aria-expanded',String(!panel.hidden));if(!panel.hidden)panel.querySelector('button:not(:disabled)')?.focus();}),panel=el('span','quiz-menu-panel');panel.hidden=true;trigger.setAttribute('aria-expanded','false');
   menu.onclick=e=>e.stopPropagation();menu.onkeydown=e=>{if(e.key==='Escape'){e.preventDefault();panel.hidden=true;trigger.setAttribute('aria-expanded','false');trigger.focus();}e.stopPropagation();};menu.onfocusout=()=>queueMicrotask(()=>{if(!menu.contains(document.activeElement)){panel.hidden=true;trigger.setAttribute('aria-expanded','false');}});
   panel.append(action('Move question up',()=>{move(rows,q,-1);changed(q.id+'-menu');},index===0),action('Move question down',()=>{move(rows,q,1);changed(q.id+'-menu');},index===rows.length-1),action('Duplicate Question',()=>{const copy=structuredClone(q),ids=new Map(copy.answers.map(a=>[a.id,id()]));copy.id=id();copy.answers.forEach(a=>a.id=ids.get(a.id));copy.correctIds=copy.correctIds.map(key=>ids.get(key));rows.splice(index+1,0,copy);openOne(copy.id);changed(copy.id+'-question');}),action('Delete question',()=>{rows.splice(index,1);expanded.delete(q.id);changed(rows[Math.min(index,rows.length-1)]?.id+'-menu');}));trigger.dataset.focus=q.id+'-menu';menu.append(trigger,panel);summary.append(menu);section.append(summary);
   const body=el('div','studio-body'),fields=new Map(),errors=new Map();
   function errorFor(key,field,parent){const msg=el('p','editor-error quiz-field-error');msg.id='quiz-error-'+q.id+'-'+key;msg.hidden=true;field.setAttribute('aria-describedby',msg.id);fields.set(key,field);errors.set(key,msg);parent.append(msg);}
   function refresh(){const issue=quizIssue(q);status.textContent=issue?'⚠ '+issue.status:'✓ Ready';status.dataset.ready=String(!issue);for(const [key,msg] of errors){const show=attempted&&issue?.key===key;msg.hidden=!show;msg.textContent=show?issue.message:'';fields.get(key).setAttribute('aria-invalid',String(show));}}
   const label=el('label','editor-field','Question type'),mode=el('select');for(const [key,name] of Object.entries(typeNames))mode.append(new Option(name,key));mode.value=q.mode;label.append(mode);
   mode.onchange=async()=>{const next=mode.value;const {confirmDialog}=await import('../ui.js');if(next==='trueFalse'&&q.mode!=='trueFalse'&&!await confirmDialog('Switch to True / False?','Existing answer options will be replaced by fixed True / False options.','Replace options')){mode.value=q.mode;return;}const previous=q.mode;q.mode=next;if(next==='trueFalse'){q.answers=['True','False'].map(text=>({id:id(),text}));q.correctIds=[];}else if(previous==='trueFalse'){q.answers=[{id:id(),text:''},{id:id(),text:''}];q.correctIds=[];}else if(next==='single'&&q.correctIds.length>1)q.correctIds=[];changed(q.id+'-question');};
   const question=el('div','quiz-question-field'),text=input('Question',q.text,value=>{q.text=value;title.textContent=value||(q.image?'Question image':'Untitled question');c.changed();refresh();},{area:true}),field=text.querySelector('textarea');field.dataset.focus=q.id+'-question';autoSize(field);question.append(text,media(q,'Question image'));errorFor('question',field,question);body.append(label,question);
   const answers=el('fieldset','quiz-answers'),legend=el('legend','','Answers'),instruction=el('p','quiz-answer-instruction',q.mode==='multiple'?'Select all correct answers':'Select the correct answer');answers.append(legend,instruction);answers.tabIndex=-1;answers.dataset.focus=q.id+'-answers';errorFor('answers',answers,answers);
   for(const [answerIndex,a] of q.answers.entries()){
    const row=el('div','quiz-editor-answer'),key=el('label','quiz-answer-key'),mark=el('input');mark.type=q.mode==='multiple'?'checkbox':'radio';mark.name='key-'+q.id;mark.checked=q.correctIds.includes(a.id);mark.setAttribute('aria-label','Correct answer '+(answerIndex+1));key.append(mark);
    mark.onchange=()=>{q.correctIds=q.mode==='multiple'?(mark.checked?[...new Set([...q.correctIds,a.id])]:q.correctIds.filter(v=>v!==a.id)):[a.id];c.changed();refresh();};row.append(key);
    if(q.mode==='trueFalse'){row.append(el('span','quiz-fixed-answer',a.text));}
    else {const answer=input('Answer '+(answerIndex+1),a.text,v=>{a.text=v;c.changed();refresh();},{area:true});answer.classList.add('quiz-answer-text');const field=answer.querySelector('textarea');field.dataset.focus=q.id+'-'+a.id;field.setAttribute('aria-label','Answer '+(answerIndex+1));autoSize(field);row.append(answer,media(a,'Answer '+(answerIndex+1)+' image'),iconButton('close','Remove answer '+(answerIndex+1),()=>{q.answers.splice(answerIndex,1);q.correctIds=q.correctIds.filter(v=>v!==a.id);changed(q.id+'-answers');},q.answers.length<=2));errorFor(a.id,field,row);}
    answers.append(row);
   }
   if(q.mode!=='trueFalse')answers.append(action('+ Add answer',()=>{const a={id:id(),text:''};q.answers.push(a);changed(q.id+'-'+a.id);},q.answers.length>=8));body.append(answers);section.append(body);c.space.append(section);refresh();
  }
  const add=action('+ Add Question',()=>{const q={id:id(),mode:'single',text:'',answers:[{id:id(),text:''},{id:id(),text:''}],correctIds:[]};rows.push(q);openOne(q.id);changed(q.id+'-question');});add.dataset.focus='add';c.space.append(add);
  if(attempted&&!rows.length)c.space.append(el('p','editor-error','Add a question.'));
  if(focusKey){const key=focusKey;focusKey=null;requestAnimationFrame(()=>[...c.space.querySelectorAll('[data-focus]')].find(n=>n.dataset.focus===key)?.focus());}
 });
 editor.validate=()=>{attempted=true;const first=ctx.data.questions.find(q=>quizIssue(q));if(first){all=false;openOne(first.id);focusKey=first.id+'-'+quizIssue(first).key;}else if(!ctx.data.questions.length)focusKey='add';ctx.draw();return !first&&ctx.data.questions.length>0;};
 return editor;
}
