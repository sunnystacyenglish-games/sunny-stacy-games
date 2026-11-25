import {validateScene} from '../shared/editors/models.js';
import {CONTENT_LIMITS} from '../shared/activity/limits.js';
import {contentRepository,contentTypes} from '../shared/content-library.js';
import {activityRegistry} from '../shared/activity/catalog.js';
import {activityAssets} from '../shared/activity/repository.js';
import {emptyContent} from '../shared/editors/models.js';
import {createEntityId} from '../shared/activity/contracts.js';
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);let active,editor,dirty=false,busy=0,revision=0;
function capacity(){if(!editor)return;const d=editor.read(),type=active.content.type;const summary={labelIt:()=>`${d.targets.length} target zones`,quiz:()=>`${d.questions.length} ${d.questions.length===1?'question':'questions'}`,scene:()=>`${d.assets.length} / 50 elements · ${d.objects.length} / 50 placed objects · ${d.hotspots?.length||0} / 100 hotspots · ${d.targets.length} / 20 prompts`,bridge:()=>`${d.bridges.length} / 20 bridges`,sentenceCorrection:()=>`${d.sentences.length} / 30 sentences`,cardDecks:()=>`${d.decks.length} / ${CONTENT_LIMITS.cardDecks.decks} decks · ${d.decks.reduce((n,x)=>n+x.cards.length,0)} / 100 cards`};$('capacity').textContent=summary[type]();}
const changed=()=>{dirty=true;revision++;$('status').textContent='Unsaved changes';queueMicrotask(capacity);};
async function open(){try{const type=params.get('type');if(type==='conceptSet'){location.replace('../sets/editor.html');return;}if(params.has('id')){active=await contentRepository.get(params.get('id'));if(!active)throw Error('This content is unavailable. Return to My Content.');}else{if(!emptyContent[type])throw Error('Choose a content type in My Content.');const now=new Date().toISOString();active={id:createEntityId(),name:'',gameType:'authoring-'+type,schemaVersion:1,content:{type,version:activityRegistry.content(type).version,data:emptyContent[type]()},themeConfig:{},gameplayConfig:{},metadata:{createdAt:now,updatedAt:now}};}
 document.body.dataset.editor=active.content.type;
 if(active.content.type==='quiz'){
  $('contentForm').noValidate=true;
  const heading=document.querySelector('.content-heading'),identity=$('contentType').parentElement,saveGroup=document.createElement('div'),nameError=document.createElement('p');
  identity.classList.add('quiz-identity');saveGroup.className='quiz-save-group';saveGroup.append($('status'),$('save'));heading.append(saveGroup);heading.prepend(identity);
  nameError.id='nameError';nameError.className='editor-error';nameError.hidden=true;$('contentName').parentElement.append(nameError);$('contentName').setAttribute('aria-describedby','nameError');
 }
$('contentName').value=active.name;$('contentType').textContent=contentTypes.find(t=>t[0]===active.content.type)?.[1]||'Content';
 editor=activityRegistry.editor(active.gameType,active.content.type)({host:$('workspace'),activity:active,onChange:changed,services:{compactHeader:true,save:()=> $('contentForm').requestSubmit(),preview:previewScene,mediaURL:r=>activityAssets.mediaURL(r),async upload(file,options){busy++;$('save').disabled=true;try{return await activityAssets.upload(file,options);}finally{busy--;$('save').disabled=!!busy;}}}});capacity();$('contentName').oninput=()=>{changed();if($('nameError')&&$('contentName').value.trim()){$('nameError').hidden=true;$('contentName').removeAttribute('aria-invalid');}};showPlay();
 }catch(e){$('status').textContent=e.message;$('save').disabled=true;}}
function showPlay(){if(['scene','labelIt'].includes(active.content.type)&&params.has('id')){$('play').hidden=false;$('play').textContent=active.content.type==='labelIt'?'Play Label It!':'Play I Spy';$('play').href='../games/'+(active.content.type==='labelIt'?'label-it':'i-spy')+'/?activity='+encodeURIComponent(active.id);if(params.get('from')==='i-spy')$('play').textContent='Return to I Spy';}}
$('contentForm').onsubmit=async e=>{e.preventDefault();if(busy||!editor)return;
 if(active.content.type==='quiz'){
  if(!$('contentName').value.trim()){$('nameError').textContent='Enter a content name.';$('nameError').hidden=false;$('contentName').setAttribute('aria-invalid','true');$('contentName').focus();return;}
  if(!editor.validate()){$('status').textContent='Unsaved changes';return;}
 }
 const rev=revision;$('save').disabled=true;try{active=await contentRepository.save({...active,name:$('contentName').value,content:{...active.content,data:editor.read()},metadata:{...active.metadata,updatedAt:new Date().toISOString()}});if(rev===revision){dirty=false;editor.commit();$('status').textContent='Saved';}else $('status').textContent='Saved. More recent changes are unsaved.';params.set('id',active.id);history.replaceState(null,'','?id='+encodeURIComponent(active.id)+(params.get('from')==='i-spy'?'&from=i-spy':''));showPlay();}catch(e){$('status').textContent=e.message;}finally{$('save').disabled=!!busy;}};
addEventListener('beforeunload',e=>{if(dirty||busy){e.preventDefault();e.returnValue='';}});open();

function previewScene(data){try{validateScene(data);const token=crypto.randomUUID(),dialog=document.createElement('dialog'),frame=document.createElement('iframe'),close=document.createElement('button');dialog.className='scene-draft-preview';close.type='button';close.textContent='Close preview';close.onclick=()=>dialog.close();frame.title='I Spy draft preview';frame.src='../games/i-spy/?preview='+token;const receive=e=>{if(e.origin===location.origin&&e.source===frame.contentWindow&&e.data?.type==='spy-preview-ready'&&e.data.token===token)frame.contentWindow.postMessage({type:'spy-preview-data',token,activity:{...structuredClone(active),name:$('contentName').value,content:{...active.content,data:structuredClone(data)}}},location.origin);};addEventListener('message',receive);dialog.addEventListener('close',()=>{removeEventListener('message',receive);dialog.remove();},{once:true});dialog.append(close,frame);document.body.append(dialog);dialog.showModal();}catch(e){$('status').textContent=e.message;}}

