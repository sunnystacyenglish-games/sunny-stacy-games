import {normalizeTaskMode} from './task-presentation.js';
const normalizeGameplay=raw=>({steal:raw.steal!==false,taskMode:normalizeTaskMode(raw.taskMode)});
export const definition={id:'tic-tac-toe',supportedContentTypes:['conceptSet','cardDecks','sentenceCorrection'],defaultGameplayConfig:normalizeGameplay({}),normalizeGameplay,editors:{conceptSet:'conceptSet'},runtime:'games/tic-tac-toe/',capabilities:{supportsReusableSets:true}};
