const normalizeGameplay=raw=>({mode:['story','concept','sentence'].includes(raw.mode)?raw.mode:'story'});
export const definition={id:'story-dice',supportedContentTypes:['conceptSet','builtInPrompts'],defaultGameplayConfig:normalizeGameplay({}),normalizeGameplay,editors:{conceptSet:'conceptSet',builtInPrompts:'builtInPrompts'},runtime:'games/story-dice/',capabilities:{supportsReusableSets:true}};
