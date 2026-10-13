import {GAME_CATALOG} from './game-catalog.js';
import {activityRegistry} from './activity/catalog.js';
import {canPlaySet} from './content-rules.js';
import {eligiblePool} from '../games/wordly/eligibility.js';
import {deckKey} from '../games/board-race/decks.js';
export function compatibleGames(item){return GAME_CATALOG.filter(game=>activityRegistry.game(game.id).supportedContentTypes.includes(item.type)&& (item.type!=='conceptSet'||canPlaySet(item.record))&&(game.id!=='wordly'||eligiblePool(item.record).length>0));}
export function contentGameURL(item,game){
 const url=new URL('../'+game.url,import.meta.url);
 if(item.type==='conceptSet'){url.searchParams.set('set',item.id);if(game.id==='story-dice')url.searchParams.set('mode','concept');}
 else if(item.type==='scene')url.searchParams.set('activity',item.id);
 else {url.searchParams.set('contentId',item.id);url.searchParams.set('contentMode',item.type==='cardDecks'&&game.id==='board-race'?'decks':item.type);
  if(item.type==='cardDecks'){if(game.id==='board-race'){const decks=item.record.content.data.decks||[];url.searchParams.set('deckRefs',JSON.stringify(decks.length<=5?decks.map(d=>({key:deckKey(item.id,d.id),color:d.color})):[]));}else url.searchParams.set('taskDeckId','');}
 }return url.href;
}
export function chooseContentGame(item,anchor){
 const dialog=document.createElement('dialog');dialog.className='app-dialog library-game-picker';dialog.setAttribute('aria-label','Use in game');
 const heading=document.createElement('h2');heading.textContent=item.name;const list=document.createElement('div');list.className='library-game-list';
 for(const game of compatibleGames(item)){const link=document.createElement('a');link.className='button';link.textContent=game.name+' →';link.href=contentGameURL(item,game);list.append(link);}
 const cancel=document.createElement('button');cancel.textContent='Cancel';cancel.onclick=()=>dialog.close();dialog.append(heading,list,cancel);document.body.append(dialog);
 function position(){if(innerWidth<=600){dialog.style.left=dialog.style.top='';return;}const a=anchor.getBoundingClientRect();dialog.style.left=Math.max(12,Math.min(innerWidth-dialog.offsetWidth-12,a.right-dialog.offsetWidth))+'px';dialog.style.top=Math.max(12,Math.min(innerHeight-dialog.offsetHeight-12,a.bottom+8))+'px';}
 dialog.addEventListener('close',()=>{removeEventListener('resize',position);dialog.remove();anchor.focus();},{once:true});dialog.addEventListener('click',e=>{if(e.target===dialog){const b=dialog.getBoundingClientRect();if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom)dialog.close();}});dialog.showModal();position();addEventListener('resize',position);return dialog;
}
