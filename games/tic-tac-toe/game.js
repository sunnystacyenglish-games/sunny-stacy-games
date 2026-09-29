import {TicTacToe} from './engine.js';
import {marker} from './markers.js';
import {loadPreferences,savePreferences,gameURL} from './settings.js';
import {setRepository} from '../../shared/sets.js';
import {validatePlayableSet} from '../../shared/content-rules.js';
import {prepareItems,showImage} from '../../shared/images.js';
import {importSet} from '../../shared/transfer.js';
import {THEME_OPTIONS} from '../../shared/themes.js';
// Reuse the established theme renderer, sound and exact set resolution unchanged.
import {applyTheme} from '../dobble/theme-view.js';
import {playFeedback} from '../dobble/sound.js';
import {resolveSetReference} from '../dobble/resolution.js';
const $=id=>document.getElementById(id),settings=loadPreferences();let game=null,sets=[],selected=null,requested,imported,busy=false,loading=false,lastSound=-Infinity;
const delay=ms=>new Promise(r=>setTimeout(r,ms)),reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const name=p=>settings[p].trim()||'Player '+p,description=p=>marker(settings.theme,p)+' '+name(p);
function sound(correct){if(settings.sound&&performance.now()-lastSound>=540){lastSound=performance.now();playFeedback(correct);}}
function persist(){savePreferences(settings);history.replaceState(null,'',gameURL(settings));}
function fail(error){$('error').textContent=error.message||String(error);$('error').hidden=false;}
function fit(){if(!game)return;const area=$('playArea'),board=$('board');const other=[...area.children].filter(el=>el!==board&&!el.hidden).reduce((sum,el)=>{const css=getComputedStyle(el);return sum+el.getBoundingClientRect().height+parseFloat(css.marginTop)+parseFloat(css.marginBottom);},0);const top=area.getBoundingClientRect().top;const height=(visualViewport?.height||innerHeight)-top-other-22;const size=Math.max(1,Math.floor(Math.min(area.clientWidth,height,900)));board.style.setProperty('--board-size',size+'px');if($('task').open)positionTask();}
function render(){if(!game)return;document.body.dataset.state=game.state;for(const p of ['X','O']){const host=document.querySelector('[data-player='+p+']');host.classList.toggle('active',game.current===p&&!['WIN','DRAW'].includes(game.state));host.querySelector('.player-marker').textContent=marker(settings.theme,p);}
 for(const [i,cell] of [...$('cells').children].entries()){const player=game.board[i];cell.disabled=game.state!=='SELECT_CELL'||player!==null;cell.dataset.player=player||'';cell.classList.toggle('pending',game.pending===i);cell.querySelector('.cell-marker').textContent=player?marker(settings.theme,player):'';cell.setAttribute('aria-label','Square '+(i+1)+(player?', '+name(player)+' ('+player+')':', empty'));}
 $('turn').textContent=game.state==='STEAL_TASK'?description(game.current)+' can steal square '+(game.pending+1)+'!':game.state==='SELECT_CELL'?description(game.current)+' — choose a square':game.state==='TASK'?description(game.current)+' — square '+(game.pending+1):'';
 if(['WIN','DRAW'].includes(game.state)){$('result').hidden=false;$('resultText').textContent=game.state==='WIN'?description(game.result.winner)+' wins!':"It's a draw!";}
 requestAnimationFrame(fit);
}
// Keep the chosen square visible beside the opaque task window when space permits.
function positionTask(){
 const dialog=$('task');if(game?.pending===null||!dialog.open)return;
 const r=$('cells').children[game.pending].getBoundingClientRect(),w=innerWidth,h=visualViewport?.height||innerHeight;
 const candidates=[{left:12,top:12,width:r.left-24,height:h-24},{left:r.right+12,top:12,width:w-r.right-24,height:h-24},{left:12,top:12,width:w-24,height:r.top-24},{left:12,top:r.bottom+12,width:w-24,height:h-r.bottom-24}].filter(a=>a.width>=330&&a.height>=260);
 dialog.style.cssText='';if(!candidates.length)return;
 candidates.sort((a,b)=>Math.min(b.width,700)*Math.min(b.height,600)-Math.min(a.width,700)*Math.min(a.height,600));
 const a=candidates[0];dialog.style.width=Math.min(a.width,700)+'px';dialog.style.maxHeight=a.height+'px';dialog.style.margin='0';dialog.style.position='fixed';dialog.style.left=a.left+'px';dialog.style.top=a.top+'px';
}
function task(){const attempt=game.attempt;$('taskContext').textContent=game.state==='STEAL_TASK'?description(game.current)+' can steal square '+(game.pending+1)+'!':description(game.current)+' · Square '+(game.pending+1);$('taskText').textContent=game.concept.word;$('task').dataset.concept=game.concept.id;showImage($('taskImage'),game.concept.image,game.concept.word);$('correct').onclick=()=>answer(true,attempt);$('incorrect').onclick=()=>answer(false,attempt);if(!$('task').open)$('task').showModal();positionTask();}
function lock(value){$('correct').disabled=value;$('incorrect').disabled=value;}
async function choose(index){if(busy||!game?.choose(index))return;busy=true;lock(true);render();const cell=$('cells').children[index];cell.classList.add('selecting');await delay(reduced()?0:130);cell.classList.remove('selecting');task();busy=false;lock(false);$('correct').focus();}
async function answer(correct,attempt){if(busy)return;busy=true;lock(true);const result=game.answer(correct,attempt);if(!result){busy=false;lock(false);return;}sound(correct);render();const cell=$('cells').children[game.pending];if(result==='steal'){cell.classList.add('steal');task();await delay(560);cell.classList.remove('steal');busy=false;lock(false);$('correct').focus();return;}
 $('task').close();if(result==='placed')cell.classList.add('placed');await delay(reduced()?40:320);cell.classList.remove('placed');game.finish();render();if(game.state==='WIN'){$('board').classList.add('won');const line=game.result.line;line.forEach((index,i)=>{const c=$('cells').children[index];c.style.setProperty('--win-delay',i*100+'ms');c.classList.add('winner');});const start=line[0],end=line[2],svg=$('winLine').querySelector('line');for(const [key,value] of Object.entries({x1:(start%3)*100+50,y1:Math.floor(start/3)*100+50,x2:(end%3)*100+50,y2:Math.floor(end/3)*100+50}))svg.setAttribute(key,value);$('winLine').removeAttribute('hidden');await delay(reduced()?0:650);sound(true);$('again').focus();}else if(game.state==='DRAW'){$('board').classList.add('draw');$('again').focus();}else{const next=[...$('cells').children].find(c=>!c.disabled);next?.focus();}busy=false;
}
function resetPresentation(){$('board').classList.remove('won','draw');$('winLine').setAttribute('hidden','');$('result').hidden=true;for(const c of $('cells').children)c.classList.remove('winner','placed','pending','steal');}
function summarize(){selected=sets.find(s=>s.id===$('setSelect').value);$('setSummary').textContent=selected?selected.name+' · '+selected.items.length+' concepts · This set will be used.':'';try{validatePlayableSet(selected);$('setupError').textContent='';$('play').disabled=false;}catch(e){$('setupError').textContent=e.message;$('play').disabled=true;}}
function setup(){if(!selected)return;$('setSelect').value=selected.id;$('setupX').value=settings.X;$('setupO').value=settings.O;$('themeSelect').value=settings.theme;$('sound').checked=settings.sound;summarize();$('setup').showModal();}
function populate(){for(const id of ['setSelect','replacement']){const host=$(id);host.replaceChildren();if(id==='replacement'){const option=new Option('Choose a set','');host.append(option);}for(const set of sets)host.append(new Option(set.name,set.id));}}
function replace(set){selected=set;requested=set.id;settings.set=set.id;persist();$('missing').hidden=true;$('welcome').hidden=false;populate();setup();}
async function launch(event){event.preventDefault();if(loading)return;loading=true;const controls=[...$('setupForm').querySelectorAll('input,select,button')];controls.forEach(el=>el.disabled=true);try{selected=await setRepository.get($('setSelect').value);validatePlayableSet(selected);await prepareItems(selected.items);Object.assign(settings,{set:selected.id,X:$('setupX').value,O:$('setupO').value,theme:$('themeSelect').value,sound:$('sound').checked});persist();applyTheme(settings.theme);game=new TicTacToe(selected.items);$('nameX').value=settings.X;$('nameO').value=settings.O;$('setName').textContent=selected.name;$('welcome').hidden=true;$('missing').hidden=true;$('error').hidden=true;$('playArea').hidden=false;resetPresentation();render();$('turn').textContent=description(game.starter)+' starts! Choose a square.';$('setup').close();$('cells').children[0].focus();fit();}catch(e){$('setupError').textContent=e.message;}finally{loading=false;controls.forEach(el=>el.disabled=false);}}
for(let i=0;i<9;i++){const cell=document.createElement('button');cell.className='cell';cell.innerHTML='<span class="cell-number">'+(i+1)+'</span><span class="cell-marker"></span>';cell.onclick=()=>choose(i);$('cells').append(cell);}
for(const p of ['X','O'])$('name'+p).addEventListener('input',e=>{settings[p]=e.target.value;savePreferences(settings);render();});
$('again').onclick=()=>{if(busy||!game.playAgain())return;resetPresentation();render();$('turn').textContent=description(game.starter)+' starts! Choose a square.';$('cells').children[0].focus();};
$('task').addEventListener('cancel',e=>e.preventDefault());$('setupForm').onsubmit=launch;$('setupCancel').onclick=()=>{if(!loading)$('setup').close();};$('setup').addEventListener('cancel',e=>{if(loading)e.preventDefault();});$('setSelect').onchange=summarize;$('setupOpen').onclick=setup;
for(const id of ['themeSelect','liveTheme'])for(const [value,label] of THEME_OPTIONS)$(id).append(new Option(label,value));
$('settingsOpen').onclick=()=>{if(!game){setup();return;}$('liveTheme').value=settings.theme;$('liveSound').checked=settings.sound;$('preferences').showModal();};$('prefCancel').onclick=()=>$('preferences').close();$('prefForm').onsubmit=e=>{e.preventDefault();settings.theme=$('liveTheme').value;settings.sound=$('liveSound').checked;persist();applyTheme(settings.theme);render();$('preferences').close();};
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(e){fail(Error('Fullscreen is not available in this browser.'));}};
$('copyLink').onclick=async()=>{try{await navigator.clipboard.writeText(gameURL(settings));$('turn').textContent='Game link copied. Import this set on other devices first.';}catch{fail(Error('Copy this game link: '+gameURL(settings)));}};
$('importFile').onchange=async e=>{const file=e.target.files[0];e.target.value='';if(!file)return;try{if(file.size>40*1024*1024)throw Error('Maximum JSON file size is 40 MB.');imported=await importSet(await file.text(),{requestedId:requested});sets=await setRepository.list();populate();if(imported.id===requested)replace(imported);else{$('importStatus').textContent='This file contains a different set. Use it only if you want to replace the set requested by this link.';$('useImported').hidden=false;}}catch(e){$('importStatus').textContent=e.message;}};
$('useImported').onclick=()=>{if(imported)replace(imported);};$('useReplacement').onclick=()=>{const set=sets.find(s=>s.id===$('replacement').value);if(set)replace(set);};
addEventListener('resize',fit);visualViewport?.addEventListener('resize',fit);document.addEventListener('fullscreenchange',fit);new ResizeObserver(fit).observe($('turn'));
applyTheme(settings.theme);
try{sets=await setRepository.list();const params=new URLSearchParams(location.search);requested=params.has('set')?params.get('set'):undefined;selected=resolveSetReference(sets,requested,settings.set);populate();if(selected){settings.set=selected.id;setup();}else{$('welcome').hidden=true;$('missing').hidden=false;}if(setRepository.warnings.length)fail(Error(setRepository.warnings.join('\n')));}catch(e){fail(e);}
