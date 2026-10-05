import {normalizeGameplay} from './activity.js';
import {normalizedRect} from '../../shared/activity/contracts.js';
import {upgradeScene,objectRect} from '../../shared/activity/scene.js';
export const TARGET_TRANSITION_MS=650;
export function prepareScene(source){
 if(!source||typeof source!=='object'||!source.background)throw Error('This scene needs a background. Open it in My Content.');
 const d=upgradeScene(source),objects=[],hotspots=[],ids=new Set(),hids=new Set();
 for(const o of Array.isArray(d.objects)?d.objects:[]){try{if(typeof o?.id!=='string'||!o.id||ids.has(o.id)||typeof o.assetId!=='string')continue;objectRect(o);ids.add(o.id);objects.push(o);}catch{}}
 for(const h of Array.isArray(d.hotspots)?d.hotspots:[]){try{if(typeof h?.id!=='string'||!h.id||hids.has(h.id))continue;normalizedRect(h);if(!h.width||!h.height)continue;hids.add(h.id);hotspots.push(h);}catch{}}
 const targets=[],seen=new Set();for(const t of Array.isArray(d.targets)?d.targets:[]){if(typeof t?.id!=='string'||!t.id||seen.has(t.id)||typeof t.prompt!=='string'||!t.prompt.trim()||!Array.isArray(t.answers))continue;const answerIds=new Set(),refs=new Set(),answers=[];for(const a of t.answers){if(typeof a?.id!=='string'||!a.id||answerIds.has(a.id))continue;const ref=a.type==='object'?a.sceneObjectId:a.hotspotId,key=a.type+':'+ref;if(refs.has(key)||!(a.type==='object'?ids.has(ref):a.type==='hotspot'&&hids.has(ref)))continue;answerIds.add(a.id);refs.add(key);answers.push(a);}if(!answers.length)continue;seen.add(t.id);targets.push({id:t.id,prompt:t.prompt.trim(),answers});}
 if(!targets.length)throw Error('This scene has no playable targets. Add a prompt and at least one object or hotspot answer in My Content.');
 return {background:d.background,assets:Array.isArray(d.assets)?d.assets:[],objects,hotspots,targets,skippedTargets:(Array.isArray(d.targets)?d.targets.length:0)-targets.length};
}
export class SpySession{
 constructor(source,settings={},random=Math.random){this.scene=prepareScene(source);this.settings=normalizeGameplay(settings);this.targetOrder=this.scene.targets.map(t=>t.id);if(this.settings.targetOrder==='shuffle')for(let i=this.targetOrder.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[this.targetOrder[i],this.targetOrder[j]]=[this.targetOrder[j],this.targetOrder[i]];}this.activeTargetIndex=0;this.foundByTarget=new Map(this.targetOrder.map(id=>[id,new Set()]));this.isTransitioning=false;this.sessionComplete=false;}
 get target(){return this.scene.targets.find(t=>t.id===this.targetOrder[this.activeTargetIndex]);}
 get found(){return this.foundByTarget.get(this.target?.id)||new Set();}
 objectFound(id){return this.target.answers.some(a=>a.type==='object'&&a.sceneObjectId===id&&this.found.has(a.id));}
 hit(objectId,x,y){if(this.sessionComplete||this.isTransitioning)return {kind:'ignored'};const objectAnswer=this.target.answers.find(a=>a.type==='object'&&a.sceneObjectId===objectId);let answer=objectAnswer;
 if(!answer&&Number.isFinite(x)&&Number.isFinite(y)&&x>=0&&x<=1&&y>=0&&y<=1){const matches=this.target.answers.filter(a=>{if(a.type!=='hotspot')return false;const h=this.scene.hotspots.find(h=>h.id===a.hotspotId);return x>=h.x&&x<=h.x+h.width&&y>=h.y&&y<=h.y+h.height;});answer=matches.find(a=>!this.found.has(a.id))||matches[0];}
 if(!answer)return {kind:objectId===undefined&&!Number.isFinite(x)?'ignored':'wrong'};if(this.found.has(answer.id))return {kind:'already-found'};this.found.add(answer.id);const completed=this.found.size===this.target.answers.length;if(completed)this.isTransitioning=true;return {kind:'correct',completed,answer};}
 advance(){if(!this.isTransitioning||this.sessionComplete)return false;this.isTransitioning=false;if(this.activeTargetIndex+1===this.targetOrder.length){this.sessionComplete=true;return true;}this.activeTargetIndex++;return true;}
}
