import {normalizeTaskMode} from './task-presentation.js';
const normalizeGameplay=raw=>({steal:raw.steal!==false,taskMode:normalizeTaskMode(raw.taskMode)});
export const definition={id:'tic-tac-toe',supportedContentTypes:['conceptSet'],defaultGameplayConfig:normalizeGameplay({}),normalizeGameplay,editors:{conceptSet:'conceptSet'},runtime:'games/tic-tac-toe/',capabilities:{supportsReusableSets:true}};
