import {activityRegistry} from '../shared/activity/catalog.js';
import {createActivity} from '../shared/activity/definition.js';
import {activityRepository,activityAssets} from '../shared/activity/repository.js';
import {transact} from '../shared/database.js';
const frame=document.querySelector('iframe'),out=document.querySelector('pre'),repo=activityRepository(activityRegistry);
const pause=ms=>new Promise(r=>setTimeout(r,ms)),ids=[],assets=[];let doc;
const $=s=>doc.querySelector(s),btn=t=>[...doc.querySelectorAll('button')].find(b=>b.textContent===t);
const check=(v,m)=>{if(!v)throw Error(m);},pass=m=>out.textContent+='PASS '+m+'\n';
async function wait(f){for(let i=0;i<300;i++){if(f())return;await pause(25);}throw Error('Timeout '+f);}
async function load(url){frame.src=url;await new Promise(r=>frame.onload=r);doc=frame.contentDocument;}
async function scene(portrait){
 const c=document.createElement('canvas');c.width=portrait?1000:1800;c.height=portrait?1800:1000;const x=c.getContext('2d');x.fillStyle='#ece9d8';x.fillRect(0,0,c.width,c.height);
 // Detailed, deterministic artwork used to check source-image crop alignment.
 for(let row=0;row<18;row++)for(let col=0;col<12;col++){x.fillStyle=['#597f6b','#deab65','#8487a9','#c67469'][(row+col)%4];x.beginPath();x.arc((col+.5)*c.width/12,(row+.5)*c.height/18,8+(col%3)*5,0,7);x.fill();}
 x.fillStyle='#d22648';x.fillRect(.48*c.width,.48*c.height,.02*c.width,.02*c.height);
 const bg=await activityAssets.upload(new File([await new Promise(r=>c.toBlob(r))],'delta5.png',{type:'image/png'}));assets.push(bg.assetId);
 const data={background:bg,assets:[{id:'a',name:'Picture',media:bg}],objects:[{id:'a',assetId:'a',x:.15,y:.2,width:.1,height:.12},{id:'d',assetId:'a',x:.8,y:.8,width:.1,height:.1}],hotspots:[{id:'h',x:.48,y:.48,width:.02,height:.02},{id:'h2',x:.515,y:.48,width:.01,height:.02}],targets:[{id:'t',prompt:'Find the picture and the two small background details.',answers:[{id:'a',type:'object',sceneObjectId:'a'},{id:'h',type:'hotspot',hotspotId:'h'},{id:'h2',type:'hotspot',hotspotId:'h2'}]}]};
 const a=createActivity({name:'Delta 5 '+(portrait?'portrait':'landscape'),gameType:'authoring-scene',content:{type:'scene',version:2,data}},activityRegistry);await repo.save(a);ids.push(a.id);return a;
}
function tap(x,y){const r=$('#scene').getBoundingClientRect();$('#scene').dispatchEvent(new frame.contentWindow.MouseEvent('click',{bubbles:true,detail:1,clientX:r.left+x*r.width,clientY:r.top+y*r.height}));}
function pointer(node,from,to,button=0){const W=frame.contentWindow;node.setPointerCapture=()=>{};for(const [type,p] of [['pointerdown',from],['pointermove',to],['pointerup',to]])node.dispatchEvent(new W.PointerEvent(type,{bubbles:true,button,pointerId:1,clientX:p.x,clientY:p.y}));}
async function cleanup(){for(const id of ids.splice(0))await transact('readwrite',s=>s.delete(id),'activities');for(const id of assets.splice(0))await transact('readwrite',s=>s.delete(id),'activityAssets');}
document.querySelector('#run').onclick=async()=>{document.querySelector('#run').disabled=true;out.textContent='';const key='sunny-stacy.i-spy.settings.v1',saved=localStorage.getItem(key);try{
 for(const portrait of [true,false]){
  const a=await scene(portrait),original=JSON.stringify(a.content.data);
  for(const [w,h] of [[1000,800],[390,740],[760,420],[768,1024]]){
   frame.style.width=w+'px';frame.style.height=h+'px';await load('../games/i-spy/?activity='+a.id+'&sound=false');await wait(()=>$('#setup')?.open);$('#setupForm').requestSubmit();await wait(()=>doc.body.dataset.state==='INPUT');
   tap(.49,.49);check($('#counter').textContent==='0 / 3','First tap cannot score');check(!$('.spy-lens').hidden,'Lens visible');
   tap(.2,.26);check($('#counter').textContent==='0 / 3','Outside moves without scoring');tap(.2,.26);check($('#counter').textContent==='1 / 3','Object confirmation');tap(.2,.26);check($('#counter').textContent==='1 / 3','No repeat');
   tap(.85,.85);tap(.85,.85);check($('#counter').textContent==='1 / 3','Distractor wrong');
   tap(.49,.49);tap(.49,.49);check($('#counter').textContent==='2 / 3','Only one nearby hotspot');
   frame.style.width=(w-20)+'px';await pause(70);tap(.49,.49);check($('#counter').textContent==='3 / 3','Resize retains source coordinates and next eligible hit');await wait(()=>$('#complete').open);
   check($('#scene').querySelectorAll('[id=sceneBackground]').length===1,'No duplicate IDs');check($('.spy-lens').inert,'Copy inert');
   $('#again').click();await wait(()=>doc.body.dataset.state==='INPUT');tap(.005,.005);check($('#counter').textContent==='0 / 3','Edge position no score');tap(.005,.005);check($('#counter').textContent==='0 / 3','Empty edge no false positive');
  }
  check(JSON.stringify((await repo.get(a.id)).content.data)===original,'Gameplay preserves saved data');pass((portrait?'Portrait':'Landscape')+' gameplay: two taps, relocation, object, decoy, tiny nearby hotspots, repeat, resize, edge and victory at 4 sizes');
  frame.style.width='1100px';frame.style.height='850px';await load('../content/editor.html?id='+a.id);await wait(()=>btn('Next'));btn('Next').click();await wait(()=>$('.scene-background')?.naturalWidth>0);await pause(80);
  const r0=$('.scene-canvas').getBoundingClientRect();btn('+').click();btn('+').click();const r1=$('.scene-canvas').getBoundingClientRect();check(r1.width>r0.width*1.5,'Zoom enlarges');
  const stage=$('.scene-stage'),sr=stage.getBoundingClientRect();pointer(stage,{x:sr.left+sr.width/2,y:sr.top+sr.height/2},{x:sr.left+sr.width/2-30,y:sr.top+sr.height/2-40},2);check(stage.scrollLeft>0||stage.scrollTop>0,'Right drag pans');check(JSON.stringify((await repo.get(a.id)).content.data)===original,'View does not save');
  const canvas=$('.scene-canvas').getBoundingClientRect(),object=$('[data-entity-id=a]');pointer(object,{x:canvas.left+canvas.width*.2,y:canvas.top+canvas.height*.25},{x:canvas.left+canvas.width*.23,y:canvas.top+canvas.height*.27});
  await pause(60);const moved=$('[data-entity-id=a]');check(Math.abs(parseFloat(moved.style.left)-18)<.001,'Inverse zoom drag x');check(Math.abs(parseFloat(moved.style.top)-22)<.001,'Inverse zoom drag y');
  const beforeTarget=$('.scene-canvas').getBoundingClientRect();const picker=$('select[aria-label="Select Prompt"]');picker.dispatchEvent(new frame.contentWindow.Event('change'));await pause(50);const afterTarget=$('.scene-canvas').getBoundingClientRect();check(Math.abs(beforeTarget.width-afterTarget.width)<1&&Math.abs(beforeTarget.left-afterTarget.left)<1,'Target switching preserves view');
  $('#contentForm').requestSubmit();await wait(()=>$('#status').textContent==='Saved');const savedScene=await repo.get(a.id);check(Math.abs(savedScene.content.data.objects[0].x-.18)<.001,'Saved normalized x');
  btn('Add Hotspot').click();await pause(40);
  const cr=$('.scene-canvas').getBoundingClientRect();pointer($('.scene-canvas'),{x:cr.left+cr.width*.6,y:cr.top+cr.height*.6},{x:cr.left+cr.width*.65,y:cr.top+cr.height*.65});
  check(doc.querySelectorAll('.scene-hotspot').length===3,'Create hotspot while zoomed');const drawn=[...doc.querySelectorAll('.scene-hotspot')].at(-1);check(Math.abs(parseFloat(drawn.style.left)-60)<.001&&Math.abs(parseFloat(drawn.style.width)-5)<.001,'Hotspot inverse transform');
  btn('Add Hotspot').click();$('#contentForm').requestSubmit();await wait(()=>$('#status').textContent==='Saved');check((await repo.get(a.id)).content.data.hotspots.length===3,'New region saved');
  btn('Fit to width').click();check($('.scene-view-tools output').textContent==='100%','Fit resets');btn('+').click();btn('Reset view').click();check($('.scene-view-tools output').textContent==='100%','Reset');
  await load('../content/editor.html?id='+a.id);await wait(()=>btn('Next'));btn('Next').click();await wait(()=>$('.scene-background')?.naturalWidth>0);check(Math.abs(parseFloat($('[data-entity-id=a]').style.left)-18)<.001,'Reload keeps placement');for(const [w,h] of [[390,740],[760,420],[1000,720]]){frame.style.width=w+'px';frame.style.height=h+'px';await pause(80);check(doc.documentElement.scrollWidth<=w,'Editor horizontal bounds '+w);btn('+').click();btn('Fit to width').click();const rr=$('.scene-canvas').getBoundingClientRect(),sr=$('.scene-stage').getBoundingClientRect();check(rr.left>=sr.left-1&&rr.right<=sr.right+1&&Math.abs(rr.width-$('.scene-stage').clientWidth)<1,'Fit uses full stage width');}
  const crowded=await repo.get(a.id);crowded.content.data.targets=Array.from({length:20},(_,i)=>({...structuredClone(crowded.content.data.targets[0]),id:'target-'+i,prompt:'Target '+(i+1)+' — inspect the detailed background and find the linked answers.'}));await repo.save(crowded);frame.style.width='1100px';frame.style.height='850px';await load('../content/editor.html?id='+a.id);await wait(()=>btn('Next'));btn('Next').click();await wait(()=>$('.scene-background')?.naturalWidth>0);await pause(50);btn('← Prepare Content').click();const panel=$('.scene-prompts'),beforeScroll=$('.scene-background-column').getBoundingClientRect();check(panel.scrollHeight>panel.clientHeight,'20 targets scroll independently');panel.scrollTop=panel.scrollHeight;const afterScroll=$('.scene-background-column').getBoundingClientRect();check(Math.abs(beforeScroll.top-afterScroll.top)<1,'Target scroll keeps scene stable');
  pass((portrait?'Portrait':'Landscape')+' editor: zoom, pan, inverse drag, hotspot creation, target switching, fit/reset, save/reopen and responsive bounds');
 }
 pass('ALL DELTA 5 CHECKS');
 }catch(e){out.textContent+='FAIL '+e.stack;console.error(e);}finally{if(saved===null)localStorage.removeItem(key);else localStorage.setItem(key,saved);await cleanup();document.querySelector('#run').disabled=false;}};
document.querySelector('#preview').onclick=async()=>{const a=await scene(true);await load('../games/i-spy/?activity='+a.id+'&sound=false');await wait(()=>$('#setup')?.open);$('#setupForm').requestSubmit();await wait(()=>doc.body.dataset.state==='INPUT');tap(.49,.49);out.textContent='Portrait preview (test scene)';};

