import {QuizTask} from './quiz.js';
import {cardContent} from './card.js';
const node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
export async function mountQuizTask(host,question,{players=1,onReady=()=>{},actionHost=null}={}){
 const task=new QuizTask(question,{players}),root=node('section');root.className='quiz-task';
 const prompt=node('div');prompt.className='quiz-prompt';prompt.append(await cardContent(question));root.append(prompt);
 if(question.mode==='multiple')root.append(node('p',`Choose ${question.correctIds.length} correct answers`));
 const choices=node('div');choices.className='quiz-options';const buttons=[];
 for(const answer of task.answers){const button=node('button');button.type='button';button.dataset.answerId=answer.id;button.className='quiz-option';button.append(await cardContent(answer));button.onclick=()=>{if(task.select(answer.id))draw();};buttons.push(button);choices.append(button);}
 const status=node('p');status.setAttribute('role','status');const controls=node('div');controls.className='quiz-controls';
 const check=node('button','Check Answer'),retry=node('button','Try Again'),reveal=node('button','Reveal Answer');for(const b of [check,retry,reveal])b.type='button';
 check.onclick=()=>{if(task.check())draw();};retry.onclick=()=>{if(task.retry())draw();};reveal.onclick=()=>{if(task.reveal())draw();};
 controls.append(retry,reveal);reveal.classList.add('quiz-reveal');root.append(choices,status);root.append(controls);task.attachControls=()=>{if(actionHost){controls.classList.add('quiz-external-controls');actionHost.prepend(controls);}};host.replaceChildren(root);
 function draw(){for(const b of buttons){b.disabled=task.phase!=='answering';b.setAttribute('aria-pressed',String(task.selected.has(b.dataset.answerId)));b.dataset.result=task.feedback[b.dataset.answerId]||'';}
  check.hidden=task.phase!=='answering';check.disabled=!task.selected.size;retry.hidden=task.phase!=='retry';reveal.hidden=task.phase==='resolved'&&task.result?.status!=='incorrect';
  status.textContent=task.phase==='answering'?'':task.result?.status==='revealed'?'Answer revealed — skipped':task.result?.status==='correct'?'Correct':`Incorrect / incomplete${players===1?' · Attempt '+task.attempts+' of 3':''}`;
  onReady(task.phase==='resolved');
 }task.checkAndDraw=()=>{const result=task.check();if(result)draw();return result;};draw();return task;
}
