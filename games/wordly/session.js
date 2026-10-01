export const normalizeSelection=value=>value==='mastery'?'mastery':'random';
function shuffle(items,random){const copy=[...items];for(let i=copy.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]];}return copy;}
export class WordSession{
 constructor(pool,mode='random',random=Math.random){if(!pool.length)throw Error('No eligible words');this.pool=[...pool];this.mode=normalizeSelection(mode);this.random=random;this.reset();}
 reset(){this.mastered=new Set();this.failed=[];this.pending=this.mode==='mastery'?shuffle(this.pool,this.random):[];this.current=null;this.pass=1;}
 get done(){return this.mode==='mastery'&&this.mastered.size===this.pool.length;}
 next(){if(this.current)return this.current;if(this.done)return null;if(this.mode==='random')return this.current=this.pool[Math.floor(this.random()*this.pool.length)];if(!this.pending.length){this.pending=shuffle(this.failed,this.random);this.failed=[];this.pass++;}return this.current=this.pending.shift()||null;}
 finish(success){if(!this.current)return false;if(this.mode==='mastery'){if(success)this.mastered.add(this.current.id);else this.failed.push(this.current);}this.current=null;return true;}
}
