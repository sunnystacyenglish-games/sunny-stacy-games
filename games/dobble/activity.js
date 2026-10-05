import {normalizeSettings} from '../../shared/storage.js';
const keys=['mode','count','movement','autoNext','delay'];
const normalizeGameplay=raw=>{const value=normalizeSettings(raw);return Object.fromEntries(keys.map(key=>[key,value[key]]));};
export const definition={id:'dobble',supportedContentTypes:['conceptSet'],defaultGameplayConfig:normalizeGameplay({}),normalizeGameplay,editors:{conceptSet:'conceptSet'},runtime:'games/dobble/',capabilities:{supportsReusableSets:true}};
