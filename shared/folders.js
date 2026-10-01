import {openDatabase,transact} from './database.js';
import {exampleSets} from '../data/example-sets.js';

// Organisation is separate from content, including built-in sets. An absent
// assignment means root; upgrading the database never rewrites existing sets.
const id=()=>crypto.randomUUID?.()||`folder-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const FOLDER_COLORS=[['Gold','#D5A52C'],['Orange','#D57536'],['Coral','#C76565'],['Burgundy','#914456'],['Purple','#9070BC'],['Blue','#4E83BC'],['Teal','#3E9292'],['Green','#65934C']];
export const DEFAULT_FOLDER_COLOR=FOLDER_COLORS[0][1];
function folderColor(value=DEFAULT_FOLDER_COLOR){if(typeof value!=='string'||!/^#[0-9a-f]{6}$/i.test(value))throw Error('Choose a valid folder colour.');return value.toUpperCase();}
function folderName(value){if(typeof value!=='string'||!value.trim()||value.trim().length>120)throw Error('Enter a folder name (up to 120 characters).');return value.trim();}
async function write(action){
 const db=await openDatabase();
 return new Promise((resolve,reject)=>{
  const tx=db.transaction(['sets','folders','setFolders'],'readwrite');let failure,result;
  const stores=Object.fromEntries(['sets','folders','setFolders'].map(name=>[name,tx.objectStore(name)]));
  const abort=text=>{failure=Error(text);tx.abort();};
  tx.oncomplete=()=>resolve(result);tx.onabort=tx.onerror=()=>reject(failure||Error('Could not save library changes. Please try again.'));
  try{action(stores,abort,value=>{result=value;});}catch(error){failure=error;tx.abort();}
 });
}
export async function setFolderAssignments(){const records=await transact('readonly',store=>store.getAll(),'setFolders');return new Map(records.map(record=>[record.id,record.folderId??null]));}
export async function getSetFolderId(setId){return (await transact('readonly',store=>store.get(setId),'setFolders'))?.folderId??null;}
export const folderRepository={
 async list(){return (await transact('readonly',store=>store.getAll(),'folders')).sort((a,b)=>(a.order??0)-(b.order??0)||a.id.localeCompare(b.id));},
 async create(name,color=DEFAULT_FOLDER_COLOR){name=folderName(name);color=folderColor(color);return write(({folders},abort,done)=>{const request=folders.getAll();request.onsuccess=()=>{const folder={id:id(),name,color,order:Math.max(-1,...request.result.map(f=>f.order??0))+1};folders.add(folder);done(folder);};});},
 async rename(folderId,name,color){name=folderName(name);if(color!==undefined)color=folderColor(color);return write(({folders},abort,done)=>{const request=folders.get(folderId);request.onsuccess=()=>{if(!request.result)return abort('This folder no longer exists.');const folder={...request.result,name,...(color===undefined?{}:{color})};folders.put(folder);done(folder);};});},
 async move(setId,folderId=null){
  return write(({sets,folders,setFolders},abort)=>{
   const save=()=>setFolders.put({id:setId,folderId});
   const checkFolder=()=>{if(folderId===null)return save();const target=folders.get(folderId);target.onsuccess=()=>target.result?save():abort('This folder no longer exists.');};
   if(exampleSets.some(set=>set.id===setId))checkFolder();else{const source=sets.get(setId);source.onsuccess=()=>source.result?checkFolder():abort('This set no longer exists.');}
  });
 },
 async delete(folderId){
  // One transaction: assignments return to root and the folder disappears
  // together. Uploaded blobs and content records are never changed or deleted.
  return write(({folders,setFolders})=>{const request=setFolders.getAll();request.onsuccess=()=>{for(const record of request.result)if(record.folderId===folderId)setFolders.put({...record,folderId:null});folders.delete(folderId);};});
 },
 async reorder(folderId,beforeId){return write(({folders},abort)=>{const request=folders.getAll();request.onsuccess=()=>{const ordered=request.result.sort((a,b)=>(a.order??0)-(b.order??0)||a.id.localeCompare(b.id));const source=ordered.find(folder=>folder.id===folderId),target=ordered.find(folder=>folder.id===beforeId);if(!source||!target)return abort('This folder no longer exists.');if(source===target)return;const rest=ordered.filter(folder=>folder!==source);rest.splice(rest.indexOf(target),0,source);rest.forEach((folder,order)=>folders.put({...folder,order}));};});}
};
