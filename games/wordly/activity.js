import {normalizeLength} from './eligibility.js';
import {normalizeSelection} from './session.js';
const normalizeGameplay=raw=>({length:normalizeLength(raw.length),selection:normalizeSelection(raw.selection)});
export const definition={id:'wordly',supportedContentTypes:['conceptSet'],defaultGameplayConfig:normalizeGameplay({}),normalizeGameplay,editors:{conceptSet:'conceptSet'},runtime:'games/wordly/',capabilities:{supportsReusableSets:true,automaticScoring:true}};
