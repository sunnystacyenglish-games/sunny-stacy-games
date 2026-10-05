import {celebrate,clearCelebration} from './celebration.js';
// Per-run guard: rerenders cannot replay victory. Caller resets for a new run.
export function createCompletion({dialog,sound}){
 let completed=false,confettiTimer,resultTimer;
 const clear=()=>{clearTimeout(confettiTimer);clearTimeout(resultTimer);};
 return {
  show(){if(completed)return;completed=true;celebrate(sound());clear();
   const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
   resultTimer=setTimeout(()=>{dialog.showModal();dialog.classList.add('completion-enter');},reduced?0:1400);
   confettiTimer=setTimeout(()=>clearCelebration(false),1700);
  },
  reset(){completed=false;clear();clearCelebration();dialog.classList.remove('completion-enter');},
  destroy(){clear();clearCelebration();}
 };
}
