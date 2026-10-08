import {validateDecks} from '../../shared/editors/models.js';
// Session snapshots retain author IDs/content; no mutation of Content Studio records.
export function deckKey(documentId,deckId){return JSON.stringify([documentId,deckId]);}
export function availableDecks(documents){return documents.filter(d=>d.content?.type==='cardDecks').flatMap(d=>(d.content.data?.decks||[]).map(deck=>({key:deckKey(d.id,deck.id),documentId:d.id,documentName:d.name,deck:structuredClone(deck)})));}
export function validateSelectedDecks(decks){if(decks.length<1||decks.length>5)throw Error('Choose 1–5 decks.');const seen=new Set();for(const entry of decks){if(seen.has(entry.key))throw Error('A deck is selected twice.');seen.add(entry.key);try{validateDecks({decks:[entry.deck]});if(!entry.deck.cards.length)throw Error('This deck has no cards.');}catch(error){throw Error(entry.deck.name+': '+error.message);}for(const other of decks){if(other===entry)break;if(similarColors(other.deck.color,entry.deck.color))throw Error('Choose more distinct colors for '+other.deck.name+' and '+entry.deck.name+'.');}}return structuredClone(decks);}
function lab(hex){const c=hex.slice(1).match(/../g).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4),l=Math.cbrt(.4122214708*c[0]+.5363325363*c[1]+.0514459929*c[2]),m=Math.cbrt(.2119034982*c[0]+.6806995451*c[1]+.1073969566*c[2]),s=Math.cbrt(.0883024619*c[0]+.2817188376*c[1]+.6299787005*c[2]);return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];}
export function similarColors(a,b){const x=lab(a),y=lab(b);return Math.hypot(...x.map((v,i)=>v-y[i]))<.12;}
export function assignDeckSpaces(size,decks,specials){let cursor=0;return Array.from({length:size},(_,index)=>Object.hasOwn(specials,index)?{type:'boost',effect:specials[index]}:{type:'deck',deckKey:decks[cursor++%decks.length].key});}
export function deckPositions(count){if(count===1)return [[.5,.5]];if(count===2)return [[.25,.5],[.75,.5]];if(count===3)return [[.25,.22],[.75,.22],[.5,.78]];if(count===4)return [[.25,.25],[.75,.25],[.25,.75],[.75,.75]];if(count===5)return [[.2,.18],[.8,.18],[.2,.82],[.8,.82],[.5,.5]];throw Error('Choose 1–5 decks.');}
export function deckComposition(count,areaWidth,areaHeight){
 const positions=deckPositions(count).map(([x,y])=>[(.5+(x-.5)*.9)*areaWidth,y*areaHeight]);
 let width=Math.min(138,areaWidth*(count===1?.5:count===5?.30:.38),areaHeight*(count<=2?.75:.29)*.78);
 const fits=w=>positions.every(([x,y],i)=>x-w/2>=0&&y-w/.78/2>=0&&x+w/2+7<=areaWidth&&y+w/.78/2+7<=areaHeight&&positions.slice(0,i).every(([a,b])=>Math.abs(x-a)>=w+9||Math.abs(y-b)>=w/.78+9));
 while(width>1&&!fits(width))width*=.97;
 return {positions,width,height:width/.78};
}
export class DeckSession{
 constructor(decks,random=Math.random){this.decks=validateSelectedDecks(decks);this.random=random;this.state='IDLE';this.generation=0;this.pools=new Map(this.decks.map(d=>[d.key,[...d.deck.cards]]));}
 wait(key){if(this.state!=='IDLE')return false;if(!this.decks.some(d=>d.key===key))throw Error('Required deck is unavailable.');this.required=key;this.state='WAIT_FOR_DRAW';return true;}
 draw(key){if(this.state!=='WAIT_FOR_DRAW'||key!==this.required)return null;const deck=this.decks.find(d=>d.key===key);const pool=this.pools.get(key);this.inFlight={key,card:pool.splice(Math.min(pool.length-1,Math.floor(this.random()*pool.length)),1)[0]};this.card=structuredClone(this.inFlight.card);this.state='CARD_DRAWING';return {card:this.card,deck,generation:++this.generation};}
 open(token){if(token!==this.generation||this.state!=='CARD_DRAWING')return false;this.state='WAIT_FOR_CONTINUE';return true;}
 returnCard(){if(this.state!=='WAIT_FOR_CONTINUE')return null;this.state='CARD_RETURNING';return this.generation;}
 finish(token){if(token!==this.generation||this.state!=='CARD_RETURNING')return false;this.recycle();this.state='IDLE';this.card=null;this.required=null;return true;}
 recycle(){if(!this.inFlight)return;const pool=this.pools.get(this.inFlight.key);pool.push(this.inFlight.card);for(let i=pool.length-1;i>0;i--){const j=Math.min(i,Math.floor(this.random()*(i+1)));[pool[i],pool[j]]=[pool[j],pool[i]];}this.inFlight=null;}
 cancel(){this.recycle();this.generation++;this.state='IDLE';this.card=null;this.required=null;}
}
