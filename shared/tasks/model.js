import {validateQuiz} from './quiz.js';
import {validateBridge,validateSentences,validateDecks,sentenceDiff} from '../editors/models.js';

export function taskAnswerDiff(original,answer){
 const tokens=s=>s.match(/\s+|[\p{L}\p{N}]+(?:['’][\p{L}\p{N}]+)*|[^\s]/gu)||[],left=tokens(original),right=tokens(answer);
 let start=0,end=0;while(start<left.length&&start<right.length&&left[start]===right[start])start++;
 while(end<left.length-start&&end<right.length-start&&left[left.length-1-end]===right[right.length-1-end])end++;
 return [...right.slice(0,start).map(text=>({text,changed:false})),...sentenceDiff(left.slice(start,left.length-end).join(''),right.slice(start,right.length-end).join('')).right,...right.slice(right.length-end).map(text=>({text,changed:false}))];
}

// Runtime snapshots never write to the reusable author document.
export function taskSnapshot(document,{deckId}={}) {
 if(!document?.content)throw Error('Choose available content before playing.');
 const {type}=document.content,data=structuredClone(document.content.data);
 let items;
 if(type==='quiz'){validateQuiz(data);items=data.questions;}
 else if(type==='sentenceCorrection'){validateSentences(data);items=data.sentences;}
 else if(type==='bridge'){validateBridge(data);items=data.bridges;}
 else if(type==='cardDecks'){
  validateDecks(data,{previousDeckCount:data.decks?.length||0});
  const deck=data.decks.find(d=>d.id===deckId);
  if(!deck)throw Error('Choose a deck before playing.');
  if(!deck.cards.length)throw Error(deck.name+': add at least one card before playing.');
  items=deck.cards.map(card=>({...card,deckId:deck.id,deckName:deck.name,deckColor:deck.color}));
 }else throw Error('This content type is not supported by this task.');
 return {documentId:document.id,name:document.name,type,items:items.map(item=>({...item,type}))};
}

export class TaskBag {
 constructor(items,random=Math.random){if(!items?.length)throw Error('Add at least one task.');this.items=structuredClone(items);this.random=random;this.queue=[];this.last=null;}
 next(){
  if(!this.queue.length){
   this.queue=[...this.items];
   for(let i=this.queue.length-1;i>0;i--){const j=Math.min(i,Math.floor(this.random()*(i+1)));[this.queue[i],this.queue[j]]=[this.queue[j],this.queue[i]];}
   if(this.queue.length>1&&this.queue[0].id===this.last)[this.queue[0],this.queue[1]]=[this.queue[1],this.queue[0]];
  }
  const next=this.queue.shift();this.last=next.id;return structuredClone(next);
 }
}

// Reuse the task bag's coverage pass; unsuccessful questions wait until it ends.
export class QuizBag extends TaskBag {
 constructor(items,{shuffle=true,random=Math.random}={}){super(items,random);this.shuffle=shuffle;this.pending=new Set(items.map(i=>i.id));}
 next(){
  if(!this.queue.length){
   const eligible=this.items.filter(i=>this.pending.has(i.id));this.queue=[...(eligible.length?eligible:this.items)];
   if(this.shuffle)for(let i=this.queue.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.queue[i],this.queue[j]]=[this.queue[j],this.queue[i]];}
   if(this.queue.length>1&&this.queue[0].id===this.last)[this.queue[0],this.queue[1]]=[this.queue[1],this.queue[0]];
   if(this.queue.length===1&&this.queue[0].id===this.last&&this.items.length>1)this.queue.unshift(this.items.find(i=>i.id!==this.last));
  }
  const item=this.queue.shift();this.last=item.id;return structuredClone(item);
 }
 record(id,success){const item=this.items.find(i=>i.id===id||i.key===id);if(!item)return;if(success)this.pending.delete(item.id);else this.pending.add(item.id);}
}

// Identity is scoped by source and group, never by displayed answer text.
export class BridgeTask {
 constructor(source){
  validateBridge({bridges:[source]});this.source=structuredClone(source);this.selected=null;this.revealed=false;this.placements=new Map();
  this.options=[];
  for(const group of this.source.groups){
   for(const gap of this.source.gaps.filter(g=>g.groupId===group.id)){
    const brick=this.source.bricks.find(b=>b.id===gap.brickId);
    this.options.push({id:JSON.stringify(['answer',gap.id]),groupId:group.id,text:brick.text});
   }
   for(const d of group.distractors)this.options.push({id:JSON.stringify(['distractor',group.id,d.id]),groupId:group.id,text:d.text});
  }
 }
 select(id){if(this.revealed||!this.source.gaps.some(g=>g.id===id))return false;this.selected=id;return true;}
 available(allGroups=false){const used=new Set(this.placements.values()),group=allGroups?null:this.source.gaps.find(g=>g.id===this.selected)?.groupId;return this.options.filter(o=>!used.has(o.id)&&(!group||o.groupId===group));}
 place(id){if(this.revealed||!this.selected||!this.available().some(o=>o.id===id))return false;this.placements.set(this.selected,id);return true;}
 get complete(){return this.source.gaps.every(g=>this.placements.has(g.id));}
 get assessment(){
  if(!this.revealed)return null;
  const gaps=this.source.gaps.map(gap=>{const expected=this.source.bricks.find(b=>b.id===gap.brickId).text,chosen=this.options.find(o=>o.id===this.placements.get(gap.id));return {gapId:gap.id,correct:chosen?.text===expected};});
  return {correct:gaps.every(g=>g.correct),gaps};
 }
 reveal(){if(this.revealed||!this.complete)return false;this.revealed=true;return true;}
 fragments(answer=false){return this.source.bricks.map(brick=>{const gap=this.source.gaps.find(g=>g.brickId===brick.id);if(!gap)return {text:brick.text};const option=this.options.find(o=>o.id===this.placements.get(gap.id));return {gapId:gap.id,optionId:option?.id,text:answer?brick.text:option?.text||'',changed:answer};});}
}
