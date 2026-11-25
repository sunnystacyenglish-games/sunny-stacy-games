import {placeAnswer,connector} from './answer-placement.js';
import {mountSetupMenu} from '../../shared/setup-menu.js';
import {contentRepository} from '../../shared/content-library.js';
import {activityAssets} from '../../shared/activity/repository.js';
import {LabelTask} from '../../shared/tasks/label-it.js';
import {fitSceneView} from '../../shared/activity/scene-view.js';
import {themes} from '../../shared/themes.js';
import {applyTheme} from '../dobble/theme-view.js';
import {celebrate,clearCelebration} from '../../shared/celebration.js';
import {playCorrect,playWrong} from '../../shared/audio.js';
const $=id=>document.getElementById(id),params=new URLSearchParams(location.search);let documents=[],active,task,image,finished=false,mode='all',sound=true,committedTheme='notebook';
const activityChoice=$('activity'),activityLabel=activityChoice.closest('label');
const menu=mountSetupMenu({gameType:'label-it',registry:{editor:()=>({host})=>{host.append(activityLabel);return {read:()=>({activityId:activityChoice.value})};}},activity:{gameType:'label-it',content:{type:'labelIt',data:{}}},dialog:$('setup'),form:$('setupForm'),title:$('setupTitle'),themeSelect:$('theme'),sound:$('sound'),gameplay:[$('checkMode').closest('label'),$('caseSensitive').closest('label')],status:[$('setupError')],footer:$('setupForm').querySelector('.dialog-actions'),committedTheme:()=>committedTheme});
function fit(){
 if(!image?.naturalWidth)return;
 const viewport=$('viewport'),form=$('answerForm'),width=viewport.clientWidth,height=viewport.clientHeight;
 const apply=r=>Object.assign($('scene').style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});
 let r=fitSceneView({width,height},{width:image.naturalWidth,height:image.naturalHeight});apply(r);
 if(!task?.selected){$('answerLink').hidden=true;return;}
 const size={width:Math.min(310,Math.max(0,width-16)),height:form.offsetHeight};
 const rects=()=>[...$('scene').querySelectorAll('button')].map(b=>({id:b.dataset.id,x:r.left+b.offsetLeft,y:r.top+b.offsetTop,width:b.offsetWidth,height:b.offsetHeight}));
 let zones=rects(),target=zones.find(z=>z.id===task.selected);
 const locate=()=>placeAnswer({bounds:{x:8,y:8,width:width-16,height:height-16},target,obstacles:zones.filter(z=>z!==target),size,image:{x:r.left,y:r.top,width:r.width,height:r.height}});
 let box=locate();
 if(!box){r=fitSceneView({width,height:Math.max(40,height-size.height-32)},{width:image.naturalWidth,height:image.naturalHeight});apply(r);zones=rects();target=zones.find(z=>z.id===task.selected);box=locate();}
 if(!box){box={x:8,y:Math.max(8,height-size.height-8),width:size.width,height:size.height};}
 Object.assign(form.style,{left:box.x+'px',top:box.y+'px',width:box.width+'px'});
 const line=connector(target,box);for(const [key,value] of Object.entries(line))$('answerLink').querySelector('line').setAttribute(key,value);$('answerLink').setAttribute('viewBox',`0 0 ${width} ${height}`);$('answerLink').hidden=false;
}
function draw(){for(const button of $('scene').querySelectorAll('button')){const entry=task.entries.get(button.dataset.id);button.dataset.status=entry.status;button.setAttribute('aria-pressed',String(task.selected===button.dataset.id));button.setAttribute('aria-label','Target '+button.textContent+' — '+entry.status);}
 $('answerForm').hidden=!task.selected;const index=active.content.data.targets.findIndex(t=>t.id===task.selected),entry=task.entries.get(task.selected);$('selected').textContent=index<0?'Choose a target zone':'Target '+(index+1);$('answer').value=entry?.text||'';$('answer').disabled=!entry||finished||['correct','revealed'].includes(entry.status);$('reveal').disabled=!entry||finished||['correct','revealed'].includes(entry.status);$('check').disabled=finished||(mode==='instant'&&$('answer').disabled);$('check').textContent=mode==='instant'?'Check Answer':'Check Answers';$('feedback').textContent=entry?.status==='correct'?'Correct':entry?.status==='incorrect'?'Incorrect':entry?.status==='revealed'?'Revealed — not independently completed':'';$('progress').textContent=task.completed+' / '+task.entries.size+' completed';fit();}
function complete(automatic){finished=true;draw();$('completionTitle').textContent=automatic?'Great job!':'Activity ended';$('completionText').textContent=task.completed+' / '+task.entries.size+' independently completed';$('complete').showModal();if(automatic)celebrate(sound);}
async function start(){clearCelebration();task=new LabelTask(active.content.data,{caseSensitive:$('caseSensitive').checked});finished=false;$('complete').close();$('scene').replaceChildren();image=new Image();image.alt=active.name;image.src=await activityAssets.mediaURL(active.content.data.background);await image.decode();$('scene').append(image);for(const [i,target] of active.content.data.targets.entries()){const b=document.createElement('button');b.type='button';b.textContent=String(i+1);b.dataset.id=target.id;Object.assign(b.style,{left:target.x*100+'%',top:target.y*100+'%',width:target.width*100+'%',height:target.height*100+'%'});b.onclick=()=>{if(finished)return;task.select(target.id);draw();if(!$('answer').disabled)$('answer').focus();};$('scene').append(b);}$('context').textContent=active.name;$('playArea').hidden=false;$('end').hidden=false;draw();fit();}
$('answer').oninput=()=>{task.write($('answer').value);$('feedback').textContent='';fit();};
$('answerForm').onsubmit=e=>{e.preventDefault();if(finished)return;const before=task.completed;if(mode==='instant')task.check();else task.checkAll();draw();if(task.complete)complete(true);else{(task.completed>before?playCorrect:playWrong)(sound);if(!$('answer').disabled)$('answer').focus();}};
$('reveal').onclick=()=>{task.reveal();draw();[...$('scene').querySelectorAll('button')].find(b=>b.dataset.id===task.selected)?.focus();};$('end').onclick=()=>$('confirmEnd').showModal();$('keep').onclick=()=>$('confirmEnd').close();$('finish').onclick=()=>{$('confirmEnd').close();complete(false);};$('again').onclick=()=>start().catch(fail);$('cancel').onclick=()=>$('setup').close();$('settings').onclick=()=>setup().catch(fail);
function fail(e){$('error').textContent=e.message;}
async function setup(){documents=(await contentRepository.list()).filter(d=>d.content.type==='labelIt');$('activity').replaceChildren(new Option('Choose activity',''),...documents.map(d=>new Option(d.name,d.id)));$('activity').value=active?.id||params.get('activity')||'';menu.begin();$('setup').showModal();}
$('setupForm').onsubmit=async e=>{e.preventDefault();try{active=await contentRepository.get($('activity').value);if(!active||active.content.type!=='labelIt')throw Error('Choose a Label It! activity.');mode=$('checkMode').value;sound=$('sound').checked;committedTheme=$('theme').value;menu.commit();applyTheme(committedTheme);await start();$('setup').close();history.replaceState(null,'','?activity='+encodeURIComponent(active.id));}catch(e){$('setupError').textContent=e.message;}};
for(const theme of themes)$('theme').append(new Option(theme.name,theme.id));$('theme').value='notebook';applyTheme('notebook');new ResizeObserver(fit).observe($('viewport'));new ResizeObserver(()=>{if(task?.selected)fit();}).observe($('answerForm'));visualViewport?.addEventListener('resize',fit);setup().catch(fail);
