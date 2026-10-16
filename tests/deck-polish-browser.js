import {createDeckView} from '../games/board-race/deck-view.js';
import {deckKey,DeckSession} from '../games/board-race/decks.js';
import {concealedCardPart} from '../games/board-race/deck-blur.js';
const board=document.querySelector('#board'),out=document.querySelector('#result');
const {activityAssets}=await import('../shared/activity/repository.js'); const {transact}=await import('../shared/database.js'); const image=await activityAssets.upload(new File([await (await fetch('../shared/brand-mark.png')).blob()],'test.png',{type:'image/png'})); await activityAssets.mediaURL(image); await transact('readwrite',s=>s.delete(image.assetId),'activityAssets');
const cards=[{id:'text',text:'Ask your partner\nhow often they listen to music.'},{id:'image',text:'',image},{id:'mixed',text:'How often do you listen to music?',image}];
const decks=['Ask a question','Make a sentence','Present Perfect Questions'].map((name,i)=>({key:deckKey('presentation-test','deck'+i),deck:{id:'deck'+i,name,color:['#dd784d','#3f7dcc','#ab79bf'][i],cards:cards.map(c=>({...structuredClone(c),id:c.id+i}))}}));
let map={},session,draw,continueCount=0,returnPromise;
const center=()=>({x:12,y:12,width:Math.max(100,board.clientWidth-24),height:320});
const view=createDeckView({board,sound:()=>false,blur:()=>map,onDraw:()=>{},onContinue(){continueCount++;const token=session.returnCard();returnPromise=view.close(draw.deck.key).then(ok=>{if(ok)session.finish(token);});}});
addEventListener('resize',()=>view.render(decks,center(),draw?.deck.key));
const check=(v,m)=>{if(!v)throw Error(m)},rect=e=>e.getBoundingClientRect(),equal=(a,b)=>Math.abs(a.x-b.x)<1&&Math.abs(a.y-b.y)<1&&Math.abs(a.width-b.width)<1&&Math.abs(a.height-b.height)<1;
const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function open(card,mode,index=0){map[decks[index].key]=mode;const entries=structuredClone(decks);entries[index].deck.cards=[structuredClone(card)];session=new DeckSession(entries,()=>0);session.wait(entries[index].key);draw=session.draw(entries[index].key);view.render(decks,center(),draw.deck.key);const promise=view.open(draw);await promise;session.open(draw.generation);return document.querySelector('.race-card-dialog');}
document.querySelector('#run').onclick=async()=>{out.textContent='Running';const original=JSON.stringify(decks);try{
 for(let i=0;i<cards.length;i++)for(const mode of ['word-blur','picture-blur','none']){
  const dialog=await open(cards[i],mode,i),done=dialog.querySelector('.race-card-actions>.primary'),reveal=dialog.querySelector('.card-reveal-line button'),part=concealedCardPart(cards[i],mode),bounds=rect(dialog),footer=rect(done),count=continueCount;
  check(!!reveal===!!part,'Reveal only for existing concealed component');check(done.disabled===!!part,'Completion gate');
  check(dialog.scrollHeight<=dialog.clientHeight+1,'No outer scrollbar');check(footer.bottom<=innerHeight&&footer.top>=0,'Footer in viewport');
  if(part){const target=dialog.querySelector(part==='text'?'p':'img');check(target.inert&&target.getAttribute('aria-hidden')==='true','Concealed accessibility');done.click();check(continueCount===count,'Disabled Done cannot advance');reveal.click();check(!done.disabled&&!target.inert&&!target.hasAttribute('aria-hidden'),'Reveal releases gate/accessibility');check(equal(bounds,rect(dialog))&&equal(footer,rect(done)),'Reveal preserves modal/footer geometry');check(continueCount===count,'Reveal does not advance');}
  const hit=rect(done);check(document.elementFromPoint(hit.x+hit.width/2,hit.y+hit.height/2)===done,'Done receives pointer');done.click();done.click();await returnPromise;check(continueCount===count+1&&session.state==='IDLE','Single return');check(session.inFlight===null&&session.bags.get(draw.deck.key).cursor===1&&session.bags.get(draw.deck.key).last===draw.card.id,'Visual return releases card without rewinding shuffle bag');out.textContent+='\nPASS '+cards[i].id+' / '+mode;
 }
 const dialog=await open(cards[2],'word-blur'),done=dialog.querySelector('.race-card-actions>.primary');check(done.disabled,'Repeated draw conceals again');const existing=board.querySelector('.race-deck');view.render(decks,center(),draw.deck.key);check(existing===board.querySelector('.race-deck'),'Activation does not replace piles');dialog.querySelector('.card-reveal-line button').click();done.click();await returnPromise;
 const long=await open({id:'long-check',text:'Ask your partner how often they listen to music and play board games. '.repeat(12),image},'word-blur'); const body=long.querySelector('.race-card-body'),longDone=long.querySelector('.race-card-actions>.primary'); check(long.scrollTop===0&&long.scrollHeight<=long.clientHeight+1,'Long modal has no outer scroll'); check(rect(body.querySelector('p')).top>=rect(body).top-1,'Long text starts inside scroll region'); const longBounds=rect(long),longFooter=rect(longDone); long.querySelector('.card-reveal-line button').click(); check(equal(longBounds,rect(long))&&equal(longFooter,rect(longDone)),'Long reveal stays fixed'); longDone.click();await returnPromise; check(JSON.stringify(decks)===original,'Authored data unchanged');out.textContent+='\nALL PRESENTATION CHECKS PASSED';
 }catch(e){out.textContent+='\nFAIL '+e.stack;console.error(e);}};
document.querySelector('#preview').onclick=()=>open({id:'long',text:'Ask your partner how often they listen to music, take photos and play board games.\nDescribe a favourite hobby and explain why you enjoy it. '.repeat(6),image},'word-blur');
view.render(decks,center());
const reduced=document.createElement('button');reduced.textContent='Run reduced-motion checks';document.querySelector('#preview').after(reduced);reduced.onclick=async()=>{const original=window.matchMedia;window.matchMedia=query=>query==='(prefers-reduced-motion: reduce)'?{matches:true}:original.call(window,query);try{await document.querySelector('#run').onclick();}finally{window.matchMedia=original;}};



