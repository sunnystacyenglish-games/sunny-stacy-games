import {imageTypes} from './sets.js';
const urls=new Map();
export function imageURL(image){
  if(image.type==='url')return image.value;
  if(image.type==='upload'){if(!(image.blob instanceof Blob))return null;if(!urls.has(image.blob))urls.set(image.blob,URL.createObjectURL(image.blob));return urls.get(image.blob);}
  return null;
}
addEventListener('pagehide',()=>{for(const url of urls.values())URL.revokeObjectURL(url);urls.clear();});
export function showImage(host,image,word='Image'){
  host.replaceChildren();host.classList.remove('image-error');
  if(image?.type==='emoji'){host.textContent=image.value||'＋';return;}
  const src=image&&imageURL(image);if(!src){host.textContent='＋';return;}
  const img=new Image();img.alt=word;img.referrerPolicy='no-referrer';img.src=src;
  img.onerror=()=>{host.textContent='Image unavailable — replace it';host.classList.add('image-error');};host.append(img);
}
export async function readUpload(file){
  if(!file||!imageTypes.includes(file.type))throw Error('Choose a PNG, JPEG or WEBP image.');
  if(file.size>10*1024*1024)throw Error('Choose an image smaller than 10 MB.');
  const bitmap=await createImageBitmap(file).catch(()=>{throw Error('This image could not be read. Try another file.');});
  try{
    const scale=Math.min(1,512/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');
    canvas.width=Math.max(1,Math.round(bitmap.width*scale));canvas.height=Math.max(1,Math.round(bitmap.height*scale));canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob)throw Error('Could not process the image.');return {type:'upload',blob};
  }finally{bitmap.close();}
}
export async function prepareItems(items){
  return Promise.all(items.map(async item=>{
    if(item.image.type==='emoji')return {...item,image:item.image.value};
    const src=imageURL(item.image);
    const dimensions=await new Promise((resolve,reject)=>{
      const image=new Image();const timeout=setTimeout(()=>reject(Error(`Image for “${item.word}” took too long to load. Replace it in My Sets or try again.`)),10000);
      image.referrerPolicy='no-referrer';image.onload=()=>{clearTimeout(timeout);resolve({width:image.naturalWidth,height:image.naturalHeight});};image.onerror=()=>{clearTimeout(timeout);reject(Error(`Image for “${item.word}” could not load. Replace it in My Sets.`));};image.src=src;
    });
    return {...item,image:{src,...dimensions}};
  }));
}
