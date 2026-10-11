export const LIBRARY_TYPES=[['conceptSet','Concepts'],['cardDecks','Card Decks'],['bridge','Bridges'],['scene','Scenes'],['sentenceCorrection','Sentence Correction']];
export function libraryItems(sets,activities,assignments=new Map()){
 return [...sets.map(record=>({id:record.id,key:'set:'+record.id,kind:'set',type:'conceptSet',name:record.name,folderId:record.folderId??null,createdAt:record.createdAt,updatedAt:record.updatedAt,record})),...activities.map(record=>({id:record.id,key:'activity:'+record.id,kind:'activity',type:record.content?.type,name:record.name||'Untitled',folderId:assignments.get(record.id)??null,createdAt:record.metadata?.createdAt,updatedAt:record.metadata?.updatedAt,record}))];
}
const timestamp=value=>typeof value==='number'&&Number.isFinite(value)?value:typeof value==='string'&&Number.isFinite(Date.parse(value))?Date.parse(value):0;
export function sortLibrary(items,sort='edited'){
 const name=(a,b)=>(a.name||'').localeCompare(b.name||'',undefined,{sensitivity:'base',numeric:true})||String(a.key||a.id).localeCompare(String(b.key||b.id));
 return [...items].sort((a,b)=>sort==='az'?name(a,b):sort==='za'?-name(a,b):(timestamp(b[sort==='created'?'createdAt':'updatedAt'])-timestamp(a[sort==='created'?'createdAt':'updatedAt'])||name(a,b)));
}
export function selectLibrary(items,{folderId=null,type='',search='',sort='edited',folders=[]}={}){
 const known=new Set(folders.map(f=>f.id)),query=search.trim().toLocaleLowerCase();
 return sortLibrary(items.filter(item=>(known.has(item.folderId)?item.folderId:null)===folderId&&(!type||item.type===type)&&item.name.toLocaleLowerCase().includes(query)),sort);
}
const count=(n,one,many=one+'s')=>`${n} ${n===1?one:many}`;
export function contentStats(item){const data=item.record.content?.data||{};switch(item.type){case 'conceptSet':return count(item.record.items?.length||0,'item');case 'scene':return count(data.targets?.length||0,'target');case 'bridge':return count(data.bridges?.length||0,'bridge');case 'sentenceCorrection':return count(data.sentences?.length||0,'pair');case 'cardDecks':{const decks=Array.isArray(data.decks)?data.decks:[];return count(decks.length,'deck')+' · '+count(decks.reduce((sum,d)=>sum+(d.cards?.length||0),0),'card');}default:return 'Content';}}
