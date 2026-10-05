import {activityRegistry} from './activity/catalog.js';
import {eligiblePool} from '../games/wordly/eligibility.js';
import {element,button} from './ui.js';
import {canPlaySet} from './content-rules.js';
import {loadSettings} from './storage.js';
import {gameURL} from '../games/dobble/config.js';
// Add future playable games here; Content Set cards stay unchanged.
export const PLAYABLE_GAMES=[{id:'dobble',name:'Dobble',url:set=>gameURL(set,loadSettings())},{id:'tic-tac-toe',name:'Tic-Tac-Toe',url:set=>{const url=new URL('../games/tic-tac-toe/',import.meta.url);url.searchParams.set('set',set.id);return url.href;}},{id:'wordly',name:'Wordly Spelling',compatible:set=>eligiblePool(set).length>0,reason:'Wordly uses single words with 3–8 English letters. This set has no compatible words.',url:set=>{const url=new URL('../games/wordly/',import.meta.url);url.searchParams.set('set',set.id);return url.href;}},{id:'story-dice',name:'Story Dice — Concept Mode',url:set=>{const url=new URL('../games/story-dice/',import.meta.url);url.searchParams.set('set',set.id);url.searchParams.set('mode','concept');return url.href;}}];
export function chooseSetGame(set){
 const dialog=element('dialog','app-dialog game-chooser');dialog.setAttribute('aria-label','Choose a game');dialog.append(element('h2','','Choose a game'),element('p','set-summary',set.name+' · '+set.items.length+' items'));
 const games=element('div','row');for(const game of PLAYABLE_GAMES.filter(game=>activityRegistry.game(game.id).capabilities.supportsReusableSets)){const launch=button(game.name,()=>{if(!canPlaySet(set)||game.compatible&&!game.compatible(set))return;location.href=game.url(set);},'primary');launch.dataset.game=game.id;launch.disabled=!canPlaySet(set)||!!game.compatible&&!game.compatible(set);games.append(launch);if(game.compatible&&!game.compatible(set)){const note=element('p','minimum-note',game.reason);note.id='unavailable-'+game.id;launch.setAttribute('aria-describedby',note.id);dialog.append(note);}}dialog.append(games);if(!canPlaySet(set))dialog.append(element('p','minimum-note','Minimum: 5 valid items.'));
 const actions=element('div','row');actions.style.marginTop='18px';actions.append(button('Cancel',()=>dialog.close()));dialog.append(actions);dialog.addEventListener('close',()=>dialog.remove(),{once:true});document.body.append(dialog);dialog.showModal();return dialog;
}
