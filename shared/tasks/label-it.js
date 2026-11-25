import {entityIndex,normalizedRect} from '../activity/contracts.js';
import {validateMediaRef} from '../activity/media.js';

export const normalizeLabel=(value,caseSensitive=false)=>{const text=String(value??'').trim().replace(/\s+/gu,' ');return caseSensitive?text:text.toLowerCase();};
export function acceptedLabels(text,{preserveCase=false}={}){
 const seen=new Set();return String(text).split(/\r?\n/).map(s=>s.trim()).filter(s=>{const key=normalizeLabel(s,preserveCase);if(!key||seen.has(key))return false;seen.add(key);return true;});
}
export function validateLabels(data){
 validateMediaRef(data?.background);
 if(!Array.isArray(data.targets)||!data.targets.length)throw Error('Add at least one target hotspot.');
 entityIndex(data.targets);
 for(const target of data.targets){normalizedRect(target);if(!target.width||!target.height)throw Error('Target hotspots need a visible size.');if(!Array.isArray(target.acceptedAnswers)||!target.acceptedAnswers.length||target.acceptedAnswers.some(s=>typeof s!=='string'||!normalizeLabel(s)))throw Error('Enter accepted answers for every hotspot.');}
 return data;
}
export class LabelTask {
 constructor(data,{caseSensitive=false}={}){validateLabels(data);this.caseSensitive=caseSensitive===true;this.source=structuredClone(data);this.selected=null;this.entries=new Map(data.targets.map(t=>[t.id,{text:'',status:'empty'}]));}
 select(id){if(!this.entries.has(id))return false;this.selected=id;return true;}
 write(text){const e=this.entries.get(this.selected);if(!e||['correct','revealed'].includes(e.status))return false;e.text=text;e.status=text.trim()?'pending':'empty';return true;}
 check(id=this.selected){const e=this.entries.get(id);if(!e||['correct','revealed'].includes(e.status))return false;if(!normalizeLabel(e.text)){e.status='empty';return false;}e.status=this.source.targets.find(t=>t.id===id).acceptedAnswers.some(a=>normalizeLabel(a,this.caseSensitive)===normalizeLabel(e.text,this.caseSensitive))?'correct':'incorrect';return e.status==='correct';}
 checkAll(){for(const id of this.entries.keys())this.check(id);return this.complete;}
 reveal(){const e=this.entries.get(this.selected);if(!e||e.status==='correct')return false;e.text=this.source.targets.find(t=>t.id===this.selected).acceptedAnswers[0];e.status='revealed';return true;}
 get completed(){return [...this.entries.values()].filter(e=>e.status==='correct').length;}
 get complete(){return this.completed===this.entries.size;}
}
