import {activityRegistry} from './activity/catalog.js';
import {activityRepository,exportBundle,importBundle} from './activity/repository.js';
import {validateActivity} from './activity/definition.js';
import {openDatabase} from './database.js';
import {createEntityId} from './activity/contracts.js';
// Stable author-document IDs remain in the existing store. No copy-on-reference.
const repository=activityRepository(activityRegistry);
export const contentRepository={
 list:()=>repository.list(),
 async get(id){const raw=await repository.get(id);return raw?validateActivity(raw,activityRegistry,{previousDeckCount:raw.content?.data?.decks?.length||0}):null;},
 save:value=>repository.save(value),
 export:value=>exportBundle(value,activityRegistry),
 import:text=>importBundle(text,activityRegistry),
 async duplicate(id){
  const source=await repository.get(id);if(!source)throw Error('This content no longer exists.');
  const copy=validateActivity(source,activityRegistry,{previousDeckCount:source.content?.data?.decks?.length||0});
  copy.id=createEntityId();copy.name=`${source.name.slice(0,110)} — Copy`;
  copy.metadata.createdAt=copy.metadata.updatedAt=new Date().toISOString();
  const db=await openDatabase();
  await new Promise((resolve,reject)=>{const tx=db.transaction(['activities','activityFolders'],'readwrite');tx.objectStore('activities').add(copy);const assignments=tx.objectStore('activityFolders'),request=assignments.get(id);request.onsuccess=()=>{if(request.result)assignments.put({...request.result,id:copy.id});};tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(Error('Could not duplicate this content.'));});
  return copy;
 },
 async delete(id){
  // Asset references can be shared by independent copies; never delete media here.
  const db=await openDatabase();await new Promise((resolve,reject)=>{const tx=db.transaction(['activities','activityFolders'],'readwrite');tx.objectStore('activities').delete(id);tx.objectStore('activityFolders').delete(id);tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(Error('Could not delete this content.'));});
 }
};
export const contentTypes=[['conceptSet','Concept Set','Words and pictures'],['scene','Scene','Background, objects and targets'],['bridge','Bridge','Sequences, gaps and distractors'],['sentenceCorrection','Sentence Correction','Correct and incorrect sentence pairs'],['cardDecks','Card Deck','Cards organised into decks']];
