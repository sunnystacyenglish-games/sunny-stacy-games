import {ConceptBag} from '../tic-tac-toe/engine.js';
import {storyItems,sentencePools,timePools} from './pools.js';
export const TIMES=['Present','Past','Future'],ASPECTS=['Simple','Continuous','Perfect'];
export function grammarOptions(time,aspect){return TIMES.flatMap(t=>ASPECTS.filter(a=>(time==='All'||time===t)&&(aspect==='All'||aspect===a)).map(a=>({id:t+' '+a,tense:t,aspect:a})));}
function bag(items,random){if(!items.length)throw Error('No usable concepts');return items.length===1?{next:()=>items[0]}:new ConceptBag(items,random);}
export class DiceTable{
 constructor(mode='story',concepts=[],random=Math.random){if(!['story','concept','sentence'].includes(mode))throw Error('Unknown mode');this.mode=mode;this.random=random;this.dice=[];this.serial=0;this.time='Present';this.aspect='Simple';this.bags={};const pools=mode==='sentence'?sentencePools:{main:mode==='concept'?concepts:storyItems};for(const [key,items] of Object.entries(pools))this.bags[key]=bag(items,random);this.expressionBags=Object.fromEntries(Object.entries(timePools).map(([key,items])=>[key,bag(items,random)]));this.setGrammar(this.time,this.aspect);}
 setGrammar(time,aspect){const options=grammarOptions(time,aspect);if(!options.length)throw Error('Invalid grammar selection');if(time===this.time&&aspect===this.aspect&&this.grammarBag)return;this.time=time;this.aspect=aspect;this.grammarBag=bag(options,this.random);}
 canAdd(category='main'){return this.mode==='sentence'?(category==='time'||!!this.bags[category])&&this.dice.filter(d=>d.category===category).length<3:category==='main'&&this.dice.length<10;}
 draw(category){if(category==='time'){const grammar=this.grammarBag.next(),expression=this.expressionBags[grammar.id].next();return {tense:grammar.tense,aspect:grammar.aspect,label:expression.label,image:expression.image};}const item=this.bags[category].next();return {label:item.word||item.label,image:item.image||{type:'emoji',value:item.emoji},conceptId:item.id};}
 add(category='main'){if(!this.canAdd(category))return null;const die={id:++this.serial,mode:this.mode,category,...this.draw(category),rollState:'rolling',rotation:(this.random()-.5)*8};this.dice.push(die);return die;}
 settle(id){const die=this.dice.find(d=>d.id===id);if(die)die.rollState='settled';}
 reroll(id){const die=this.dice.find(d=>d.id===id);if(!die||die.rollState!=='settled')return null;Object.assign(die,this.draw(die.category),{rollState:'rolling',rotation:(this.random()-.5)*8});return die;}
 remove(id){this.dice=this.dice.filter(d=>d.id!==id);}
 clear(){this.dice=[];}
}
