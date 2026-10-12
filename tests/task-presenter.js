import {mountTaskPresenter} from '../shared/tasks/presenter.js';
const $=id=>document.getElementById(id),presenter=mountTaskPresenter($('content'),{onReady:ready=>{for(const id of ['correct','incorrect'])$(id).disabled=!ready;}});
const bridge={id:'b',type:'bridge',bricks:[{id:'a',text:'I'},{id:'b',text:'go'},{id:'c',text:'to school'},{id:'d',text:'by bus'},{id:'e',text:'.'}],gaps:[{id:'g1',brickId:'b',groupId:'verb'},{id:'g2',brickId:'d',groupId:'travel'}],groups:[{id:'verb',distractors:[{id:'d1',text:'goes'},{id:'d2',text:'go'},{id:'d3',text:'go'}]},{id:'travel',distractors:[{id:'d4',text:'on bus'}]}]};
$('sentence').onclick=()=>presenter.show({id:'s',type:'sentenceCorrection',incorrect:'She go to school every day.',correct:'She goes to school every day.'});
$('bridge').onclick=()=>presenter.show(bridge);
$('card').onclick=()=>presenter.show({id:'c',type:'cardDecks',text:'Describe your favourite weekend.'});
for(const id of ['correct','incorrect'])$(id).onclick=()=>{if(presenter.canResolve){$('result').textContent='Teacher result: '+id;presenter.clear();}};
$('sentence').click();
