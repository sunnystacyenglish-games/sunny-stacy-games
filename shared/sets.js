import {exampleSets} from '../data/example-sets.js';
import {transact} from './database.js';
export const imageTypes=['image/png','image/jpeg','image/webp'];
export const newId=()=>crypto.randomUUID?.()||`id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const builtins=exampleSets.map(set=>({...set,imageSource:'emoji',builtin:true,items:set.items.map(item=>({...item,image:{type:'emoji',value:item.image}}))}));
export function inferImageSource(set){const types=new Set(set.items.map(item=>item.image.type));return types.size===1?[...types][0]:'mixed';}
export function validateSet(set){
  if(set?.imageSource!==undefined&&!['emoji','url','upload','mixed'].includes(set.imageSource))throw Error('Invalid set image source.');
  if(!set||typeof set.id!=='string'||!set.id||set.id.length>120||typeof set.name!=='string'||!set.name.trim()||set.name.length>120)throw Error('Give your set a name (up to 120 characters).');
  if(!Array.isArray(set.items)||!set.items.length||set.items.length>500)throw Error('A set needs between 1 and 500 items.');
  const ids=new Set();let imageBytes=0;
  for(const [i,item] of set.items.entries()){
    if(!item||typeof item.id!=='string'||!item.id||item.id.length>120||ids.has(item.id))throw Error(`Item ${i+1}: invalid or duplicate ID.`);ids.add(item.id);
    if(typeof item.word!=='string'||!item.word.trim()||item.word.length>120)throw Error(`Item ${i+1}: enter a word (up to 120 characters).`);
    const image=item.image;
    if(!image||!['emoji','url','upload'].includes(image.type))throw Error(`Item ${i+1}: choose an image.`);
    if(image.type==='emoji'&&(typeof image.value!=='string'||!image.value.trim()||image.value.length>40))throw Error(`Item ${i+1}: enter an emoji.`);
    if(image.type==='url'){
      try{const url=new URL(image.value);if(url.protocol!=='https:'||url.username||url.password||url.href.length>4096)throw Error();}catch{throw Error(`Item ${i+1}: use a valid HTTPS image URL.`);}
    }
    if(image.type==='upload'&&(!(image.blob instanceof Blob)||!imageTypes.includes(image.blob.type)||!image.blob.size||image.blob.size>3*1024*1024))throw Error(`Item ${i+1}: upload a PNG, JPEG or WEBP image (stored size up to 3 MB).`);
    if(image.type==='upload')imageBytes+=image.blob.size;
  }
  if(imageBytes>24*1024*1024)throw Error('Uploaded images in one set must total less than 24 MB. Use smaller images or split the set.');
  return set;
}
function cleanSet(data,id){return validateSet({id,name:data.name.trim(),imageSource:data.imageSource||inferImageSource(data),items:data.items.map(item=>({id:item.id,word:item.word.trim(),image:item.image.type==='upload'?{type:'upload',blob:item.image.blob}:{type:item.image.type,value:item.image.value.trim()}})),updatedAt:Date.now()});}
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
