export const DECK=[
 [0,1,2,3],[0,4,5,6],[0,7,8,9],[0,10,11,12],
 [1,4,7,10],[1,5,8,11],[1,6,9,12],
 [2,4,8,12],[2,5,9,10],[2,6,7,11],
 [3,4,9,11],[3,5,7,12],[3,6,8,10]
];
export function shuffle(values,random=Math.random) {
  const result=[...values];
  for(let i=result.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
  return result;
}
export function createRound(items,settings,previous=null,random=Math.random,pool=null) {
  const needed=requiredConcepts(settings);
  if(items.length<needed)throw Error(`${settings.per} items per card with ${settings.count} card(s) needs at least ${needed} concepts. This set has ${items.length}.`);
  if(new Set(items.map(item=>item.id)).size!==items.length)throw Error('Concept IDs must be unique.');
  if(settings.mode==='mixed' && settings.count>2) throw Error('Word + Image supports at most two cards.');
  const candidates=items.map((_,i)=>i).filter(i=>items.length===1||items[i].id!==previous?.answer);
  const targetId=pool?.nextTarget();
  const target=pool?items.findIndex(item=>item.id===targetId):candidates[Math.floor(random()*candidates.length)];
  const distractors=pool?pool.distractors(items[target].id,settings.count*(settings.per-1)).map(id=>items.findIndex(item=>item.id===id)):shuffle(items.map((_,i)=>i).filter(i=>i!==target),random);
  const selected=Array.from({length:settings.count},(_,i)=>[target,...distractors.slice(i*(settings.per-1),(i+1)*(settings.per-1))]);
  const firstType=random()<.5?'image':'word';
  const cards=selected.map((card,index)=>shuffle([target,...shuffle(card.filter(id=>id!==target),random).slice(0,settings.per-1)],random).map(id=>({
    concept:items[id], representation:settings.mode==='images'?'image':settings.mode==='words'?'word':id===target?(index===0?firstType:firstType==='image'?'word':'image'):(random()<.5?'image':'word')
  })));
  const targetItem=cards[0].find(item=>item.concept.id===items[target].id);
  return {answer:items[target].id,cards,cue:{concept:items[target],representation:(targetItem.representation==='image'?'word':'image')}};
}
export class GameSession {
  constructor({nextRound,onChange=()=>{},schedule=(fn,delay)=>setTimeout(fn,delay),cancel=id=>clearTimeout(id)}) {
    Object.assign(this,{nextRound,onChange,schedule,cancel,score:0,roundNumber:0,roundLocked:false,timer:null,round:null});
  }
  clearPending(){if(this.timer!==null)this.cancel(this.timer);this.timer=null;}
  start(){this.clearPending();this.round=this.nextRound(this.round);this.roundNumber++;this.roundLocked=false;this.onChange('round');}
  answer(id,{autoNext,delay}) {
    if(this.roundLocked || !this.round)return 'locked';
    if(id!==this.round.answer){this.onChange('wrong');return 'wrong';}
    this.roundLocked=true;this.score++;
    if(autoNext)this.timer=this.schedule(()=>{this.timer=null;this.start();},delay);
    this.onChange('correct');return 'correct';
  }
  resetScore(){this.score=0;this.onChange('score');}
}

export function requiredConcepts({count,per}){
  if(!Number.isInteger(count)||count<1||count>4||!Number.isInteger(per)||per<1||per>10)throw Error('Choose 1–4 cards and 1–10 items per card.');
  return 1+count*(per-1);
}
export class RotationPool {
  constructor(items,random=Math.random){this.ids=items.map(item=>item.id);this.random=random;this.bag=[];this.last=null;this.usage=new Map(this.ids.map(id=>[id,0]));}
  nextTarget(){
    if(!this.bag.length){this.bag=shuffle(this.ids,this.random);if(this.bag.length>1&&this.bag.at(-1)===this.last)[this.bag[0],this.bag[this.bag.length-1]]=[this.bag.at(-1),this.bag[0]];}
    return this.last=this.bag.pop();
  }
  distractors(target,count){
    const candidates=shuffle(this.ids.filter(id=>id!==target),this.random).sort((a,b)=>this.usage.get(a)-this.usage.get(b));
    const picked=candidates.slice(0,count);for(const id of picked)this.usage.set(id,this.usage.get(id)+1);return picked;
  }
}

export function maxItemsPerCard(size,count){return Math.max(1,Math.min(10,Math.floor((size-1)/count)+1));}
