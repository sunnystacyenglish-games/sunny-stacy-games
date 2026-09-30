import {playCorrect,playWrong} from '../../shared/audio.js';
let lastWrong=-Infinity;
export function playFeedback(correct){if(!correct&&performance.now()-lastWrong<540)return;if(!correct)lastWrong=performance.now();(correct?playCorrect:playWrong)(true);}
