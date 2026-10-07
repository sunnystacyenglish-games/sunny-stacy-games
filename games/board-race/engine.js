import {normalizeGameplay} from './activity.js';
export const EFFECTS=['forward','back','again','skip'];
export const EFFECT_LABELS={forward:'Move forward 2!',back:'Move back 2!',again:'Roll again!',skip:'Skip next turn!'};

export function distributeSpecials(size,mode,enabled,random=Math.random){const result={};if(!enabled)return result;const eligible=Array.from({length:size},(_,i)=>i).filter(i=>mode==='endless'||i>=2&&i<size-1);const wanted=Math.round(eligible.length*.18),pool=eligible.map(i=>({i,k:random()})).sort((a,b)=>a.k-b.k).map(x=>x.i);for(const i of pool){if(Object.keys(result).length>=wanted)break;if(Object.keys(result).some(k=>Math.abs(+k-i)===1||mode==='endless'&&Math.abs(+k-i)===size-1))continue;result[i]=EFFECTS[Math.floor(random()*4)%4];}return result;}
// Position is an index into the ordered path; Race Start is -1, final tile is Finish.
// totalSpacesMoved counts all actual steps, including backward special movement.
export class BoardRace{
 constructor(options={},random=Math.random){this.options=normalizeGameplay(options);this.random=random;this.players=Array.from({length:this.options.players},(_,i)=>({id:i,position:this.options.mode==='endless'?0:-1,lap:1,totalSpacesMoved:0,skip:false}));this.current=Math.min(this.players.length-1,Math.floor(random()*this.players.length));this.phase='READY';this.specials=distributeSpecials(this.options.size,this.options.mode,this.options.special,random);this.pending=[];this.extraRoll=false;this.effect=null;this.specialResolved=false;this.revealed=new Set();this.winners=[];this.skipped=[];}
 get player(){return this.players[this.current];}
 beginRoll(value){if(this.phase!=='READY')return false;value??=1+Math.floor(this.random()*6);if(!Number.isInteger(value)||value<1||value>6)throw Error('Die value must be 1–6.');this.roll=value;this.extraRoll=false;this.specialResolved=false;this.phase='ROLLING';return true;}
 settleRoll(){if(this.phase!=='ROLLING')return false;this.queueMove(this.roll);return true;}
 queueMove(distance){this.pending=Array.from({length:Math.abs(distance)},()=>Math.sign(distance));this.phase='MOVING';}
 step(){if(this.phase!=='MOVING')return false;const direction=this.pending.shift(),p=this.player,n=this.options.size;if(direction===undefined){this.land();return false;}let next=p.position+direction;if(this.options.mode==='endless'){if(direction>0&&next===n)p.lap++;next=(next+n)%n;}else next=Math.max(-1,Math.min(n-1,next));if(next!==p.position){p.position=next;p.totalSpacesMoved++;}if(this.options.mode==='race'&&p.position===n-1){this.pending=[];this.complete([p.id]);return true;}if(!this.pending.length)this.land();return true;}
 land(){this.phase='LAND';this.effect=!this.specialResolved?this.specials[this.player.position]:null;if(this.effect){this.revealed.add(this.player.position);this.phase='SPECIAL';return;}this.phase='CONTENT';}
 resolveSpecial(){if(this.phase!=='SPECIAL')return false;this.specialResolved=true;const effect=this.effect;this.effect=null;if(effect==='forward'||effect==='back'){this.queueMove(effect==='forward'?2:-2);}else{if(effect==='again'){this.extraRoll=false;this.phase='READY';}else{if(effect==='skip')this.player.skip=true;this.phase='CONTENT';this.finishContent();}}return true;}
 finishContent(){if(this.phase!=='CONTENT')return false;if(this.extraRoll){this.extraRoll=false;this.phase='READY';return true;}this.skipped=[];do{this.current=(this.current+1)%this.players.length;if(!this.player.skip)break;this.player.skip=false;this.skipped.push(this.current);}while(true);this.phase='READY';return true;}
 endNow(){if(this.options.mode!=='endless'||this.phase==='COMPLETE')return false;const best=Math.max(...this.players.map(p=>p.totalSpacesMoved));this.complete(this.players.filter(p=>p.totalSpacesMoved===best).map(p=>p.id));return true;}
 complete(winners){this.pending=[];this.phase='COMPLETE';this.winners=winners;}
}
