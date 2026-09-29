import {eligibleWord} from './eligibility.js';
import {ConceptBag} from '../tic-tac-toe/engine.js';
export function evaluateLetters(answer,guess,locked=[]){
 answer=answer.toUpperCase();guess=Array.from(guess,x=>x.toUpperCase());if(guess.length!==answer.length)throw Error('Wrong guess length');
 const states=Array(answer.length).fill('absent'),remaining={};
 for(let i=0;i<answer.length;i++){if(locked[i]||guess[i]===answer[i])states[i]='correct';else remaining[answer[i]]=(remaining[answer[i]]||0)+1;}
 for(let i=0;i<answer.length;i++)if(states[i]!=='correct'&&remaining[guess[i]]>0){states[i]='present';remaining[guess[i]]--;}
 return states;
}
export function medalFor(submitted,maxAttempts){if(submitted>=maxAttempts)return '';return ['🥇','🥈','🥉'][Math.max(1,submitted)-1]||'🏅';}
export function successCopy(submitted){if(!submitted)return 'You spelled it with hints!';return submitted<=3?'You guessed it on your '+['first','second','third'][submitted-1]+' try!':'You guessed it in '+submitted+' tries!';}
export function createBag(pool,random=Math.random){if(!pool.length)throw Error('No eligible words');if(pool.length===1)return {consumed:0,next(){this.consumed++;return pool[0];}};return new ConceptBag(pool,random);}
export class WordlyRound{
 constructor(concept){if(!eligibleWord(concept.word))throw Error('Use a single word with 3–8 English letters.');this.concept=concept;this.answer=concept.word.toUpperCase();this.length=this.answer.length;this.maxAttempts=this.length;this.submitted=0;this.locked=Array(this.length).fill(null);this.hinted=new Set();this.current=Array(this.length).fill('');this.rows=[];this.state='INPUT';}
 type(letter){if(this.state!=='INPUT'||!/^[a-z]$/i.test(letter))return false;const index=this.current.findIndex((v,i)=>!this.locked[i]&&!v);if(index<0)return false;this.current[index]=letter.toUpperCase();return true;}
 backspace(){if(this.state!=='INPUT')return false;for(let i=this.length-1;i>=0;i--)if(!this.locked[i]&&this.current[i]){this.current[i]='';return true;}return false;}
 submit(){if(this.state!=='INPUT')return false;if(this.current.some(v=>!v))return {incomplete:true};const feedback=evaluateLetters(this.answer,this.current,this.locked);const row={letters:[...this.current],feedback,prelocked:this.locked.map(Boolean)};this.rows.push(row);this.submitted++;feedback.forEach((v,i)=>{if(v==='correct')this.locked[i]=this.answer[i];});this.state='EVALUATING';return row;}
 finishFeedback(){if(this.state!=='EVALUATING')return false;if(this.locked.every(Boolean))this.state='SUCCESS';else if(this.submitted>=this.maxAttempts)this.state='FAILURE';else{this.current=this.locked.map(v=>v||'');this.state='INPUT';}return true;}
 hint(random=Math.random){if(this.state!=='INPUT')return false;const indexes=this.locked.flatMap((v,i)=>v?[]:[i]);if(!indexes.length)return false;const index=indexes[Math.floor(random()*indexes.length)];this.hinted.add(index);this.locked[index]=this.current[index]=this.answer[index];if(this.locked.every(Boolean))this.state='SUCCESS';return index;}
}
