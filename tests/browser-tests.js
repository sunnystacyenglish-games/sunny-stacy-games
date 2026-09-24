import {setRepository,newId} from '../shared/sets.js';
import {exportSet,importSet,parseImport} from '../shared/transfer.js';
import {readUpload,prepareItems,imageURL} from '../shared/images.js';
import {transact} from '../shared/database.js';
const out=document.querySelector('#result'),created=[];
function assert(value,label){if(!value)throw Error(label);out.textContent+=`PASS: ${label}\n`;}
document.querySelector('#run').onclick=async()=>{
  out.textContent='';document.querySelector('#run').disabled=true;
  try{
    assert(imageURL({type:'upload'})===null,'Upload source can be selected before a file exists');
    const original=await setRepository.get('animals-1');const set=await setRepository.create({...original,name:'__Stage2 automated test',items:original.items.map(item=>({...item,id:newId()}))});created.push(set.id);
    assert((await setRepository.get(set.id)).items.length===13,'Create 13-item set and read it back');
    const canvas=document.createElement('canvas');canvas.width=80;canvas.height=40;canvas.getContext('2d').fillRect(0,0,80,40);
    for(const type of ['image/png','image/jpeg','image/webp']){
      const blob=await new Promise(resolve=>canvas.toBlob(resolve,type));const image=await readUpload(new File([blob],'test-image',{type}));set.items[0].image=image;await setRepository.update(set.id,set);
      const persisted=await setRepository.get(set.id);const rendered=await prepareItems([persisted.items[0]]);assert(rendered[0].image.width===80&&rendered[0].image.height===40,`${type}: upload, save, fresh read, decode for Dobble`);
    }
    set.imageSource='upload';await setRepository.update(set.id,set);assert((await setRepository.get(set.id)).imageSource==='upload','Set-wide image source persists without losing legacy images');
    set.items[0].word='edited cat';await setRepository.update(set.id,set);assert((await setRepository.get(set.id)).items[0].word==='edited cat','Edit survives fresh read');
    const copy=await setRepository.duplicate(set.id);created.push(copy.id);copy.items[0].word='only copy';await setRepository.update(copy.id,copy);assert((await setRepository.get(set.id)).items[0].word==='edited cat','Duplicate is independent');
    assert(copy.items[0].id!==set.items[0].id,'Duplicate has new concept IDs');
    const exported=await exportSet(set);assert(exported.includes('data:image/png;base64,'),'Export embeds uploaded image');
    const imported=await importSet(exported);created.push(imported.id);assert(imported.imageSource==='upload','Image source survives export/import');assert((await prepareItems([imported.items[0]]))[0].image.width===80,'Imported image is portable');
    let invalid=false;try{parseImport('{bad');}catch{invalid=true;}assert(invalid,'Invalid JSON rejected');
    let protectedDemo=false;try{await setRepository.delete('animals-1');}catch{protectedDemo=true;}assert(protectedDemo,'Built-in protected');
    await setRepository.delete(copy.id);assert(await setRepository.get(copy.id)===null&&!!await setRepository.get(set.id),'Delete affects only the chosen user set');
    assert((await setRepository.get('animals-1')).items[0].word==='cat','Built-in remains unchanged');
    const corruptId=newId();created.push(corruptId);await transact('readwrite',store=>store.put({id:corruptId,name:'__Corrupt test',items:null}));const list=await setRepository.list();assert(list.some(s=>s.id==='animals-1')&&!list.some(s=>s.id===corruptId)&&setRepository.warnings.length>0,'Corrupted record is skipped with a warning');
    out.textContent+='ALL CHECKS PASSED\n';
  }catch(error){out.textContent+=`FAIL: ${error.message}\n`;console.error(error);}
  finally{for(const id of created.splice(0))await setRepository.delete(id).catch(()=>{});document.querySelector('#run').disabled=false;}
};
