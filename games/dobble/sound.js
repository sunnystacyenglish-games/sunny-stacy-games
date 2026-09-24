export function feedbackNotes(correct){
  return correct?[523.25,659.25,783.99].map((frequency,index)=>({frequency,at:index*.075,duration:.17,volume:.045,type:'sine',end:frequency})):
    [{frequency:330,end:285,at:0,duration:.30,volume:.08775,type:'triangle'},{frequency:250,end:210,at:.24,duration:.30,volume:.08775,type:'triangle'}];
}
let context,lastWrong=-Infinity;
export function playFeedback(correct){try{
  if(!correct&&performance.now()-lastWrong<540)return;if(!correct)lastWrong=performance.now();
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
  context ||= new Audio();context.resume().catch(()=>{});const now=context.currentTime;
  for(const note of feedbackNotes(correct)){
    const oscillator=context.createOscillator(),gain=context.createGain(),start=now+note.at;
    oscillator.type=note.type;oscillator.frequency.setValueAtTime(note.frequency,start);oscillator.frequency.exponentialRampToValueAtTime(note.end,start+note.duration-.02);
    gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(note.volume,start+.025);gain.gain.setValueAtTime(note.volume*.75,start+note.duration*.55);gain.gain.exponentialRampToValueAtTime(.001,start+note.duration);
    oscillator.connect(gain);gain.connect(context.destination);oscillator.start(start);oscillator.stop(start+note.duration);oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
  }
}catch{/* Embedded browsers may disable audio. Gameplay remains available. */}}
