export const defaultGameplayConfig=Object.freeze({targetOrder:'in-order',wrongAnswerSound:true,showProgress:true});
export function normalizeGameplay(raw={}){return {targetOrder:raw.targetOrder==='shuffle'?'shuffle':'in-order',wrongAnswerSound:raw.wrongAnswerSound!==false,showProgress:raw.showProgress!==false};}
export const definition={id:'i-spy',name:'I Spy / Spot It',supportedContentTypes:['scene'],defaultGameplayConfig,normalizeGameplay,editors:{scene:'scene'},runtime:'games/i-spy/',capabilities:{supportsReusableSets:false,customEditor:true}};
