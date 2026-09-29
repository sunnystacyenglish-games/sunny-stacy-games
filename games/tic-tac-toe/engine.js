export const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
export const other=p=>p==='X'?'O':'X';
export function outcome(board){for(const line of LINES)if(board[line[0]]&&line.every(i=>board[i]===board[line[0]]))return {winner:board[line[0]],line};return board.every(Boolean)?{draw:true}:null;}
export class ConceptBag{
 constructor(items,random=Math.random){if(items.length<2)throw Error('At least two concepts required');this.items=items;this.random=random;this.queue=[];this.last=null;this.consumed=0;}
 next(){if(!this.queue.length){this.queue=[...this.items];for(let i=this.queue.length-1;i>0;i--){const j=Math.floor(this.random()*(i+1));[this.queue[i],this.queue[j]]=[this.queue[j],this.queue[i]];}if(this.queue[0].id===this.last)[this.queue[0],this.queue[1]]=[this.queue[1],this.queue[0]];}const item=this.queue.shift();this.last=item.id;this.consumed++;return item;}
}
export class TicTacToe{
 constructor(items,random=Math.random,{steal=true}={}){this.steal=steal;this.bag=new ConceptBag(items,random);this.starter=random()<.5?'X':'O';this.attempt=0;this.reset();}
 reset(){this.board=Array(9).fill(null);this.current=this.starter;this.pending=null;this.concept=null;this.result=null;this.state='SELECT_CELL';}
 choose(index){if(this.state!=='SELECT_CELL'||!Number.isInteger(index)||index<0||index>8||this.board[index]!==null)return false;this.pending=index;this.origin=this.current;this.concept=this.bag.next();this.attempt++;this.state='TASK';return true;}
 answer(correct,attempt){if(attempt!==this.attempt||!['TASK','STEAL_TASK'].includes(this.state))return false;if(!correct&&this.state==='TASK'&&this.steal){this.current=other(this.origin);this.concept=this.bag.next();this.attempt++;this.state='STEAL_TASK';return 'steal';}if(correct)this.board[this.pending]=this.current;this.result=correct?outcome(this.board):null;this.nextPlayer=this.state==='STEAL_TASK'?this.origin:other(this.current);this.state='RESOLVING';return correct?'placed':'missed';}
 finish(){if(this.state!=='RESOLVING')return false;this.pending=null;this.concept=null;if(this.result)this.state=this.result.winner?'WIN':'DRAW';else{this.current=this.nextPlayer;this.state='SELECT_CELL';}return true;}
 playAgain(){if(!['WIN','DRAW'].includes(this.state))return false;this.starter=other(this.starter);this.reset();return true;}
}
