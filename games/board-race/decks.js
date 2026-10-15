import {validateDecks} from '../../shared/editors/models.js';
import {shuffle} from '../dobble/engine.js';
// Session snapshots retain author IDs/content; no mutation of Content Studio records.
export function deckKey(documentId,deckId){return JSON.stringify([documentId,deckId]);}
export function availableDecks(documents){return documents.filter(d=>d.content?.type==='cardDecks').flatMap(d=>(d.content.data?.decks||[]).map(deck=>({key:deckKey(d.id,deck.id),documentId:d.id,documentName:d.name,deck:structuredClone(deck)})));}
export function validateSelectedDecks(decks){if(decks.length<1||decks.length>5)throw Error('Choose 1–5 decks.');const seen=new Set();for(const entry of decks){if(seen.has(entry.key))throw Error('A deck is selected twice.');seen.add(entry.key);try{validateDecks({decks:[entry.deck]});if(!entry.deck.cards.length)throw Error('This deck has no cards.');}catch(error){throw Error(entry.deck.name+': '+error.message);}for(const other of decks){if(other===entry)break;if(similarColors(other.deck.color,entry.deck.color))throw Error('Choose more distinct colors for '+other.deck.name+' and '+entry.deck.name+'.');}}return structuredClone(decks);}
function lab(hex){const c=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4),l=Math.cbrt(.4122214708*c[0]+.5363325363*c[1]+.0514459929*c[2]),m=Math.cbrt(.2119034982*c[0]+.6806995451*c[1]+.1073969566*c[2]),s=Math.cbrt(.0883024619*c[0]+.2817188376*c[1]+.6299787005*c[2]);return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];}
export function similarColors(a,b){const x=lab(a),y=lab(b);return Math.hypot(...x.map((v,i)=>v-y[i]))<.12;}
export function assignDeckSpaces(size,decks,specials){let cursor=0;return Array.from({length:size},(_,index)=>Object.hasOwn(specials,index)?{type:'boost',effect:specials[index]}:{type:'deck',deckKey:decks[cursor++%decks.length].key});}
export function deckPositions(count){if(count===1)return [[.5,.5]];if(count===2)return [[.25,.5],[.75,.5]];if(count===3)return [[.25,.22],[.75,.22],[.5,.78]];if(count===4)return [[.25,.25],[.75,.25],[.25,.75],[.75,.75]];if(count===5)return [[.2,.18],[.8,.18],[.2,.82],[.8,.82],[.5,.5]];throw Error('Choose 1–5 decks.');}
export function deckComposition(count,areaWidth,areaHeight){
 if(!Number.isInteger(count)||count<1||count>5)throw Error('Choose 1–5 decks.');
 const ratio=.72,padding=12,gap=18,candidates=[];
 for(let columns=1;columns<=count;columns++){
  const rows=Math.ceil(count/columns),width=Math.min((areaWidth-2*padding-(columns-1)*gap)/columns,(areaHeight-2*padding-(rows-1)*gap)/rows*ratio);
  if(width<=0)continue;
  candidates.push({columns,rows,width,height:width/ratio});
 }
 candidates.sort((a,b)=>b.width-a.width||a.rows-b.rows);const best=candidates[0];
 if(!best)throw Error('The board interior is too small for the decks.');
 const {columns,rows,width,height}=best,positions=[];
 for(let row=0;row<rows;row++){
  const length=Math.min(columns,count-row*columns),start=(areaWidth-(length*width+(length-1)*gap))/2;
  for(let col=0;col<length;col++)positions.push([start+width/2+col*(width+gap),(areaHeight-(rows*height+(rows-1)*gap))/2+height/2+row*(height+gap)]);
 }
 return {positions,width,height,columns,rows};
}
export class DeckSession{
 constructor(decks,random=Math.random){this.decks=validateSelectedDecks(decks);this.random=random;this.state='IDLE';this.generation=0;this.bags=new Map(this.decks.map(d=>{const ids=d.deck.cards.map(card=>card.id);return [d.key,{ids,order:shuffle(ids,random),cursor:0,last:null}];}));}
 wait(key){if(this.state!=='IDLE')return false;if(!this.decks.some(d=>d.key===key))throw Error('Required deck is unavailable.');this.required=key;this.state='WAIT_FOR_DRAW';return true;}
 draw(key){if(this.state!=='WAIT_FOR_DRAW'||key!==this.required)return null;const deck=this.decks.find(d=>d.key===key),bag=this.bags.get(key);
  if(bag.cursor===bag.order.length){bag.order=shuffle(bag.ids,this.random);bag.cursor=0;if(bag.order.length>1&&bag.order[0]===bag.last){const j=1+Math.floor(this.random()*(bag.order.length-1));[bag.order[0],bag.order[j]]=[bag.order[j],bag.order[0]];}}
  const id=bag.order[bag.cursor++];bag.last=id;this.inFlight={key,card:deck.deck.cards.find(card=>card.id===id)};this.card=structuredClone(this.inFlight.card);this.state='CARD_DRAWING';return {card:this.card,deck,generation:++this.generation};}
 open(token){if(token!==this.generation||this.state!=='CARD_DRAWING')return false;this.state='WAIT_FOR_CONTINUE';return true;}
 returnCard(){if(this.state!=='WAIT_FOR_CONTINUE')return null;this.state='CARD_RETURNING';return this.generation;}
 finish(token){if(token!==this.generation||this.state!=='CARD_RETURNING')return false;this.recycle();this.state='IDLE';this.card=null;this.required=null;return true;}
 // Visual return/cancellation releases the in-flight card, never rewinds the bag.
 recycle(){this.inFlight=null;}
 cancel(){this.recycle();this.generation++;this.state='IDLE';this.card=null;this.required=null;}
}
