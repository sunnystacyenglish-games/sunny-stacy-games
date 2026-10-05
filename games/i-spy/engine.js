import {normalizeGameplay} from './activity.js';
import {normalizedRect} from '../../shared/activity/contracts.js';
export const TARGET_TRANSITION_MS=650;
// Repair only detached runtime data; never write sanitization to the author document.
export function prepareScene(source){
 if(!source||typeof source!=='object'||!source.background)throw Error('This scene needs a background. Open it in Content Studio.');
 const ids=new Set(),objects=[];for(const raw of Array.isArray(source.objects)?source.objects:[]){try{if(typeof raw?.id!=='string'||!raw.id||ids.has(raw.id)||typeof raw.assetId!=='string')continue;normalizedRect(raw);if(!raw.width||!raw.height)continue;ids.add(raw.id);objects.push(structuredClone(raw));}catch{}}
 const targets=[],seen=new Set();for(const raw of Array.isArray(source.targets)?source.targets:[]){if(typeof raw?.id!=='string'||!raw.id||seen.has(raw.id)||typeof raw.prompt!=='string'||!raw.prompt.trim()||!Array.isArray(raw.objectIds))continue;const objectIds=[...new Set(raw.objectIds.filter(id=>ids.has(id)))];if(!objectIds.length)continue;seen.add(raw.id);targets.push({id:raw.id,prompt:raw.prompt.trim(),objectIds});}
 if(!targets.length)throw Error('This scene has no playable targets. Add a prompt and select at least one scene object in Content Studio.');
 return {background:structuredClone(source.background),assets:structuredClone(Array.isArray(source.assets)?source.assets:[]),objects,targets,skippedTargets:(Array.isArray(source.targets)?source.targets.length:0)-targets.length};
}
export class SpySession{
 constructor(source,settings={},random=Math.random){this.scene=prepareScene(source);this.settings=normalizeGameplay(settings);this.targetOrder=this.scene.targets.map(t=>t.id);if(this.settings.targetOrder==='shuffle')for(let i=this.targetOrder.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[this.targetOrder[i],this.targetOrder[j]]=[this.targetOrder[j],this.targetOrder[i]];}this.activeTargetIndex=0;this.foundByTarget=new Map(this.targetOrder.map(id=>[id,new Set()]));this.isTransitioning=false;this.sessionComplete=false;}
 get target(){return this.scene.targets.find(t=>t.id===this.targetOrder[this.activeTargetIndex]);}
 get found(){return this.foundByTarget.get(this.target?.id)||new Set();}
 hit(objectId){if(this.sessionComplete||this.isTransitioning)return {kind:'ignored'};if(!this.scene.objects.some(o=>o.id===objectId))return {kind:'ignored'};if(this.found.has(objectId))return {kind:'already-found'};if(!this.target.objectIds.includes(objectId))return {kind:'wrong'};this.found.add(objectId);const completed=this.found.size===this.target.objectIds.length;if(completed)this.isTransitioning=true;return {kind:'correct',completed};}
 advance(){if(!this.isTransitioning||this.sessionComplete)return false;this.isTransitioning=false;if(this.activeTargetIndex+1===this.targetOrder.length){this.sessionComplete=true;return true;}this.activeTargetIndex++;return true;}
}
