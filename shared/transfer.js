import {validateSet,newId,setRepository} from './sets.js';
const SCHEMA='sunny-stacy-content-set';
function dataURL(blob){return new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('Could not export this image.'));reader.readAsDataURL(blob);});}
export async function exportSet(set){
  const items=await Promise.all(set.items.map(async item=>({...item,image:item.image.type==='upload'?{type:'upload',data:await dataURL(item.image.blob)}:item.image})));
  return JSON.stringify({schema:SCHEMA,version:1,set:{name:set.name,imageSource:set.imageSource,items}},null,2);
}
export function parseImport(text){
  if(text.length>40*1024*1024)throw Error('This JSON file is too large (maximum 40 MB).');
  let parsed;try{parsed=JSON.parse(text);}catch{throw Error('This file is not valid JSON.');}
  if(parsed?.schema!==SCHEMA||parsed?.version!==1||!parsed.set||!Array.isArray(parsed.set.items)||parsed.set.items.length>500)throw Error('Unsupported file. Import a Sunny & Stacy set exported with schema version 1.');
  const items=parsed.set.items.map((item,i)=>{
    let image=item?.image;
    if(image?.type==='upload'){
      const match=typeof image.data==='string'&&image.data.match(/^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)$/);
      if(!match||match[2].length>4*1024*1024)throw Error(`Item ${i+1}: invalid uploaded image.`);
      let bytes;try{bytes=Uint8Array.from(atob(match[2]),char=>char.charCodeAt(0));}catch{throw Error(`Item ${i+1}: invalid image encoding.`);}
      image={type:'upload',blob:new Blob([bytes],{type:match[1]})};
    }
    return {id:item?.id,word:item?.word,image};
  });
  return validateSet({id:'import-validation',name:parsed.set.name,imageSource:parsed.set.imageSource,items});
}
export async function importSet(text){
  const data=parseImport(text);
  for(const item of data.items)if(item.image.type==='upload'){
    const bitmap=await createImageBitmap(item.image.blob).catch(()=>{throw Error(`Image for “${item.word}” is damaged.`);});bitmap.close();
  }
  return setRepository.create({...data,items:data.items.map(item=>({...item,id:newId()}))});
}
