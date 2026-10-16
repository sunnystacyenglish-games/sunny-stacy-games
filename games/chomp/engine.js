import {shuffle} from '../dobble/engine.js';
export function ordinal(n){const tail=n%100;return n+(tail>=11&&tail<=13?'th':({1:'st',2:'nd',3:'rd'}[n%10]||'th'));}
export class Chomp {
 constructor({teeth,players=1,random=Math.random,starter}={}){
  if(!Array.isArray(teeth)||!teeth.length||new Set(teeth).size!==teeth.length)throw Error('Character teeth are unavailable.');
  if(!Number.isInteger(players)||players<1||players>4)throw Error('Choose 1–4 players.');
  this.teeth=[...teeth];this.players=players;this.used=new Set();this.danger=teeth[Math.floor(random()*teeth.length)];this.player=starter??Math.floor(random()*players);this.starter=this.player;this.state='TASK_ACTIVE';this.attempt=1;
 }
 resolve(correct,attempt){if(this.state!=='TASK_ACTIVE'||attempt!==this.attempt)return false;this.state='TASK_RESOLVING';this.success=!!correct;return true;}
 resolved(){if(this.state!=='TASK_RESOLVING')return false;if(this.success)this.state='WAIT_FOR_TOOTH';else this.next();return true;}
 next(){this.player=(this.player+1)%this.players;this.attempt++;this.state='TASK_ACTIVE';}
 press(id){if(this.state!=='WAIT_FOR_TOOTH'||!this.teeth.includes(id)||this.used.has(id))return null;this.used.add(id);this.state='TOOTH_PRESSING';this.pressed=id;return {danger:id===this.danger,count:this.used.size};}
 pressedDone(){if(this.state!=='TOOTH_PRESSING')return false;if(this.pressed===this.danger)this.state='CHOMP_TRANSITION';else this.next();return true;}
 complete(){if(this.state!=='CHOMP_TRANSITION')return false;this.state='ROUND_COMPLETE';return true;}
}

// Source-scoped identity. Fair deck turns within each priority group prevent
// authored ordering (or large decks) from dominating consecutive selections.
export class MasteryBag {
 constructor(items,random=Math.random){
  if(!items?.length)throw Error('Choose content with at least one task.');
  this.random=random;this.items=structuredClone(items);this.records=new Map(this.items.map(item=>[item.key,{item,status:'unseen',eligibleAt:0}]));
  if(this.records.size!==items.length)throw Error('Task IDs must be unique within their source.');
  this.orders=new Map();for(const item of this.items){const group=item.group||item.key;this.orders.set(group,[]);}
  for(const group of this.orders.keys())this.orders.set(group,shuffle(this.items.filter(i=>(i.group||i.key)===group).map(i=>i.key),random));
  this.turn=0;this.last=null;this.groupTurns=new Map();
 }
 next(){
  const all=[...this.records.values()];let pool=[];
  for(const status of ['unseen','retry','completed']){pool=all.filter(r=>r.status===status&&(status!=='retry'||r.eligibleAt<=this.turn));if(pool.length)break;}
  if(!pool.length)pool=all;
  if(pool.every(r=>r.item.key===this.last)&&all.length>1){const other=all.filter(r=>r.item.key!==this.last&&r.status!=='unseen');if(other.length)pool=other;}
  if(pool.some(r=>r.item.key!==this.last))pool=pool.filter(r=>r.item.key!==this.last);
  const groups=[...new Set(pool.map(r=>r.item.group||r.item.key))],least=Math.min(...groups.map(g=>this.groupTurns.get(g)||0));
  const group=shuffle(groups.filter(g=>(this.groupTurns.get(g)||0)===least),this.random)[0];
  const eligible=new Set(pool.filter(r=>(r.item.group||r.item.key)===group).map(r=>r.item.key));let order=this.orders.get(group);
  if(!order.some(k=>eligible.has(k))){order=shuffle(all.filter(r=>(r.item.group||r.item.key)===group).map(r=>r.item.key),this.random);this.orders.set(group,order);}
  const index=order.findIndex(k=>eligible.has(k)),key=order.splice(index,1)[0];this.groupTurns.set(group,(this.groupTurns.get(group)||0)+1);this.last=key;this.turn++;return structuredClone(this.records.get(key).item);
 }
 record(key,success){const record=this.records.get(key);if(!record)throw Error('Task is unavailable.');record.status=success?'completed':'retry';record.eligibleAt=this.turn+1;}
}
