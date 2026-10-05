import {contentRepository} from '../shared/content-library.js';
import {refreshContent} from './content-library.js';
import {chooseSetGame} from '../shared/game-chooser.js';
import {canPlaySet} from '../shared/content-rules.js';
import {setRepository} from '../shared/sets.js';
import {folderRepository,FOLDER_COLORS,DEFAULT_FOLDER_COLOR} from '../shared/folders.js';
import {showImage} from '../shared/images.js';
import {exportSet,importSet} from '../shared/transfer.js';
import {element,button,message,confirmDialog} from '../shared/ui.js';
let currentFolder=new URLSearchParams(location.search).get('folder')||null,folders=[],allSets=[],dragged=null;
const $=id=>document.getElementById(id);
const pointer=()=>matchMedia('(any-pointer: fine)').matches;
function navigate(folderId){currentFolder=folderId;const url=new URL(location.href);if(folderId)url.searchParams.set('folder',folderId);else url.searchParams.delete('folder');history.pushState(null,'',url);return refresh();}
addEventListener('popstate',()=>{currentFolder=new URLSearchParams(location.search).get('folder')||null;run(refresh);});
function clearDrag(){document.querySelectorAll('.dragging,.drop-target').forEach(node=>node.classList.remove('dragging','drop-target'));}
function draggable(node,type,id){
 node.draggable=pointer();node.dataset[type+'Id']=id;
 node.addEventListener('dragstart',event=>{if(!pointer()||event.target.closest('button,a')){event.preventDefault();return;}dragged={type,id};event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('application/x-sunny-library',JSON.stringify(dragged));node.classList.add('dragging');});
 node.addEventListener('dragend',()=>{clearDrag();dragged=null;});
}
function dropTarget(node,folderId,{reorder=false}={}){
 const valid=()=>dragged&&(dragged.type==='set'?allSets.some(set=>set.id===dragged.id&&(set.folderId??null)!==folderId):reorder&&dragged.type==='folder'&&dragged.id!==folderId);
 node.addEventListener('dragover',event=>{if(!valid())return;event.preventDefault();event.dataTransfer.dropEffect='move';clearDrag();node.classList.add('drop-target');});
 node.addEventListener('dragleave',event=>{if(!node.contains(event.relatedTarget))node.classList.remove('drop-target');});
 node.addEventListener('drop',event=>{if(!valid())return;event.preventDefault();event.stopPropagation();const source=dragged;dragged=null;clearDrag();run(async()=>{if(source.type==='set'){await folderRepository.move(source.id,folderId);message('Set moved.');}else await folderRepository.reorder(source.id,folderId);await refresh();});});
}
function nameDialog(title,value='',save,color=DEFAULT_FOLDER_COLOR){
 const dialog=element('dialog','app-dialog library-dialog'),form=element('form'),label=element('label','','Folder name'),input=element('input'),error=element('p','field-error'),actions=element('div','row');
 input.value=value;input.required=true;input.maxLength=120;input.name='folderName';label.append(input);error.setAttribute('role','alert');
 const colors=element('fieldset','folder-colors'),presets=element('div','color-presets'),customLabel=element('label','custom-color','Custom colour'),custom=element('input');colors.append(element('legend','','Folder colour'));custom.type='color';custom.name='folderColor';custom.value=/^#[0-9a-f]{6}$/i.test(color)?color:DEFAULT_FOLDER_COLOR;
 const syncColors=()=>{for(const swatch of presets.children)swatch.setAttribute('aria-pressed',String(swatch.dataset.color.toLowerCase()===custom.value.toLowerCase()));};
 for(const [name,hex] of FOLDER_COLORS){const swatch=button('',()=>{custom.value=hex;syncColors();},'color-swatch');swatch.style.backgroundColor=hex;swatch.dataset.color=hex;swatch.setAttribute('aria-label',name);swatch.title=name;presets.append(swatch);}custom.oninput=syncColors;customLabel.append(custom);colors.append(presets,customLabel);syncColors();
 const submit=button('Save',()=>{},'primary');submit.type='submit';actions.append(button('Cancel',()=>dialog.close()),submit);form.append(element('h2','',title),label,colors,error,actions);dialog.append(form);document.body.append(dialog);
 form.onsubmit=async event=>{event.preventDefault();submit.disabled=true;try{await save(input.value,custom.value);dialog.close();await refresh();}catch(e){error.textContent=e.message;input.focus();}finally{submit.disabled=false;}};
 dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();input.focus();input.select();
}
async function deleteFolder(folder){
 if(!await confirmDialog(`Delete “${folder.name}”?`,'Only the folder will be deleted. All sets inside it will be moved back to My Content. No sets will be deleted.','Delete folder'))return;
 await folderRepository.delete(folder.id);if(currentFolder===folder.id)await navigate(null);else await refresh();message('Folder deleted. Its sets are in My Content.');
}
function folderControls(folder){const edit=title=>nameDialog(title,folder.name,(name,color)=>folderRepository.rename(folder.id,name,color),folder.color);return [button('Rename',()=>edit('Rename folder')),button('Colour',()=>edit('Folder colour')),button('Delete folder',()=>run(()=>deleteFolder(folder)),'danger')];}
function moveDialog(set){
 const dialog=element('dialog','app-dialog library-dialog'),form=element('form'),label=element('label','','Destination'),select=element('select'),error=element('p','field-error'),actions=element('div','row');
 select.name='destination';select.append(new Option('My Content',''));for(const folder of folders)select.append(new Option(folder.name,folder.id));select.value=set.folderId??'';label.append(select);error.setAttribute('role','alert');
 const submit=button('Move',()=>{},'primary');submit.type='submit';actions.append(button('Cancel',()=>dialog.close()),submit);form.append(element('h2','',`Move “${set.name}”`),label,error,actions);dialog.append(form);document.body.append(dialog);
 form.onsubmit=async event=>{event.preventDefault();submit.disabled=true;try{await folderRepository.move(set.id,select.value||null);dialog.close();await refresh();message('Set moved.');}catch(e){error.textContent=e.message;}finally{submit.disabled=false;}};
 dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();select.focus();
}
async function refresh(){
  const [sets,storedFolders]=await Promise.all([setRepository.list(),folderRepository.list().catch(error=>{message(error.message,true);return [];})]);allSets=sets;folders=storedFolders;
  if(currentFolder&&!folders.some(folder=>folder.id===currentFolder)){currentFolder=null;const url=new URL(location.href);url.searchParams.delete('folder');history.replaceState(null,'',url);}
  $('userSets').replaceChildren();$('builtInSets').replaceChildren();$('libraryPath').replaceChildren();$('folderActions').replaceChildren();$('createFolder').hidden=!!currentFolder;$('builtInSection').hidden=!!currentFolder;
  const root=button('My Content',()=>run(()=>navigate(null)));root.setAttribute('aria-current',currentFolder?'false':'page');if(currentFolder)dropTarget(root,null);$('libraryPath').append(root);
  if(currentFolder){const folder=folders.find(folder=>folder.id===currentFolder);$('libraryPath').append(element('span','','›'),element('span','current-folder',folder.name));$('folderActions').append(...folderControls(folder));}
  $('folderHelp').textContent=currentFolder?'Use Move to… to change folders, or drag a set onto My Content to return it to the root.':'Drag sets onto a folder, or use Move to… on any set. Drag a folder onto another to place it before that folder.';
  if(!currentFolder)for(const folder of folders){
   const card=element('article','folder-card');card.setAttribute('aria-label','Folder: '+folder.name);draggable(card,'folder',folder.id);dropTarget(card,folder.id,{reorder:true});
   const open=button('',()=>run(()=>navigate(folder.id)),'folder-open'),icon=document.createElementNS('http://www.w3.org/2000/svg','svg'),path=document.createElementNS('http://www.w3.org/2000/svg','path');icon.classList.add('folder-icon');icon.setAttribute('viewBox','0 0 40 34');icon.setAttribute('aria-hidden','true');path.setAttribute('d','M3 2h12l5 5h17a3 3 0 0 1 3 3v21a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3V5a3 3 0 0 1 3-3Z');icon.append(path);icon.style.color=/^#[0-9a-f]{6}$/i.test(folder.color)?folder.color:DEFAULT_FOLDER_COLOR;open.append(icon,element('span','folder-name',folder.name));
   const count=sets.filter(set=>set.folderId===folder.id).length;card.append(open,element('p','meta',`${count} ${count===1?'set':'sets'}`));const actions=element('div','row');actions.append(...folderControls(folder));card.append(actions);$('userSets').append(card);
  }
  if(setRepository.warnings.length)message(setRepository.warnings.join('\n'),true);
  for(const set of sets){
    const assigned=folders.some(folder=>folder.id===set.folderId)?set.folderId:null;if(assigned!==currentFolder)continue;
    const card=element('article','set-card');card.setAttribute('aria-label',set.name);
    draggable(card,'set',set.id);
    const preview=element('div','previews');for(const item of set.items.slice(0,4)){const host=element('div','preview');showImage(host,item.image,item.word);preview.append(host);}
    card.append(preview,element('h3','',set.name),element('p','meta',`${set.items.length} items${set.builtin?' · Built-in':''}`));
    const actions=element('div','row');const edit=element('a','button',set.builtin?'Edit a copy':'Edit');edit.href=`editor.html?id=${encodeURIComponent(set.id)}`;
    const play=button('Play',()=>chooseSetGame(set),'primary');play.disabled=!canPlaySet(set);if(play.disabled)card.append(element('p','minimum-note','Minimum: 5 valid items. Edit this set to add more.'));
    actions.append(edit,play,button('Duplicate',()=>run(async()=>{await setRepository.duplicate(set.id);await refresh();message('Copy created.');})),button('Export JSON',()=>run(async()=>{
      const json=await exportSet(set);const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));const link=element('a');link.href=url;link.download=`${set.name.replace(/[^a-zA-Z0-9_-]/g,'_')}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('JSON exported, including uploaded images.');
    })));
    actions.append(button('Move to…',()=>moveDialog(set)));
    if(!set.builtin)actions.append(button('Delete',()=>run(async()=>{if(await confirmDialog(`Delete “${set.name}”?`,'This cannot be undone. Export a backup first if you want to keep a copy.')){await setRepository.delete(set.id);await refresh();message('Set deleted.');}}),'danger'));
    card.append(actions);document.querySelector(set.builtin&&!currentFolder?'#builtInSets':'#userSets').append(card);
  }
  if(!$('userSets').children.length){const empty=element('div','empty-state');empty.append(element('h3','',currentFolder?'This folder is empty.':'No sets yet.'),element('p','muted',currentFolder?'Move a set here from My Content using Move to… or drag & drop.':'Create your first vocabulary set and use it in Sunny & Stacy games.'));if(!currentFolder){const link=element('a','button primary','+ Create Set');link.href='editor.html';empty.append(link);}$('userSets').append(empty);}
}
async function run(action){try{await action();}catch(error){message(error.message,true);}}
document.querySelector('#importButton').onclick=()=>document.querySelector('#importFile').click();
$('createFolder').onclick=()=>nameDialog('Create folder','',(name,color)=>folderRepository.create(name,color));
document.querySelector('#importFile').onchange=event=>run(async()=>{const file=event.target.files[0];if(!file)return;try{if(file.size>40*1024*1024)throw Error('Choose a JSON file smaller than 40 MB.');const text=await file.text();let parsed;try{parsed=JSON.parse(text);}catch{throw Error('Invalid JSON.');}if(parsed.format==='sunny-stacy-activity-bundle'){await contentRepository.import(text);await refreshContent();message('Content imported.');return;}const set=await importSet(text);await refresh();message(`Imported “${set.name}” as a new set.`);}finally{event.target.value='';}});
run(refresh);
