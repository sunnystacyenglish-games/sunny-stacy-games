import {activityAssets} from '../shared/activity/repository.js';
import {contentRepository} from '../shared/content-library.js';
const output=document.querySelector('#result'),frame=document.querySelector('iframe'),log=s=>output.textContent+=s+'\n',sleep=ms=>new Promise(r=>setTimeout(r,ms));
const assert=(v,m)=>{if(!v)throw Error(m);};
async function wait(fn,message){for(let i=0;i<200;i++){if(fn())return;await sleep(50);}throw Error('Timed out: '+message);}
const fixture=(type,data)=>({id:'delta9-'+type,name:'Delta 9 '+type,gameType:'authoring-'+type,schemaVersion:1,content:{type,version:1,data},themeConfig:{theme:'notebook'},gameplayConfig:{},metadata:{createdAt:'2026-10-12T00:00:00Z',updatedAt:'2026-10-12T00:00:00Z'}});
let doc;
async function open(url){frame.src=url;await new Promise(r=>frame.onload=r);doc=frame.contentDocument;await wait(()=>doc.querySelector('#setup[open]'),'setup');}
function click(selector){const n=doc.querySelector(selector);assert(n&&!n.disabled,'Available '+selector);n.click();}
async function launch(){await wait(()=>!doc.querySelector('#play').disabled,'play validation');click('#play');await wait(()=>!doc.querySelector('#setup').open,'launch');if(doc.querySelector('#pawns[open]')){click('#startGame');await wait(()=>!doc.querySelector('#roll').disabled,'first player');}}
async function reveal(){const button=doc.querySelector('.activity-task-reveal');assert(button&&!button.disabled,'Reveal available');button.click();}
async function ttt(type,deckId=''){
 await open('../games/tic-tac-toe/?contentMode='+type+'&contentId=delta9-'+type+'&taskDeckId='+deckId+'&sound=false&steal=true');await launch();click('#cells button');await wait(()=>doc.querySelector('#task').open,'task');
 if(type==='sentenceCorrection'){
  assert(doc.querySelector('#correct').disabled,'Sentence grade locked');const first=doc.querySelector('.activity-task-text').textContent;await reveal();click('#incorrect');await wait(()=>doc.querySelector('#taskContext').textContent.includes('steal')&&doc.querySelector('.activity-task-reveal'),'steal');assert(doc.querySelector('.activity-task-text').textContent!==first,'Steal gets alternative');assert(doc.querySelector('#correct').disabled,'Steal grade locked');await sleep(600);await reveal();
 }else{await wait(()=>!doc.querySelector('#correct').disabled,'card ready');assert(!doc.querySelector('.activity-task-reveal'),'No invented card answer');}
 await wait(()=>!doc.querySelector('#correct').disabled,'grade');click('#correct');await wait(()=>doc.body.dataset.state==='SELECT_CELL','turn');assert(doc.querySelector('#cells button').dataset.player,'Marker placed');log('PASS Tic-Tac-Toe '+type+' '+deckId);
}
async function board(type,mode){
 await open('../games/board-race/?contentMode='+type+'&contentId=delta9-'+type+'&sound=false&special=false&mode='+mode+'&size=12');await launch();const before=[...doc.querySelectorAll('.race-piece')].map(n=>n.getAttribute('aria-label'));click('#roll');await wait(()=>doc.querySelector('#task').open,'board task');assert(JSON.stringify(before)===JSON.stringify([...doc.querySelectorAll('.race-piece')].map(n=>n.getAttribute('aria-label'))),'No movement before assessment');
 if(type==='bridge'){
  assert(doc.querySelector('.activity-task-reveal').disabled,'Empty bridge reveal locked');const gaps=[...doc.querySelectorAll('.activity-task-gap')];for(const gap of gaps.reverse()){gap.click();[...doc.querySelectorAll('.activity-task-option')].filter(o=>o.dataset.groupId===gap.dataset.groupId).at(-1).click();}
 }assert(doc.querySelector('.teacher-actions button').disabled,'Grade locked before reveal');await reveal();assert(!doc.querySelector('.activity-task-reveal'),'Reveal removed');click('.teacher-actions button:not([hidden])');await wait(()=>doc.body.dataset.state==='READY','incorrect turn');assert(JSON.stringify(before)===JSON.stringify([...doc.querySelectorAll('.race-piece')].map(n=>n.getAttribute('aria-label'))),'Incorrect did not move');log('PASS Board Race '+type+' '+mode+' pre-move, reveal, Incorrect');
}
const regression=document.createElement('button');regression.textContent='Run turn and responsive checks';document.querySelector('#run').after(regression);
regression.onclick=async()=>{
 if(location.port!=='4180')return;regression.disabled=true;output.textContent='';
 try{
  await open('../games/tic-tac-toe/?contentMode=sentenceCorrection&contentId=delta9-sentenceCorrection&sound=false&steal=false');await launch();
  for(const [sequence,state] of [[[0,3,1,4,2],'WIN'],[[0,1,2,4,3,5,7,6,8],'DRAW']]){
   const starter=doc.querySelector('.player.active').dataset.player;
   for(const i of sequence){click(`#cells button:nth-child(${i+1})`);await wait(()=>doc.querySelector('#task').open,'turn task');await reveal();click('#correct');await wait(()=>doc.body.dataset.state==='SELECT_CELL'||doc.querySelector('#result').open,'turn outcome');}
   assert(doc.body.dataset.state===state,state);click('#again');assert(doc.body.dataset.state==='SELECT_CELL','Replay');assert(doc.querySelector('.player.active').dataset.player!==starter,'Alternating starter');
  }
  click('#cells button');await wait(()=>doc.querySelector('#task').open,'no steal');await reveal();click('#incorrect');await wait(()=>doc.body.dataset.state==='SELECT_CELL','no steal finish');assert(!doc.querySelector('#cells button').dataset.player,'Incorrect leaves cell empty');log('PASS Sentence Correction win, draw, replay, alternating starter, Steal OFF');
  for(const game of ['tic-tac-toe','board-race']){
   await open('../games/'+game+'/?set=animals-1&contentMode=concepts&sound=false&special=false');await launch();click(game==='tic-tac-toe'?'#cells button':'#roll');await wait(()=>doc.querySelector('#task').open,'concept task');assert(!doc.querySelector('#taskImage').hidden,'Existing concept visible');click('#reveal');click(game==='tic-tac-toe'?'#correct':'#taskDone');await wait(()=>['READY','SELECT_CELL'].includes(doc.body.dataset.state),'concept completion');log('PASS existing Concepts '+game);
  }
  const long=fixture('sentenceCorrection',{sentences:[{id:'long',incorrect:'She go. '+('This is a long classroom task with several sentences. ').repeat(30),correct:'She goes. '+('This is a long classroom task with several sentences. ').repeat(30)}]});long.id='delta9-long';await contentRepository.save(long);
  for(const game of ['tic-tac-toe','board-race'])for(const [width,height] of [[390,844],[740,390]]){
   frame.style.width=width+'px';frame.style.height=height+'px';await open('../games/'+game+'/?contentMode=sentenceCorrection&contentId=delta9-long&sound=false&special=false');await launch();click(game==='tic-tac-toe'?'#cells button':'#roll');await wait(()=>doc.querySelector('#task').open,'long task');await reveal();
   assert(doc.documentElement.scrollWidth<=width+1,'No horizontal overflow');const dialog=doc.querySelector('#task').getBoundingClientRect();assert(dialog.top>=-1&&dialog.bottom<=height+1,'Dialog in viewport');for(const b of doc.querySelectorAll('#task .teacher-actions button')){const r=b.getBoundingClientRect();assert(r.top>=0&&r.bottom<=height,'Controls visible');assert(doc.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===b,'Controls unobscured');}
   assert(doc.querySelector('#authoredTask').scrollHeight>doc.querySelector('#authoredTask').clientHeight,'Long content scrolls');log('PASS '+game+' long task '+width+'x'+height);
  }
  log('ALL TURN AND RESPONSIVE CHECKS PASSED');
 }catch(e){log('FAIL '+e.stack);}finally{regression.disabled=false;}
};
document.querySelector('#run').onclick=async()=>{
 if(location.port!=='4180'){log('Use the isolated test server on port 4180. No records were written.');return;}
 output.textContent='';document.querySelector('#run').disabled=true;
 try{
  const media=await activityAssets.upload(new File([await (await fetch('../shared/brand-mark.png')).blob()],'card.png',{type:'image/png'}));
  const documents=[fixture('sentenceCorrection',{sentences:[{id:'s1',incorrect:'She go to school.',correct:'She goes to school.'},{id:'s2',incorrect:'They is here.',correct:'They are here.'}]}),fixture('bridge',{bridges:[{id:'b',bricks:[{id:'a',text:'I'},{id:'b',text:'go'},{id:'c',text:'by bus'}],gaps:[{id:'g1',brickId:'b',groupId:'one'},{id:'g2',brickId:'c',groupId:'two'}],groups:[{id:'one',distractors:[{id:'d1',text:'goes'}]},{id:'two',distractors:[{id:'d2',text:'on bus'}]}]}]}),fixture('cardDecks',{decks:[{id:'text',name:'Text only',color:'#abcdef',cards:[{id:'c1',text:'Describe your favourite weekend.'}]},{id:'image',name:'Image only',color:'#123456',cards:[{id:'c2',text:'',image:media}]},{id:'both',name:'Text and image',color:'#987654',cards:[{id:'c3',text:'Tell a story.',image:media}]}]})];
  for(const item of documents)await contentRepository.save(item);
  await ttt('sentenceCorrection');for(const deck of ['text','image','both'])await ttt('cardDecks',deck);
  for(const mode of ['race','endless'])for(const type of ['sentenceCorrection','bridge'])await board(type,mode);
  for(const item of documents)assert(JSON.stringify(await contentRepository.get(item.id))===JSON.stringify(item),'Source unchanged '+item.id);
  log('PASS author documents unchanged; all browser checks finished');
 }catch(error){log('FAIL '+error.stack);}finally{document.querySelector('#run').disabled=false;}
};
