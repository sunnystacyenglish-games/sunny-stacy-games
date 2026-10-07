// Brief fallback transition only; manual reveal never starts a timer.
export const ANSWER_REVEAL_MS=140;
export const TASK_MODES=['picture-blur','word-blur'];
export const normalizeTaskMode=value=>TASK_MODES.includes(value)?value:'picture-blur';
export function concealTask(dialog,mode){
 dialog.dataset.taskMode=mode==='none'?'none':normalizeTaskMode(mode);dialog.dataset.revealed='false';
 for(const id of ['taskImage','taskText']){const el=dialog.querySelector('#'+id);const hidden=mode!=='none'&&id===(mode==='word-blur'?'taskText':'taskImage');el.classList.toggle('concealed-answer',hidden);if(hidden){el.setAttribute('aria-hidden','true');el.inert=true;}else{el.removeAttribute('aria-hidden');el.inert=false;}}
 // Image alt must never give away the concealed word in Word Blur mode either.
 const image=dialog.querySelector('#taskImage img');if(image)image.alt='Task picture';
}
export function revealTask(dialog){dialog.dataset.revealed='true';for(const el of dialog.querySelectorAll('.concealed-answer')){el.classList.remove('concealed-answer');el.removeAttribute('aria-hidden');el.inert=false;}}
