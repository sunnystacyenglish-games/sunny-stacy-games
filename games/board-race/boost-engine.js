import {BoardRace,EFFECTS} from './engine.js';
export class BoostRace extends BoardRace{
 constructor(options={},random=Math.random){super(options,random);for(const p of this.players)Object.assign(p,{ability:null,bonusRolls:0,reverse:false,partner:null,stolenBy:null});this.turnSeat=this.current;this.bonusRemaining=0;this.returnToActor=null;this.teamQueue=[];this.teamLeader=null;this.teamTravel=null;this.turnPartner=null;}
 eligiblePlayers(effect=this.effect){return this.players.filter(p=>p.id!==this.current&&(effect!=='steal'||p.stolenBy===null));}
 decision(){if(this.phase!=='SPECIAL')return null;const effect=this.effect,ability=this.player.ability;if(EFFECTS.includes(effect)&&ability)return {kind:ability,effect};if(['shield','pass'].includes(effect))return {kind:'acquire',effect,existing:ability};if(['switch','shuffle'].includes(effect))return {kind:'optional',effect};if(['team','steal'].includes(effect))return {kind:'target',effect};return {kind:'ack',effect};}
 resolveSpecial(choice={}){
  if(this.phase!=='SPECIAL')return false;const effect=this.effect,p=this.player,actor=this.current;
  if(EFFECTS.includes(effect)&&p.ability){if(typeof choice.use!=='boolean')return false;const held=p.ability;if(choice.use&&held==='pass'&&!this.eligiblePlayers().some(x=>x.id===choice.recipient))return false;p.ability=null;
   if(choice.use&&held==='shield'){this.effect=null;this.specialResolved=true;this.phase='CONTENT';this.finishContent();return true;}
   if(choice.use&&held==='pass'){const recipient=this.players[choice.recipient];this.effect=null;this.specialResolved=true;if(effect==='again'){recipient.bonusRolls++;this.phase='CONTENT';this.finishContent();}else if(effect==='skip'){recipient.skip=true;this.phase='CONTENT';this.finishContent();}else{this.returnToActor=actor;this.current=recipient.id;this.queueMove(effect==='forward'?2:-2);}return true;}
  }
  if(EFFECTS.includes(effect))return super.resolveSpecial();
  if(['switch','shuffle','shield','pass'].includes(effect)&&typeof choice.use!=='boolean')return false;
  if(['switch','team','steal'].includes(effect)&&choice.use!==false&&!this.eligiblePlayers(effect).some(x=>x.id===choice.recipient))return false;
  if(['shield','pass'].includes(effect)&&choice.use&&p.ability&&p.ability!==effect&&!['old','new'].includes(choice.keep))return false;
  this.effect=null;this.specialResolved=true;
  if(choice.use===false){this.phase='CONTENT';this.finishContent();return true;}
  if(effect==='shield'||effect==='pass'){if(!p.ability||p.ability===effect||choice.keep==='new')p.ability=effect;}
  if(effect==='switch'){const other=this.players[choice.recipient],fields=this.options.mode==='endless'?['position','lap','totalSpacesMoved']:['position'];for(const field of fields)[p[field],other[field]]=[other[field],p[field]];}
  if(effect==='shuffle'){const positions=this.players.map(p=>p.position);if(positions.length===2)positions.reverse();else for(let i=positions.length-1;i>0;i--){const j=Math.min(i,Math.floor(this.random()*(i+1)));[positions[i],positions[j]]=[positions[j],positions[i]];}this.players.forEach((player,i)=>{const next=positions[i],n=this.options.size,forward=(next-player.position+n)%n,backward=(player.position-next+n)%n;if(this.options.mode==='endless'&&forward<backward&&next<player.position)player.lap++;player.position=next;});}
  if(effect==='reverse')p.reverse=true;
  if(effect==='team')p.partner=choice.recipient;
  if(effect==='steal')this.players[choice.recipient].stolenBy=actor;
  if(effect==='lucky'){this.phase='LUCKY_ROLL';return true;}
  this.phase='CONTENT';this.finishContent();return true;
 }
 applyLucky(a,b){if(this.phase!=='LUCKY_ROLL'||![a,b].every(v=>Number.isInteger(v)&&v>=1&&v<=6))return false;this.roll=Math.max(a,b);const reverse=this.player.reverse;this.player.reverse=false;this.queueMove(this.roll*(reverse?-1:1));return true;}
 settleRoll(){if(this.phase!=='ROLLING')return false;const p=this.player,reverse=p.reverse;p.reverse=false;if(this.turnPartner!==null){this.teamTravel={partner:this.turnPartner,remaining:this.roll};this.teamLeader=this.current;this.teamQueue=[this.turnPartner];this.turnPartner=null;}this.queueMove(this.roll*(reverse?-1:1));return true;}
 step(){if(!this.teamTravel)return super.step();if(this.phase!=='MOVING')return false;const direction=this.pending.shift();if(direction===undefined)return false;this.moveOne(this.player,direction);this.moveOne(this.players[this.teamTravel.partner],1);this.teamTravel.remaining--;if(!this.pending.length){const winners=this.options.mode==='race'?[this.current,this.teamTravel.partner].filter(id=>this.players[id].position===this.options.size):[];this.teamTravel=null;if(winners.length)this.complete(winners);else this.land();}return true;}
 finishContent(){if(this.phase!=='CONTENT')return false;
  if(this.returnToActor!==null){this.current=this.returnToActor;this.returnToActor=null;}
  if(this.teamQueue.length){this.current=this.teamQueue.shift();this.specialResolved=false;this.land();return true;}
  if(this.teamLeader!==null){this.current=this.teamLeader;this.teamLeader=null;}
  if(this.bonusRemaining>0){this.bonusRemaining--;this.phase='READY';return true;}
  this.skipped=[];do{this.turnSeat=(this.turnSeat+1)%this.players.length;const seat=this.players[this.turnSeat];if(seat.skip){seat.skip=false;this.skipped.push(seat.id);continue;}this.current=seat.stolenBy??seat.id;seat.stolenBy=null;break;}while(true);
  this.turnPartner=this.player.partner;this.player.partner=null;this.bonusRemaining=this.player.bonusRolls;this.player.bonusRolls=0;this.phase='READY';return true;
 }
}
