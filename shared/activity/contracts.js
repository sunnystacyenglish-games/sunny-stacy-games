// JSON boundaries reject lossy serialization, prototype keys and excessive nesting.
export function jsonCopy(value, depth=0){
 if(depth>64)throw Error('Content is nested too deeply.');
 if(value===null||typeof value==='string'||typeof value==='boolean')return value;
 if(typeof value==='number'&&Number.isFinite(value))return value;
 if(Array.isArray(value))return value.map(v=>jsonCopy(v,depth+1));
 if(value&&Object.getPrototypeOf(value)===Object.prototype){const out={};for(const [k,v] of Object.entries(value)){if(['__proto__','prototype','constructor'].includes(k))throw Error('Unsafe content key.');out[k]=jsonCopy(v,depth+1);}return out;}
 throw Error('Activity data must be portable JSON. Use media references for files.');
}
export function record(value,label='Value'){if(!value||Array.isArray(value)||typeof value!=='object')throw Error(label+' must be an object.');return value;}
export function stableId(value){if(typeof value!=='string'||!value.trim()||value.length>120)throw Error('Invalid stable ID.');return value;}
export const createEntityId=()=>crypto.randomUUID();
export function freeze(value){if(value&&typeof value==='object'&&!Object.isFrozen(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
export function entityIndex(entities){const result=new Map();for(const entity of entities){const id=stableId(entity.id);if(result.has(id))throw Error('Duplicate entity ID: '+id);result.set(id,entity);}return result;}
export function validateReferences(ids,index){if(!Array.isArray(ids))throw Error('References must be an array.');for(const id of ids)if(!index.has(stableId(id)))throw Error('Missing reference: '+id);return ids;}
export function normalizedRect(rect){for(const key of ['x','y','width','height'])if(!Number.isFinite(rect?.[key])||rect[key]<0||rect[key]>1)throw Error('Layout must use normalized coordinates.');if(rect.x+rect.width>1||rect.y+rect.height>1)throw Error('Layout exceeds its container.');return {...rect};}
export function migrate(value,current,steps,versionKey='schemaVersion'){
 let copy=jsonCopy(value);let version=copy?.[versionKey];if(!Number.isInteger(version)||version<1||version>current)throw Error('Unsupported schema version.');
 while(version<current){const step=steps?.[version];if(typeof step!=='function')throw Error('Missing migration from version '+version);copy=jsonCopy(step(copy));if(copy[versionKey]!==version+1)throw Error('Migration must advance one version.');version++;}return copy;
}
