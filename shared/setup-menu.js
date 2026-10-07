import {CONTENT_LIMITS} from './activity/limits.js';
import {activityRegistry} from './activity/catalog.js';
import {jsonCopy} from './activity/contracts.js';
import {themes} from './themes.js';
import {folderRepository,DEFAULT_FOLDER_COLOR} from './folders.js';
import {setRepository} from './sets.js';
import {showImage} from './images.js';
import {createWheelPicker} from './wheel-picker.js';
import {applyTheme} from '../games/dobble/theme-view.js';

const node=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!==undefined)el.textContent=text;return el;};
const button=(text,action,className='')=>{const el=node('button',className,text);el.type='button';el.onclick=action;return el;};
activityRegistry.registerEditor('conceptSet',context=>context.mountConceptSet());
activityRegistry.registerEditor('builtInPrompts',({host,activity})=>{const note=document.createElement('p');note.className='setup-help';note.textContent='Built-in '+activity.content.data.mode+' prompts. No reusable set is required.';host.append(note);return {read:()=>jsonCopy(activity.content.data)};});
let serial=0;
const copyExclusions=map=>new Map([...map].map(([key,ids])=>[key,new Set(ids)]));

// Existing inputs remain the source of truth. Tabs only show/hide panels;
// exclusions live in this controller, never in a saved set or localStorage.
export function mountSetupMenu({gameType,activity,editorServices={},registry=activityRegistry,dialog,form,title,setSelect,themeSelect,sound,getSets,setSets,onContentChange,gameplay=[],visuals=[],contentNotes=[],status=[],footer,committedTheme,state={excluded:new Map()},buttonChoices=[]}){
 gameType??=activity?.gameType||'dobble';if(activity&&activity.gameType!==gameType)throw Error('Activity and editor game do not match.');
 const contentType=activity?.content.type||'conceptSet',mountContent=registry.editor(gameType,contentType);
 const customContent=contentType!=='conceptSet';let editor;
 const key='setup-'+ ++serial,originalChildren=[...form.children];let excluded=copyExclusions(state.excluded),folders=[],folderFilter='all',activeTab='content',contentSignature='',committed=false,refreshToken=0;
 const widgets=new Map();dialog.classList.add('unified-setup');
 const heading=node('div','setup-heading');heading.append(title);
 const tabs=node('div','setup-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label','Game configuration');
 const body=node('div','setup-body'),panels={};
 for(const [id,label] of [['content','Content'],['themes','Themes'],['gameplay','Gameplay']]){
  const tab=button(label,()=>activate(id));tab.id=key+'-'+id+'-tab';tab.setAttribute('role','tab');tab.setAttribute('aria-controls',key+'-'+id);tab.dataset.tab=id;tabs.append(tab);
  const panel=node('section','setup-panel');panel.id=key+'-'+id;panel.dataset.panel=id;panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tab.id);panels[id]=panel;body.append(panel);
 }
 tabs.onkeydown=event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const entries=[...tabs.children],index=entries.indexOf(document.activeElement),next=event.key==='Home'?0:event.key==='End'?2:(index+(event.key==='ArrowRight'?1:2))%3;entries[next].click();entries[next].focus();};
 function activate(id){activeTab=id;for(const tab of tabs.children){const selected=tab.dataset.tab===id;tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;}for(const [name,panel] of Object.entries(panels))panel.hidden=name!==id;requestAnimationFrame(syncWidgets);}

 const library=node('div','setup-library'),folderPane=node('div','setup-folder-pane'),setPane=node('div','setup-set-pane'),folderList=node('div','setup-folder-list'),setList=node('div','setup-set-list');
 folderList.setAttribute('aria-label','Folders');setList.setAttribute('aria-label','Sets');folderPane.append(node('h3','','Folders'),folderList);setPane.append(node('h3','','Sets'),setList);library.append(folderPane,setPane);
 const summary=node('p','setup-content-summary'),rows=node('div','setup-concepts');rows.setAttribute('aria-label','Selected set concepts');
 const explanation=node('p','setup-help','Untick a concept to leave it out of this game only. Edit opens the saved set in a new tab.');
 const builtinNote=node('p','setup-help','Built-in sets open as editable copies.');
 const mountConceptSet=()=>{ const originalLabel=setSelect.closest('label');setSelect.hidden=true;setSelect.tabIndex=-1;setSelect.setAttribute('aria-hidden','true');
 if(originalLabel){originalLabel.hidden=true;panels.content.append(originalLabel);}else panels.content.append(setSelect);
 panels.content.append(node('h3','','Concepts'),node('p','setup-help','Max. '+CONTENT_LIMITS.conceptSet.concepts+' concepts per set. Older larger sets remain available.'),library,summary,explanation,builtinNote,rows,...contentNotes.filter(Boolean));

 return null;};
 editor=mountContent({host:panels.content,services:editorServices,activity:activity?jsonCopy(activity):null,mountConceptSet,onChange:()=>onContentChange?.()});

 themeSelect.hidden=true;themeSelect.tabIndex=-1;themeSelect.setAttribute('aria-hidden','true');panels.themes.append(themeSelect);
 themeSelect.addEventListener('change',()=>{if(dialog.open)applyTheme(themeSelect.value);});
 const themeButtons=[];
 for(const [label,ids] of [['Light Themes',['nature','candy','ocean','notebook']],['Dark Themes',['space','chalkboard','board-game','magic-school']]]){
  panels.themes.append(node('h3','setup-section-title',label));const grid=node('div','setup-theme-grid');
  for(const id of ids){const theme=themes.find(t=>t.id===id);if(!theme)continue;const card=button('',()=>{themeSelect.value=id;themeSelect.dispatchEvent(new Event('change',{bubbles:true}));applyTheme(id);sync();},'setup-theme-card');card.dataset.themeOption=id;card.setAttribute('aria-label',theme.name);
   const mini=node('span','setup-theme-mini');mini.dataset.previewTheme=id;mini.style.setProperty('--preview-bg',theme.bg);mini.style.setProperty('--preview-ink',theme.ink);mini.style.setProperty('--preview-card',theme.card);mini.style.setProperty('--preview-accent',theme.accent);
   if(theme.images.length){const image=node('img');image.src=new URL('./theme-assets/'+theme.images[0],import.meta.url);image.alt='';image.draggable=false;mini.append(image);}else mini.append(node('span','preview-stars','✦ · ✧ · ✦'));
   const pieces=node('span','preview-pieces');pieces.append(node('i'),node('i'),node('i'));mini.append(pieces);const caption=node('span','theme-caption',theme.name),check=node('span','theme-check','✓');check.setAttribute('aria-hidden','true');card.append(mini,caption,check);grid.append(card);themeButtons.push(card);
  }panels.themes.append(grid);
 }
 const soundLabel=sound.closest('label')||node('label');if(!sound.parentNode)soundLabel.append(sound,node('span','','Sound'));soundLabel.classList.add('setup-toggle');sound.setAttribute('role','switch');panels.themes.append(soundLabel);
 panels.themes.append(...visuals.filter(Boolean));
 panels.gameplay.append(...gameplay.filter(Boolean));
 for(const input of panels.gameplay.querySelectorAll('input[type=checkbox]')){input.setAttribute('role','switch');input.closest('label')?.classList.add('setup-toggle');}
 const actions=node('div','setup-footer');for(const note of status.filter(Boolean)){note.classList.add('setup-status');actions.append(note);}actions.append(footer);form.replaceChildren(heading,tabs,body,actions);const legacy=node('div');legacy.hidden=true;for(const child of originalChildren)if(!form.contains(child))legacy.append(child);form.append(legacy);

 function sessionSet(set){if(!set)return null;const ids=excluded.get(set.id);return structuredClone({...set,items:set.items.filter(item=>!ids?.has(item.id))});}
 function contentKey(set){const filtered=sessionSet(set);return JSON.stringify([filtered?.id,filtered?.updatedAt,filtered?.items.map(i=>i.id)]);}
 function syncContent(){
  if(customContent){editor?.sync?.();return;}
  const sets=getSets(),selected=sets.find(s=>s.id===setSelect.value),signature=JSON.stringify([folderFilter,folders,sets.map(s=>[s.id,s.name,s.folderId,s.updatedAt]),selected?.id,selected?.items.map(i=>[i.id,i.word]),[...(excluded.get(selected?.id)||[])]]);
  if(signature===contentSignature)return;contentSignature=signature;folderList.replaceChildren();setList.replaceChildren();rows.replaceChildren();
  const destinations=[{id:'all',name:'All sets'},{id:'root',name:'My Content'},...folders];
  for(const folder of destinations){const choice=button(folder.name,()=>{folderFilter=folder.id;syncContent();},'setup-folder');choice.setAttribute('aria-pressed',String(folderFilter===folder.id));choice.dataset.folderId=folder.id;if(!['all','root'].includes(folder.id)){const dot=node('span','folder-dot');dot.style.backgroundColor=/^#[0-9a-f]{6}$/i.test(folder.color)?folder.color:DEFAULT_FOLDER_COLOR;choice.prepend(dot);}folderList.append(choice);}
  const filtered=sets.filter(s=>folderFilter==='all'||(folderFilter==='root'?!s.folderId:s.folderId===folderFilter));
  for(const set of filtered){const choice=button(set.name,()=>{setSelect.value=set.id;setSelect.dispatchEvent(new Event('change',{bubbles:true}));sync();},'setup-set');choice.dataset.setId=set.id;choice.setAttribute('aria-pressed',String(setSelect.value===set.id));setList.append(choice);}
  if(!filtered.length)setList.append(node('p','setup-help','No sets in this folder.'));
  const included=sessionSet(selected)?.items.length||0;summary.textContent=selected?`${selected.name} · ${included} of ${selected.items.length} concepts included`:'Choose a set.';builtinNote.hidden=!selected?.builtin;
  for(const item of selected?.items||[]){const row=node('div','setup-concept'),label=node('label','concept-include'),include=node('input');include.type='checkbox';include.checked=!excluded.get(selected.id)?.has(item.id);include.setAttribute('aria-label','Include '+item.word);label.append(include);const word=node('span','concept-word',item.word),visual=node('span','concept-image');showImage(visual,item.image,item.word);row.classList.toggle('excluded',!include.checked);row.dataset.conceptId=item.id;
   const edit=node('a','concept-edit','Edit'),url=new URL('../sets/editor.html',import.meta.url);url.searchParams.set('id',selected.id);url.searchParams.set('item',item.id);edit.href=url.href;edit.target='_blank';edit.rel='noopener';edit.setAttribute('aria-label','Edit '+item.word);row.append(label,word,visual,edit);
   include.onchange=()=>{let ids=excluded.get(selected.id);if(!ids){ids=new Set();excluded.set(selected.id,ids);}include.checked?ids.delete(item.id):ids.add(item.id);row.classList.toggle('excluded',!include.checked);contentSignature='';onContentChange();sync();const replacement=rows.querySelector(`[data-concept-id="${CSS.escape(item.id)}"] input`);replacement?.focus({preventScroll:true});};rows.append(row);
  }
 }
 function optionsWidget(source,options,value,change,label){
  const signature=JSON.stringify(options);let entry=widgets.get(source);
  if(!entry||entry.signature!==signature){entry?.widget.element.remove();let widget;
   if(options.length>=3)widget=createWheelPicker({options,value,onChange:change,label});
   else{const host=node('div','setup-segmented');host.setAttribute('role','group');host.setAttribute('aria-label',label);for(const option of options){const item=button(option.label,()=>change(option.value));item.disabled=!!option.disabled;item.dataset.value=option.value;host.append(item);}widget={element:host,setValue(next){for(const child of host.children)child.setAttribute('aria-pressed',String(child.dataset.value===String(next)));}};}
   source.after(widget.element);widgets.set(source,entry={signature,widget});
  }entry.widget.setValue(value);
 }
 function syncWidgets(){
  for(const select of [...panels.gameplay.querySelectorAll('select'),...visuals.flatMap(el=>[...el.querySelectorAll('select')])]){select.hidden=true;select.tabIndex=-1;select.setAttribute('aria-hidden','true');optionsWidget(select,[...select.options].map(o=>({value:o.value,label:o.textContent,disabled:o.disabled||select.disabled})),select.value,value=>{select.value=value;select.dispatchEvent(new Event('change',{bubbles:true}));sync();},select.getAttribute('aria-label')||select.closest('label')?.firstChild?.textContent?.trim()||'Choose an option');}
  for(const {element:source,label} of buttonChoices){source.hidden=true;const buttons=[...source.querySelectorAll('button')];optionsWidget(source,buttons.map(b=>({value:b.dataset.length||b.dataset.value,label:b.textContent,disabled:b.disabled})),buttons.find(b=>b.getAttribute('aria-pressed')==='true')?.dataset.length||buttons.find(b=>b.getAttribute('aria-pressed')==='true')?.dataset.value,value=>{buttons.find(b=>(b.dataset.length||b.dataset.value)===value)?.click();sync();},label);}
 }
 function sync(){syncContent();syncWidgets();for(const card of themeButtons)card.setAttribute('aria-pressed',String(card.dataset.themeOption===themeSelect.value));}
 async function refreshLibrary(){if(customContent){editor?.sync?.();return;}const token=++refreshToken;try{const [nextFolders,nextSets]=await Promise.all([folderRepository.list(),setRepository.list()]);if(token!==refreshToken||!dialog.isConnected)return;folders=nextFolders;if(!['all','root'].includes(folderFilter)&&!folders.some(f=>f.id===folderFilter))folderFilter='all';const value=setSelect.value;setSets(nextSets);setSelect.replaceChildren(new Option('Choose a content set',''),...nextSets.map(set=>new Option(set.name,set.id)));setSelect.value=nextSets.some(s=>s.id===value)?value:'';setSelect.dispatchEvent(new Event('change',{bubbles:true}));sync();}catch{sync();}}
 const focusRefresh=()=>{if(dialog.open)refreshLibrary();};addEventListener('focus',focusRefresh);
 const onClose=()=>{if(dialog.open)return;if(!committed)editor?.cancel?.();if(!committed)excluded=copyExclusions(state.excluded);applyTheme(committedTheme());};dialog.addEventListener('close',onClose);
 const onFormChange=()=>queueMicrotask(sync);form.addEventListener('change',onFormChange);activate('content');sync();
 return {readContent(){return customContent?jsonCopy(editor.read()):{setId:setSelect.value};},sessionSet,contentKey,sync,refreshLibrary,begin(){editor?.begin?.();committed=false;excluded=copyExclusions(state.excluded);contentSignature='';sync();activate(activeTab);refreshLibrary();},commit(){editor?.commit?.();state.excluded=copyExclusions(excluded);committed=true;},destroy(){dialog.removeEventListener('close',onClose);form.removeEventListener('change',onFormChange);editor?.destroy?.();refreshToken++;removeEventListener('focus',focusRefresh);}};
}
