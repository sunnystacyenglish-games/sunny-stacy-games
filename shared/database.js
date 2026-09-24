let pending;
export function openDatabase(){
  if(!pending)pending=new Promise((resolve,reject)=>{
    if(!globalThis.indexedDB){reject(Error('Browser storage is unavailable. Open this app in a regular browser window.'));return;}
    const request=indexedDB.open('sunny-stacy-content',1);
    request.onupgradeneeded=()=>request.result.createObjectStore('sets',{keyPath:'id'});
    request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();pending=null;};resolve(db);};
    request.onerror=()=>reject(Error('Cannot open browser storage. Please check your browser privacy settings.'));
    request.onblocked=()=>reject(Error('Close other Sunny & Stacy tabs and try again.'));
  }).catch(error=>{pending=null;throw error;});
  return pending;
}
export async function transact(mode,action){
  const db=await openDatabase();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('sets',mode);const request=action(tx.objectStore('sets'));
    tx.oncomplete=()=>resolve(request.result);
    tx.onerror=tx.onabort=()=>reject(Error(tx.error?.name==='QuotaExceededError'?'Browser storage is full. Export a backup and remove unused sets.':'Could not save or read this set. Your changes are still on screen.'));
  });
}
