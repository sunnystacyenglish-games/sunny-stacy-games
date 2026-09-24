import {canPlaySet} from '../shared/content-rules.js';
import {setRepository} from '../shared/sets.js';
import {showImage} from '../shared/images.js';
import {exportSet,importSet} from '../shared/transfer.js';
import {element,button,message,confirmDialog,chooseGame} from '../shared/ui.js';
async function refresh(){
  const sets=await setRepository.list();document.querySelector('#userSets').replaceChildren();document.querySelector('#builtInSets').replaceChildren();
  if(setRepository.warnings.length)message(setRepository.warnings.join('\n'),true);
  for(const set of sets){
    const card=element('article','set-card');card.setAttribute('aria-label',set.name);
    const preview=element('div','previews');for(const item of set.items.slice(0,4)){const host=element('div','preview');showImage(host,item.image,item.word);preview.append(host);}
    card.append(preview,element('h3','',set.name),element('p','meta',`${set.items.length} items${set.builtin?' · Built-in':''}`));
    const actions=element('div','row');const edit=element('a','button',set.builtin?'Edit a copy':'Edit');edit.href=`editor.html?id=${encodeURIComponent(set.id)}`;
    const play=button('Play',()=>chooseGame(set),'primary');play.disabled=!canPlaySet(set);if(play.disabled)card.append(element('p','minimum-note','Minimum: 5 valid items. Edit this set to add more.'));
    actions.append(edit,play,button('Duplicate',()=>run(async()=>{await setRepository.duplicate(set.id);await refresh();message('Copy created.');})),button('Export JSON',()=>run(async()=>{
      const json=await exportSet(set);const url=URL.createObjectURL(new Blob([json],{type:'application/json'}));const link=element('a');link.href=url;link.download=`${set.name.replace(/[^a-zA-Z0-9_-]/g,'_')}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('JSON exported, including uploaded images.');
    })));
    if(!set.builtin)actions.append(button('Delete',()=>run(async()=>{if(await confirmDialog(`Delete “${set.name}”?`,'This cannot be undone. Export a backup first if you want to keep a copy.')){await setRepository.delete(set.id);await refresh();message('Set deleted.');}}),'danger'));
    card.append(actions);document.querySelector(set.builtin?'#builtInSets':'#userSets').append(card);
  }
  if(!sets.some(set=>!set.builtin)){const empty=element('div','empty-state');empty.append(element('h3','','No sets yet.'),element('p','muted','Create your first vocabulary set and use it in Sunny & Stacy games.'));const link=element('a','button primary','+ Create Set');link.href='editor.html';empty.append(link);document.querySelector('#userSets').append(empty);}
}
async function run(action){try{await action();}catch(error){message(error.message,true);}}
document.querySelector('#importButton').onclick=()=>document.querySelector('#importFile').click();
document.querySelector('#importFile').onchange=event=>run(async()=>{const file=event.target.files[0];if(!file)return;try{if(file.size>40*1024*1024)throw Error('Choose a JSON file smaller than 40 MB.');const set=await importSet(await file.text());await refresh();message(`Imported “${set.name}” as a new set.`);}finally{event.target.value='';}});
run(refresh);
