import {exampleSets} from '../data/example-sets.js';
import {transact} from './database.js';
import {validateSet,validatePlayableSet} from './content-rules.js';
export {validateSet,imageTypes} from './content-rules.js';
export const newId=()=>crypto.randomUUID?.()||`id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const builtins=exampleSets.map(set=>({...set,imageSource:'emoji',builtin:true,items:set.items.map(item=>({...item,image:{type:'emoji',value:item.image}}))}));
export function inferImageSource(set){const types=new Set(set.items.map(item=>item.image.type));return types.size===1?[...types][0]:'mixed';}

function cleanSet(data,id){return validatePlayableSet({id,name:data.name.trim(),imageSource:data.imageSource||inferImageSource(data),items:data.items.map(item=>({id:item.id,word:item.word.trim(),image:item.image.type==='upload'?{type:'upload',blob:item.image.blob}:{type:item.image.type,value:item.image.value.trim()}})),updatedAt:Date.now()});}
export const setRepository={
  warnings:[],
  async list(){
    this.warnings=[];let users=[];
    try{const records=await transact('readonly',store=>store.getAll());for(const record of records){try{users.push(validateSet(record));}catch{this.warnings.push('A damaged saved set could not be opened. Other sets are still available.');}}}
    catch(error){this.warnings.push(error.message);}
    return [...structuredClone(builtins),...users.sort((a,b)=>b.updatedAt-a.updatedAt)];
  },
  async get(id){const demo=builtins.find(set=>set.id===id);if(demo)return structuredClone(demo);const set=await transact('readonly',store=>store.get(id));return set?validateSet(set):null;},
  async create(data){const set=cleanSet(data,newId());await transact('readwrite',store=>store.add(set));return set;},
  async update(id,data){if(builtins.some(set=>set.id===id))throw Error('Make a copy to edit this built-in set.');if(!await this.get(id))throw Error('This set no longer exists. Save a new copy.');const set=cleanSet(data,id);await transact('readwrite',store=>store.put(set));return set;},
  async duplicate(id){const source=await this.get(id);if(!source)throw Error('Set not found.');return this.create({...source,name:`${source.name.slice(0,110)} — Copy`,items:source.items.map(item=>({...item,id:newId()}))});},
  async delete(id){if(builtins.some(set=>set.id===id))throw Error('Built-in sets cannot be deleted.');await transact('readwrite',store=>store.delete(id));}
};
