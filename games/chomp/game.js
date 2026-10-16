import {Chomp,MasteryBag,ordinal} from './engine.js';
import {mountCreature,characterFor} from './creature.js';
import {preferences,savePreferences,normalize,gameURL} from './settings.js';
import {setRepository} from '../../shared/sets.js';
import {validatePlayableSet} from '../../shared/content-rules.js';
import {validateDecks} from '../../shared/editors/models.js';
import {mountSetupMenu} from '../../shared/setup-menu.js';
import {mountTaskSelection} from '../../shared/tasks/selection.js';
import {mountDeckSelection} from '../board-race/deck-selection.js';
import {mountTaskPresenter} from '../../shared/tasks/presenter.js';
import {cardContent} from '../../shared/tasks/card.js';
import {renderConcept} from '../board-race/content-view.js';
import {concealTask,revealTask,ANSWER_REVEAL_MS} from '../../shared/concept-blur.js';
import {concealedCardPart} from '../board-race/deck-blur.js';
import {themes} from '../../shared/themes.js';
import {applyTheme} from '../dobble/theme-view.js';
import {playCorrect,playWrong,playChomp,stopAllAudio} from '../../shared/audio.js';
const $=id=>document.getElementById(id),node=(tag,text)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
let settings=preferences(),sets=[],menu,selection,decks,game,bag,active,signature='',task,ready=false,busy=false,epoch=0;
const timers=new Map();
function cancel(){epoch++;for(const [timer,resolve] of timers){clearTimeout(timer);resolve(false);}timers.clear();stopAllAudio();}
function delay(ms){return new Promise(resolve=>{const timer=setTimeout(()=>{timers.delete(timer);resolve(true);},ms);timers.set(timer,resolve);});}
function fail(error){ready=false;$('error').textContent=error.message||String(error);$('error').hidden=false;for(const hit of $('creature').querySelectorAll('[data-hit]')){hit.setAttribute('aria-disabled','true');hit.setAttribute('tabindex','-1');}updateControls();}
const creature=mountCreature($('creature'),id=>press(id).catch(fail));
const presenter=mountTaskPresenter($('authoredTask'),{onReady:()=>updateControls()});
function persist(){savePreferences(settings);history.replaceState(null,'',gameURL(settings));}
function players(){const host=$('players');host.replaceChildren();for(let i=0;i<settings.players;i++){const label=node('label'),input=node('input');label.className='player'+(game?.player===i?' active':'');label.dataset.player=i;label.append(node('span','Player '+(i+1)));input.value=settings.names[i];input.maxLength=40;input.setAttribute('aria-label','Player '+(i+1)+' name');input.onchange=()=>{settings.names[i]=input.value.trim()||'Player '+(i+1);persist();};label.append(input);host.append(label);}}
function updateControls(){const enabled=ready&&game?.state==='TASK_ACTIVE',authored=['bridge','sentenceCorrection'].includes(task?.type),can=enabled&&(!authored||presenter.canResolve);for(const id of ['correct','incorrect','done'])$(id).disabled=!can;if(task?.type==='cardDecks'&&$('conceptTask').dataset.revealed!=='true')$('done').disabled=true;$('reveal').disabled=!enabled||$('conceptTask').dataset.revealed==='true';}
function render(){if(!game)return;document.body.dataset.state=game.state;players();creature.update(game);const learning=['TASK_ACTIVE','TASK_RESOLVING'].includes(game.state);$('conceptTask').hidden=!learning||['bridge','sentenceCorrection'].includes(task?.type);$('authoredTask').hidden=!learning||!['bridge','sentenceCorrection'].includes(task?.type);$('taskPanel').querySelector('.teacher-actions').hidden=!learning;$('waiting').hidden=learning;$('waiting').textContent=game.state==='WAIT_FOR_TOOTH'?'Choose one available tooth.':game.state==='ROUND_COMPLETE'?'CHOMP!':'…';$('turn').textContent=settings.names[game.player]+' — '+(learning?'your task':game.state==='WAIT_FOR_TOOTH'?'choose a tooth':'CHOMP!');updateControls();}
async function showTask(){
 ready=false;task=bag.next();presenter.clear();const token=epoch;$('error').hidden=true;
 const done=['cardDecks','bridge'].includes(task.type);$('done').hidden=!done;$('correct').hidden=$('incorrect').hidden=done;render();
 if(['bridge','sentenceCorrection'].includes(task.type))await presenter.show(task);
 else if(task.type==='cardDecks'){
  const fragment=await cardContent(task);if(token!==epoch)return;const image=fragment.querySelector('img'),text=fragment.querySelector('p');$('taskImage').replaceChildren();if(image)$('taskImage').append(image);$('taskImage').hidden=!image;$('taskText').textContent=text?.textContent||'';$('taskText').hidden=!text;const mode=settings.deckBlur[task.group]||'none',part=concealedCardPart(task,mode);concealTask($('conceptTask'),part?mode:'none');if(!part)revealTask($('conceptTask'));$('reveal').hidden=!part;
 }else{renderConcept($('conceptTask'),task,settings.taskMode);const img=$('taskImage').querySelector('img');if(img)await img.decode().catch(()=>{throw Error('Task image could not load. Edit its source or choose other content.');});}
 if(token!==epoch)return;ready=true;render();
}
async function resolve(success){
 if(task?.type==='bridge')success=presenter.automaticResult;
 if(!ready||(['bridge','sentenceCorrection'].includes(task.type)&&!presenter.canResolve)||!game.resolve(success,game.attempt))return;
 const token=epoch;ready=false;bag.record(task.key,success);render();if(success)playCorrect(settings.sound);else playWrong(settings.sound);
 if(!['bridge','sentenceCorrection'].includes(task.type)&&$('conceptTask').dataset.revealed!=='true'){revealTask($('conceptTask'));await delay(ANSWER_REVEAL_MS);}
 if(token!==epoch)return;game.resolved();render();if(game.state==='TASK_ACTIVE')await showTask();else $('creature').querySelector('[aria-disabled="false"]')?.focus();
}
async function press(id){const result=game?.press(id);if(!result)return;const token=epoch;render();await delay(300);if(token!==epoch)return;game.pressedDone();if(result.danger){render();creature.close();playChomp(settings.sound);await delay(460);if(token!==epoch)return;game.complete();render();$('resultText').textContent=settings.names[game.player]+': You CHOMPED on the '+ordinal(result.count)+' tooth!';$('result').showModal();}else await showTask();}
async function start({replay=false}={}){
 cancel();const token=epoch;ready=false;$('result').close();presenter.clear();const previous=game;game=null;updateControls();
 await creature.load(settings.theme);if(token!==epoch)return;
 game=new Chomp({teeth:characterFor(settings.theme).layers.filter(l=>l.tooth).map(l=>l.id),players:settings.players,starter:replay&&previous?(previous.starter+1)%settings.players:undefined});$('welcome').hidden=true;$('playArea').hidden=false;$('context').textContent=active.name;await showTask();
}
function names(){const host=$('names');host.replaceChildren();for(let i=0;i<Number($('playerCount').value);i++){const label=node('label','Player / Team '+(i+1)),input=node('input');input.value=settings.names[i];input.maxLength=40;input.id='name'+i;label.append(input);host.append(label);}}
function validateSelected(entries){if(entries.length<1||entries.length>5)throw Error('Choose 1–5 decks.');for(const e of entries){validateDecks({decks:[e.deck]});if(!e.deck.cards.length)throw Error(e.deck.name+': add a card.');}return structuredClone(entries);}
function summary(){if(!selection)return;$('blurLabel').hidden=selection.mode!=='concepts';try{if(selection.mode==='decks')decks.read();else if(selection.mode==='concepts')validatePlayableSet(menu.sessionSet(sets.find(s=>s.id===$('setSelect').value)));else selection.read();$('setupError').textContent='';$('play').disabled=busy;}catch(e){$('setupError').textContent=e.message;$('play').disabled=true;}}
async function openSetup(){if(busy||game&&!['TASK_ACTIVE','WAIT_FOR_TOOTH','ROUND_COMPLETE'].includes(game.state))return;$('setSelect').value=settings.set;$('themeSelect').value=settings.theme;$('taskMode').value=settings.taskMode;$('sound').checked=settings.sound;$('playerCount').value=settings.players;names();menu.begin();await decks.begin(settings);await selection.begin(settings);menu.sync();summary();$('setup').showModal();}
async function loadContent(){
 if(selection.mode==='decks'){const entries=decks.read();const items=[];for(const e of entries)for(const card of e.deck.cards){await cardContent(card);items.push({...card,type:'cardDecks',key:JSON.stringify(['cardDecks',e.documentId,e.deck.id,card.id]),group:e.key,deckName:e.deck.name,deckColor:e.deck.color});}return {name:entries.map(e=>e.deck.name).join(' · '),items};}
 if(selection.mode==='concepts'){const set=menu.sessionSet(await setRepository.get($('setSelect').value));validatePlayableSet(set);return {...set,items:set.items.map(item=>({...item,type:'concepts',key:JSON.stringify(['concepts',set.id,item.id]),group:set.id}))};}
 const content=await selection.load();return {...content,items:content.items.map(item=>({...item,key:JSON.stringify([content.type,content.documentId,item.id]),group:content.documentId}))};
}
$('setupForm').onsubmit=async e=>{e.preventDefault();if(busy||$('play').disabled)return;busy=true;summary();try{
 const content=await loadContent(),next=normalize({...settings,...selection.reference(),deckRefs:decks.refs(),deckBlur:decks.blurMap(),set:$('setSelect').value,theme:$('themeSelect').value,players:$('playerCount').value,taskMode:$('taskMode').value,sound:$('sound').checked,names:settings.names.map((n,i)=>$('name'+i)?.value.trim()||n)}),key=JSON.stringify(content),changed=key!==signature;
 const restart=!game||changed||next.theme!==settings.theme||next.players!==settings.players||game.state==='ROUND_COMPLETE';
 if(changed||!bag){bag=new MasteryBag(content.items);signature=key;}active=content;settings=next;menu.commit();persist();applyTheme(settings.theme);$('setup').close();if(!settings.sound)stopAllAudio();if(restart)await start();else render();
 }catch(error){$('setupError').textContent=error.message;if(!$('setup').open)fail(error);}finally{busy=false;summary();}};
$('correct').onclick=()=>resolve(true).catch(fail);$('incorrect').onclick=()=>resolve(false).catch(fail);$('done').onclick=()=>{if(task?.type==='cardDecks'&&$('conceptTask').dataset.revealed!=='true')return;resolve(true).catch(fail);};
// Deck completion requires reveal; Concepts retain teacher evaluation with brief reveal.
$('reveal').onclick=()=>{if(!ready||game.state!=='TASK_ACTIVE')return;revealTask($('conceptTask'));updateControls();};
$('again').onclick=async()=>{if(busy||game?.state!=='ROUND_COMPLETE')return;busy=true;try{await start({replay:true});}catch(e){fail(e);}finally{busy=false;}};
$('playerCount').onchange=names;$('cancelSetup').onclick=()=>$('setup').close();$('settingsOpen').onclick=$('setupOpen').onclick=()=>openSetup().catch(fail);
$('fullscreen').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().catch(fail);};$('copyLink').onclick=()=>navigator.clipboard.writeText(gameURL(settings)).catch(fail);
$('result').addEventListener('cancel',e=>e.preventDefault());addEventListener('pagehide',()=>{cancel();creature.destroy();presenter.clear();menu?.destroy();});
async function init(){for(const theme of themes)$('themeSelect').append(new Option(theme.name,theme.id));sets=await setRepository.list();for(const set of sets)$('setSelect').append(new Option(set.name,set.id));if(!sets.some(s=>s.id===settings.set))$('setSelect').append(new Option('Content unavailable',settings.set));
 menu=mountSetupMenu({gameType:'chomp',dialog:$('setup'),form:$('setupForm'),title:$('setupTitle'),setSelect:$('setSelect'),themeSelect:$('themeSelect'),sound:$('sound'),getSets:()=>sets,setSets:next=>sets=next,onContentChange:summary,contentNotes:[$('blurLabel')],gameplay:[$('playerSetup')],status:[$('setupError')],footer:$('setupForm').querySelector('.dialog-actions'),committedTheme:()=>settings.theme});
 const panel=$('setup').querySelector('[data-panel=content]');decks=mountDeckSelection(panel,summary,{validate:validateSelected,showColors:false});decks.hideType();selection=mountTaskSelection(panel,{types:['bridge','sentenceCorrection'],legacyModes:['decks'],onChange:()=>{decks?.setMode(selection?.mode);summary();}});applyTheme(settings.theme);await openSetup();}
init().catch(fail);
