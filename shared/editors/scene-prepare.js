import {el,action,input,id,preview} from './common.js';
import {imageInput,imageFromURL} from './image-input.js';
import {CONTENT_LIMITS as L} from '../activity/limits.js';

export function prepareSceneContent(c,{next,uploadBackground}) {
 const d=c.data,wrap=el('div','scene-prepare'),left=el('section','scene-background-column'),right=el('section','scene-prompts');
 const changed=()=>{c.changed();c.draw();};
 left.append(imageInput(d.background?'Change background':'+ Add image',uploadBackground));
 if(d.background)left.append(preview(d.background,c.services,'Scene background'));
 const add=async(file,promptId)=>c.work(async()=>{
  if(d.assets.length>=L.scene.assets)throw Error('Maximum 50 Elements reached.');
  const media=await c.services.upload(file,{original:true});
  if(d.assets.length>=L.scene.assets)throw Error('Maximum 50 Elements reached.');
  d.assets.push({id:id(),name:file.name,media,...(promptId?{promptId}:{})});
 },true);
 function thumbnails(host,promptId){
  const images=el('div','scene-prepare-images');
  for(const asset of d.assets.filter(a=>promptId?a.promptId===promptId:!d.targets.some(t=>t.id===a.promptId))){
   const b=action('',()=>{
    const dialog=el('dialog','image-input-dialog scene-image-dialog');
    dialog.append(preview(asset.media,c.services,asset.name),action('Delete image',()=>{
     if(d.objects.some(o=>o.assetId===asset.id)){c.error('Remove its placed Elements in Arrange & Link first.');dialog.close();return;}
     d.assets=d.assets.filter(a=>a.id!==asset.id);dialog.close();changed();
    }),imageInput('Replace Image',file=>c.work(async()=>{asset.media=await c.services.upload(file,{original:true});dialog.querySelector('.editor-image')?.remove();dialog.prepend(preview(asset.media,c.services,asset.name));},true)),action('Close',()=>dialog.close()));
    dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();
   });b.setAttribute('aria-label','View '+asset.name);b.append(preview(asset.media,c.services,asset.name));images.append(b);
  }
  host.append(images);
 }
 function imageArea(host,promptId){
  const picker=imageInput('Add image',file=>add(file,promptId));picker.disabled=d.assets.length>=L.scene.assets;
  host.append(picker);
  const url=input('Image URL','',()=>{});url.querySelector('input').type='url';
  host.append(url,action('Insert URL',()=>c.work(async()=>{await add(await imageFromURL(url.querySelector('input').value),promptId);})));
  host.addEventListener('paste',e=>{const file=[...(e.clipboardData?.items||[])].find(i=>i.kind==='file'&&i.type.startsWith('image/'))?.getAsFile();if(file){e.preventDefault();add(file,promptId).catch(()=>{});}});
  host.addEventListener('dragover',e=>{if([...e.dataTransfer.types].includes('Files'))e.preventDefault();});
  host.addEventListener('drop',e=>{const file=[...e.dataTransfer.files].find(f=>f.type.startsWith('image/'));if(file){e.preventDefault();add(file,promptId).catch(()=>{});}});
  thumbnails(host,promptId);
 }
 right.append(el('h2','','Prompts'));
 for(const t of d.targets){const row=el('div','scene-prompt-row');row.dataset.promptId=t.id;
  row.append(input('Prompt',t.prompt,v=>{t.prompt=v;c.changed();},{area:true}),action('Delete Prompt',()=>{d.targets=d.targets.filter(x=>x.id!==t.id);changed();}));imageArea(row,t.id);right.append(row);
 }
 right.append(action('+ Add Prompt',()=>{d.targets.push({id:id(),prompt:'',answers:[]});changed();},d.targets.length>=L.scene.targets));
 const shared=el('details','scene-unassigned');shared.append(el('summary','','Scene Elements'));imageArea(shared,null);right.append(shared);
 wrap.append(left,right);c.space.append(wrap,action('Next',()=>{
  if(!d.background){c.error('Add a background image.');return;}
  if(!d.targets.length||d.targets.some(t=>!t.prompt.trim())){c.error('Write each Prompt before arranging its Targets.');return;}
  c.error('');next();
 }));
}

