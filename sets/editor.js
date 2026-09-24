import {setRepository,newId,validateSet,inferImageSource} from '../shared/sets.js';
import {showImage,readUpload} from '../shared/images.js';
import {element,button,message,confirmDialog,chooseGame} from '../shared/ui.js';
let current={id:newId(),name:'',imageSource:'emoji',items:[]},savedId=null,dirty=false,pendingUploads=0,revision=0;
const $=id=>document.getElementById(id);
const uploadVersions=new WeakMap();
let activeItemId=null;
async function assignImage(item,file){const attempt=(uploadVersions.get(item)||0)+1;uploadVersions.set(item,attempt);pendingUploads++;$('saveSet').disabled=true;try{const image=await readUpload(file);if(attempt===uploadVersions.get(item)&&current.items.includes(item)){item.image=image;const livePreview=[...$('items').children].find(row=>row.dataset.id===item.id)?.querySelector('.preview');if(livePreview){showImage(livePreview,image,item.word);livePreview.closest('.item-row').querySelector('.source-retained')?.remove();}message('Image added.');changed();}}catch(error){message(error.message,true);}finally{pendingUploads--;$('saveSet').disabled=pendingUploads>0;}}
function activate(id){activeItemId=id;for(const row of $('items').children)row.classList.toggle('is-active',row.dataset.id===id);}
document.addEventListener('paste',event=>{
  if(document.querySelector('dialog[open]')||$('editorContent').hidden)return;
  const item=current.items.find(item=>item.id===activeItemId);
  const entry=[...(event.clipboardData?.items||[])].find(entry=>entry.kind==='file'&&entry.type.startsWith('image/'));
  const file=entry?.getAsFile();
  if(file&&item){event.preventDefault();assignImage(item,file);}
});
function changed(){revision++;dirty=true;$('saveState').textContent='Unsaved changes';$('playSet').hidden=true;warnings();}
function warnings(){const words=current.items.map(item=>item.word.trim().toLowerCase()).filter(Boolean);$('duplicateWarning').textContent=new Set(words).size<words.length?'Some words repeat. They are separate concepts; consider using different words and pictures for a clear Dobble match.':'';}
function field(label,input){const wrapper=element('label','',label);wrapper.append(input);return wrapper;}
function draw(){
  $('items').replaceChildren();
  current.items.forEach((item,index)=>{
    const row=element('div','item-row');row.dataset.id=item.id;row.classList.toggle('is-active',item.id===activeItemId);row.addEventListener('pointerdown',()=>activate(item.id));row.addEventListener('focusin',()=>activate(item.id));row.append(element('span','number',`${index+1}`));
    const word=element('input');word.value=item.word;word.maxLength=120;word.setAttribute('aria-label',`Word ${index+1}`);word.oninput=()=>{item.word=word.value;changed();};row.append(field('Word',word));
    const inputHost=element('div','source-field'),preview=element('div','preview');preview.setAttribute('aria-label',`Preview ${index+1}`);
    const sourceType=current.imageSource==='mixed'?item.image.type:current.imageSource;
    function sourceInput(){
      inputHost.replaceChildren();showImage(preview,item.image,item.word);
      if(sourceType==='upload'){
        const input=element('input');input.type='file';input.accept='image/png,image/jpeg,image/webp';input.setAttribute('aria-label',`Upload image ${index+1}`);

        input.onchange=()=>{if(input.files[0])assignImage(item,input.files[0]);input.value='';};
        const zone=element('div','drop-zone','Drop or paste image');zone.tabIndex=0;zone.setAttribute('role','group');zone.setAttribute('aria-label',`Paste or drop image ${index+1}`);
        const actions=element('div','row');actions.append(button('Browse / Replace',()=>input.click()),button('Remove',()=>{uploadVersions.set(item,(uploadVersions.get(item)||0)+1);item.image={type:'upload'};inputHost.querySelector('.source-retained')?.remove();changed();showImage(preview,item.image,item.word);}));
        zone.append(actions);input.hidden=true;zone.append(input);
        zone.addEventListener('click',event=>{if(event.target===zone)input.click();});
        zone.addEventListener('keydown',event=>{if(event.target===zone&&(event.key==='Enter'||event.key===' ')){event.preventDefault();input.click();}});
        zone.addEventListener('dragover',event=>{event.preventDefault();zone.classList.add('dragging');});zone.addEventListener('dragleave',()=>zone.classList.remove('dragging'));
        zone.addEventListener('drop',event=>{event.preventDefault();zone.classList.remove('dragging');const file=[...(event.dataTransfer?.files||[])].find(file=>file.type.startsWith('image/'));if(file)assignImage(item,file);else message('Drop a PNG, JPEG or WEBP image.',true);});
        inputHost.append(zone);
      }else{
        const input=element('input');input.value=item.image.type===sourceType?(item.image.value||''):'';input.maxLength=sourceType==='emoji'?40:4096;input.placeholder=sourceType==='emoji'?'🐱':'https://…';input.setAttribute('aria-label',`${sourceType==='emoji'?'Emoji':'Image URL'} ${index+1}`);
        let timer;input.oninput=()=>{item.image={type:sourceType,value:input.value};inputHost.querySelector('.source-retained')?.remove();changed();clearTimeout(timer);timer=setTimeout(()=>{if(item.image.type==='url'&&!/^https:\/\//i.test(item.image.value)){preview.textContent='Use HTTPS';return;}showImage(preview,item.image,item.word);},item.image.type==='emoji'?0:350);};inputHost.append(field(sourceType==='emoji'?'Emoji':'Image URL',input));
      }
    }
    sourceInput();if(item.image.type!==sourceType)inputHost.append(element('p','help source-retained','Previous image kept until you replace it.'));
    row.append(inputHost,preview,button('Delete item',()=>{current.items=current.items.filter(other=>other.id!==item.id);if(activeItemId===item.id)activeItemId=null;changed();draw();},'danger'));$('items').append(row);
  });warnings();
}
$('addItem').onclick=()=>{if(current.items.length>=500){message('This set has reached the 500-item limit.',true);return;}current.items.push({id:newId(),word:'',image:{type:current.imageSource==='mixed'?'emoji':current.imageSource,value:''}});changed();draw();$('items').lastElementChild.querySelector('input').focus();};
$('setName').oninput=()=>{current.name=$('setName').value;changed();};
$('editorForm').onsubmit=async event=>{
  event.preventDefault();if($('editorContent').hidden){$('continueEditor').click();return;}if(pendingUploads)return;
  $('saveSet').disabled=true;const savingRevision=revision;
  try{validateSet(current);const saved=savedId?await setRepository.update(savedId,current):await setRepository.create(current);savedId=saved.id;if(revision!==savingRevision){message('Saved the earlier version. Your latest changes are still unsaved.');return;}current=saved;dirty=false;draw();history.replaceState(null,'',`editor.html?id=${encodeURIComponent(savedId)}`);$('editorTitle').textContent='Edit Set';$('saveState').textContent='Saved';$('playSet').hidden=false;message('Saved. Your set is ready in My Sets.');}
  catch(error){message(error.message,true);}finally{$('saveSet').disabled=false;}
};
$('playSet').onclick=()=>chooseGame(current);
addEventListener('beforeunload',event=>{if(dirty){event.preventDefault();event.returnValue='';}});
document.addEventListener('click',async event=>{const link=event.target.closest('a[href]');if(!link||!dirty||event.ctrlKey||event.metaKey)return;event.preventDefault();if(await confirmDialog('Leave without saving?','Your latest changes have not been saved.','Leave')){dirty=false;location.href=link.href;}});
async function initialize(){
  const id=new URLSearchParams(location.search).get('id');
  if(id){const set=await setRepository.get(id);if(!set)throw Error('This set was not found. Return to My Sets or create a new set.');current=set;
    if(set.builtin){current={...set,id:newId(),name:`${set.name} — Copy`,items:set.items.map(item=>({...item,id:newId()}))};delete current.builtin;message('You are editing a copy. The built-in set stays unchanged.');}
    else{savedId=set.id;$('editorTitle').textContent='Edit Set';$('playSet').hidden=false;}
  }else current.items=[{id:newId(),word:'',image:{type:'emoji',value:''}}];
  current.imageSource ||= inferImageSource(current);
  if(current.imageSource==='mixed'){const option=element('option','','Existing mixed sources');option.value='mixed';$('imageSource').append(option);}
  $('imageSource').value=current.imageSource;$('setName').value=current.name;
  $('editorContent').hidden=!id;$('continueEditor').hidden=!!id;draw();
}
initialize().catch(error=>{message(error.message,true);$('editorForm').hidden=true;});

$('continueEditor').onclick=()=>{if(!$('setName').reportValidity())return;$('editorContent').hidden=false;$('continueEditor').hidden=true;draw();};
$('imageSource').onchange=async()=>{
  const next=$('imageSource').value;$('imageSource').value=current.imageSource;
  if(pendingUploads){message('Wait for image processing to finish before changing the source.',true);return;}
  const hasImages=current.items.some(item=>item.image.blob||item.image.value);
  if(hasImages&&!await confirmDialog('Change image source?','Existing images will be kept until you replace them. All item controls will use the new format.','Change'))return;
  current.imageSource=next;$('imageSource').value=next;
  for(const item of current.items)if(!item.image.blob&&!item.image.value)item.image={type:next,value:''};
  changed();draw();
};
