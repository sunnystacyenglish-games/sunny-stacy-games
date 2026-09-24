import {setupViewport} from './viewport.js';
import {setRepository} from '../../shared/sets.js';
import {loadSettings} from '../../shared/storage.js';
import {createRound,GameSession,RotationPool,requiredConcepts,maxItemsPerCard} from './engine.js';
import {prepareItems} from '../../shared/images.js';
import {playFeedback} from './sound.js';
import {mountCards,renderRepresentation} from './render.js';
import {setupSettings} from './settings.js';
const $=id=>document.getElementById(id);
const settings=loadSettings();let mounted=null;
setupViewport($('game'));
const modeNames={images:'Images',words:'Words',mixed:'Word + Image'};
async function initialize(){
  const sets=await setRepository.list();
  const requested=new URLSearchParams(location.search).get('set');
  const requestedSet=sets.find(set=>set.id===requested);
  let selected=requestedSet || sets.find(set=>set.id===settings.set) || sets[0];settings.set=selected.id;
  let sessionItems=[],pool=null,loadedSetId=null,ready=false,loadToken=0;
  const session=new GameSession({nextRound:previous=>createRound(sessionItems,settings,previous,Math.random,pool),onChange:handleChange});
  function handleChange(event){
    $('score').textContent=session.score;
    if(event==='round'){
      mounted?.destroy();mounted=mountCards($('game'),session.round,settings,(id,button)=>{
        const result=session.answer(id,settings);
        if(result==='wrong'){button.classList.remove('wrong');void button.offsetWidth;button.classList.add('wrong');setTimeout(()=>button.classList.remove('wrong'),300);}
      });
      $('status').textContent='';
      $('cue').hidden=settings.count!==1;$('cue').replaceChildren();
      if(settings.count===1){$('cue').append('Find this:');const content=document.createElement('span');content.className='cue-content';renderRepresentation(content,session.round.cue);$('cue').append(content);}
    }
    if(event==='wrong'){$('status').textContent='Almost! Have another look.';if(settings.sound)playFeedback(false);}
    if(event==='correct'){
      mounted.stop();for(const button of $('game').querySelectorAll('.item')){button.classList.remove('wrong');if(button.dataset.id===session.round.answer)button.classList.add('correct');button.setAttribute('aria-disabled','true');}
      $('status').textContent=settings.autoNext?'You found it! +1 ★':'You found it! +1 ★ Press New cards to play again.';
      for(const card of $('game').querySelectorAll('.card'))card.classList.add('celebrate');
      $('score').parentElement.classList.remove('score-pop');void $('score').offsetWidth;$('score').parentElement.classList.add('score-pop');
      if(settings.sound)playFeedback(true);
    }
  }
  async function apply(saved=true){
    const token=++loadToken;ready=false;session.clearPending();session.roundLocked=true;mounted?.destroy();$('game').replaceChildren();$('cue').hidden=true;$('newRound').disabled=true;$('loadError').hidden=true;
    selected=sets.find(set=>set.id===settings.set)||sets[0];settings.per=Math.min(settings.per,maxItemsPerCard(selected.items.length,settings.count));document.body.dataset.theme=settings.theme;$('setLabel').textContent=`${selected.name} · ${modeNames[settings.mode]}`;
    $('instruction').textContent=settings.count===1?'Look at the example, then find it on the card.':settings.count>2?'Find the one thing on every card. Tap it!':'One little thing connects these cards. Tap it!';
    $('status').textContent='Loading your set…';
    try{
      const needed=requiredConcepts(settings);
      if(selected.items.length<needed)throw Error(`${settings.per} items per card with ${settings.count} card(s) needs at least ${needed} concepts. This set has ${selected.items.length}. Open Settings to choose fewer items/cards, or add more in My Sets.`);
      const prepared=await prepareItems(selected.items);if(token!==loadToken)return;
      if(loadedSetId!==selected.id||!pool){pool=new RotationPool(prepared);loadedSetId=selected.id;}
      sessionItems=prepared;ready=true;$('newRound').disabled=false;
      const url=new URL(location.href);url.searchParams.set('set',selected.id);history.replaceState(null,'',url);
      session.start();if(!saved)$('status').textContent='Settings applied. This browser cannot save them.';
    }catch(error){if(token!==loadToken)return;$('status').textContent='';$('loadError').hidden=false;$('loadError').textContent=error.message;}
  }
  const dialog=setupSettings(settings,sets,apply,()=>session.clearPending());
  dialog.addEventListener('close',()=>{if(ready&&session.roundLocked && settings.autoNext)session.start();});
  $('newRound').onclick=()=>{if(ready)session.start();};$('resetScore').onclick=()=>session.resetScore();
  $('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else throw Error('unsupported');}catch{$('status').textContent='Fullscreen is unavailable here. You can enlarge the browser window.';}};
  document.addEventListener('fullscreenchange',()=>{$('fullscreen').querySelector('span').textContent=document.fullscreenElement?'Exit fullscreen':'Fullscreen';});
  await apply();if(requested&&!requestedSet)$('status').textContent='That set was not found. Using an available set.';
  if(setRepository.warnings.length){$('loadError').hidden=false;$('loadError').textContent=setRepository.warnings.join(' ');}
}
initialize().catch(error=>{$('status').textContent=`Could not start the game: ${error.message}`;console.error(error);});
