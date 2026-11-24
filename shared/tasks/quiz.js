import {entityIndex,validateReferences} from '../activity/contracts.js';
import {validateMediaRef} from '../activity/media.js';

export const QUIZ_MODES=['single','multiple','trueFalse'];
function component(value,label){
 if(typeof value.text!=='string'||(!value.text.trim()&&!value.image))throw Error('Add '+label+' text or an image.');
 if(value.image)validateMediaRef(value.image);
}
export function validateQuiz(data){
 if(!Array.isArray(data?.questions)||!data.questions.length)throw Error('Add a question.');
 entityIndex(data.questions);
 for(const q of data.questions){
  if(!QUIZ_MODES.includes(q.mode))throw Error('Choose a question type.');
  component(q,'question');
  if(!Array.isArray(q.answers)||q.answers.length<2||q.answers.length>8)throw Error('Use 2–8 answer options.');
  const answers=entityIndex(q.answers);q.answers.forEach(a=>component(a,'answer'));
  validateReferences(q.correctIds,answers);
  if(new Set(q.correctIds).size!==q.correctIds.length)throw Error('Duplicate correct answer.');
  if(q.mode==='multiple'){
   if(q.correctIds.length<2||q.correctIds.length>=answers.size)throw Error('Multiple Choice needs at least two correct answers and one incorrect answer.');
  }else if(q.correctIds.length!==1)throw Error('Select exactly one correct answer.');
  if(q.mode==='trueFalse'&&(q.answers.length!==2||q.answers[0].text!=='True'||q.answers[1].text!=='False'||q.answers.some(a=>a.image)))throw Error('True / False uses fixed True and False options.');
 }
 return data;
}

// One presentation owns its answer order and retry count. Games own rewards.
export class QuizTask {
 constructor(question,{players=1,random=Math.random}={}){
  validateQuiz({questions:[question]});this.question=structuredClone(question);this.answers=[...this.question.answers];
  if(question.mode!=='trueFalse')for(let i=this.answers.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[this.answers[i],this.answers[j]]=[this.answers[j],this.answers[i]];}
  this.maxAttempts=players===1?3:1;this.attempts=0;this.selected=new Set();this.phase='answering';this.feedback={};this.result=null;
 }
 select(id){
  if(this.phase!=='answering'||!this.answers.some(a=>a.id===id))return false;
  if(this.question.mode==='multiple'){if(this.selected.has(id))this.selected.delete(id);else this.selected.add(id);}
  else this.selected=new Set([id]);return true;
 }
 check(){
  if(this.phase!=='answering'||!this.selected.size)return null;
  this.attempts++;const key=new Set(this.question.correctIds);
  this.feedback=Object.fromEntries([...this.selected].map(id=>[id,key.has(id)?'correct':'incorrect']));
  const correct=this.selected.size===key.size&&[...this.selected].every(id=>key.has(id));
  this.phase=correct||this.attempts>=this.maxAttempts?'resolved':'retry';
  if(this.phase==='resolved')this.result=this.assessment(correct?'correct':'incorrect');
  return {correct,final:this.phase==='resolved',feedback:{...this.feedback}};
 }
 retry(){if(this.phase!=='retry')return false;this.phase='answering';this.feedback={};return true;}
 reveal(){
  if(this.phase==='resolved'&&this.result?.status!=='incorrect')return false;
  this.feedback=Object.fromEntries(this.question.correctIds.map(id=>[id,'correct']));this.phase='resolved';this.result=this.assessment('revealed');return true;
 }
 assessment(status){return {status,questionId:this.question.id,attemptCount:this.attempts,selectedAnswerIds:[...this.selected],feedback:{...this.feedback}};}
}
