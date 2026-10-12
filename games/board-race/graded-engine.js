import {BoostRace} from './boost-engine.js';

// Only new evaluated content uses this gate. Concepts and physical decks keep
// their established landing flow and the original BoostRace implementation.
export class GradedRace extends BoostRace {
 constructor(...args){super(...args);this.taskAttempt=0;this.teamTask=null;this.teamWinners=[];}
 gate(){this.taskAttempt++;this.phase='TASK_GATE';}
 settleRoll(){
  if(this.phase!=='ROLLING')return false;
  if(this.turnPartner!==null){this.teamTask={leader:this.current,partner:this.turnPartner,roll:this.roll};this.turnPartner=null;}
  super.settleRoll();this.gate();return true;
 }
 applyLucky(a,b){if(!super.applyLucky(a,b))return false;this.gate();return true;}
 answerTask(correct,attempt){
  if(this.phase!=='TASK_GATE'||attempt!==this.taskAttempt)return false;
  if(correct)this.phase='MOVING';
  else{this.pending=[];this.phase='CONTENT';this.finishContent();}
  return true;
 }
 step(){
  const moved=super.step();
  // Resolve both individually evaluated team moves before announcing a shared
  // Finish. The partner is never moved by the leader's result.
  if(this.phase==='COMPLETE'&&(this.teamTask||this.teamWinners.length)){
   this.teamWinners.push(...this.winners);this.winners=[];this.phase='CONTENT';
  }
  return moved;
 }
 finishContent(){
  if(this.phase!=='CONTENT')return false;
  if(this.returnToActor!==null){this.current=this.returnToActor;this.returnToActor=null;}
  if(this.teamTask){
   const {leader,partner,roll}=this.teamTask;this.teamTask=null;this.teamLeader=leader;this.current=partner;this.specialResolved=false;this.roll=roll;this.queueMove(roll);this.gate();return true;
  }
  if(this.teamWinners.length){const winners=[...new Set(this.teamWinners)];this.teamWinners=[];this.complete(winners);return true;}
  return super.finishContent();
 }
}
