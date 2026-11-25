import {contentRepository} from '../shared/content-library.js';
const f=document.querySelector('iframe'),out=document.querySelector('#log');let d;
const wait=async(fn,msg)=>{for(let i=0;i<400;i++){if(fn())return;await new Promise(r=>setTimeout(r,25));}throw Error(msg)};const assert=(v,m)=>{if(!v)throw Error(m)};
document.querySelector('#run').onclick=async()=>{if(location.port!=='4180')throw Error('Isolated test origin');out.textContent='';try{
 const source=await contentRepository.get('quiz-label-test-quiz');const record={...source,id:'quiz-visual-fixture',name:'Quiz visual review',content:{...source.content,data:{questions:[{id:'tf',mode:'trueFalse',text:'Can a bird fly?',answers:[{id:'true',text:'True'},{id:'false',text:'False'}],correctIds:['true']}]}}};await contentRepository.save(record);
 for(const game of ['tic-tac-toe','board-race','chomp'])for(const theme of ['nature','candy','ocean','notebook','space','chalkboard','board-game','magic-school']){
 f.style.width='1100px';f.src='../games/'+game+'/?contentMode=quiz&contentId='+record.id+'&theme='+theme+'&sound=false&players=1&shuffleQuestions=false';await new Promise(r=>f.onload=r);d=f.contentDocument;await wait(()=>d.querySelector('#setup')?.open&&d.querySelector('#play')&&!d.querySelector('#play').disabled,'Setup '+game);d.querySelector('#play').click();
 if(game==='tic-tac-toe'){await wait(()=>d.body.dataset.state==='SELECT_CELL','Cells');d.querySelector('#cells button:not(:disabled)').click();}
 if(game==='board-race'){await wait(()=>d.querySelector('#pawns')?.open,'Pawns');d.querySelector('#startGame').click();await wait(()=>d.querySelector('#roll')&&!d.querySelector('#roll').disabled&&!d.querySelector('#setup').open,'Roll');d.querySelector('#roll').click();}
 await wait(()=>d.querySelector('.quiz-truth-icon'),'Quiz icons');assert(d.querySelectorAll('.quiz-truth-icon').length===2,'Two truth icons');const style=f.contentWindow.getComputedStyle(d.querySelector('.quiz-prompt p'));assert(parseFloat(style.fontSize)>=24&&Number(style.fontWeight)>=700,'Question hierarchy');
 for(const width of [1100,390]){f.style.width=width+'px';await new Promise(r=>setTimeout(r,100));assert(d.documentElement.scrollWidth<=width,'Page overflow '+game);const host=d.querySelector('#authoredTask');assert(host.scrollWidth<=host.clientWidth+1,'Quiz horizontal overflow');}
 out.textContent+='PASS '+game+' / '+theme+' hierarchy, icons, themed options, desktop/mobile widths\n';
 }out.textContent+='ALL QUIZ VISUAL CHECKS PASSED';
 }catch(e){out.textContent+='FAIL '+e.stack;console.error(e)}};
