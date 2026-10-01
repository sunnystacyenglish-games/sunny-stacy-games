// The supplied, already trimmed WAV is decoded once. No gain, trimming or offsets.
let context,buffer,loading,source,finished=Promise.resolve();
function audioContext(){return context??=new (globalThis.AudioContext||globalThis.webkitAudioContext)();}
export function prepareTileClack(unlock=false){try{const c=audioContext();const resumed=unlock?c.resume().catch(()=>{}):Promise.resolve();loading??=fetch(new URL('../assets/audio/tile-clack.wav',import.meta.url)).then(r=>{if(!r.ok)throw Error('Tile audio unavailable');return r.arrayBuffer();}).then(bytes=>c.decodeAudioData(bytes)).then(decoded=>buffer=decoded).catch(()=>{loading=null;});return Promise.race([Promise.all([resumed,loading]),new Promise(resolve=>setTimeout(resolve,1000))]);}catch{return Promise.resolve();}}
export function stopTileClack(){source?.stop();source=null;}
export function playTileClack(enabled){if(!enabled||!buffer||!context||context.state!=='running')return null;stopTileClack();context.resume().catch(()=>{});const node=context.createBufferSource();node.buffer=buffer;node.connect(context.destination);source=node;finished=new Promise(resolve=>{node.onended=()=>{node.disconnect();if(source===node)source=null;resolve();};});node.start();return node;}
export function finishTileClack(){return finished;}
if(typeof addEventListener==='function')addEventListener('pagehide',stopTileClack);
