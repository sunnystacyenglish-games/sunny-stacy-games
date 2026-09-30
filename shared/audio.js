// Original supplied files: unity playback volume, no loudness processing.
const channels=new Map(),generations=new Map();
let fade;
export function stopSound(name){generations.set(name,(generations.get(name)||0)+1);const audio=channels.get(name);if(name==='victory'){clearInterval(fade);fade=undefined;}if(audio){audio.pause();audio.currentTime=0;audio.volume=1;}}
function play(name,enabled=true){if(!enabled)return null;try{stopSound(name);let audio=channels.get(name);if(!audio){audio=new Audio(new URL('../assets/audio/'+name+'.mp3',import.meta.url).href);audio.preload='auto';channels.set(name,audio);}audio.volume=1;audio.currentTime=0;const generation=generations.get(name);audio.play().catch(()=>{if(generations.get(name)===generation)stopSound(name);});return audio;}catch{return null;}}
export const playClick=enabled=>play('ui-click',enabled);
export const playCorrect=enabled=>play('correct-chime',enabled);
export const playWrong=enabled=>play('wrong-soft-buzz',enabled);
// A single channel per effect prevents a pile-up during sequential tile reveals.
export const playTileClack=enabled=>play('tile-clack',enabled);
export const playDiceRoll=enabled=>play('dice-roll',enabled);
export const stopVictory=()=>stopSound('victory');
export function playVictory(enabled=true){const audio=play('victory',enabled);if(!audio)return;fade=setInterval(()=>{if(audio.ended){stopVictory();return;}if(audio.currentTime>=4.2){stopVictory();return;}audio.volume=audio.currentTime<=3?1:Math.max(0,1-(audio.currentTime-3)/1.2);},25);}
export function stopAllAudio(){for(const name of channels.keys())stopSound(name);}
if(typeof addEventListener==='function')addEventListener('pagehide',stopAllAudio);

// Disabling sound immediately silences an effect already in progress.
if(typeof document!=='undefined')document.addEventListener('change',event=>{const input=event.target;if(input.matches?.('input[type=checkbox]')&&!input.checked&&/sound/i.test(input.id+' '+input.name))stopAllAudio();});
