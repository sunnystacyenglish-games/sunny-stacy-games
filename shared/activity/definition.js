import {jsonCopy,record,stableId,createEntityId,freeze,migrate} from './contracts.js';
export const ACTIVITY_SCHEMA_VERSION=1;
export const activityMigrations={}; // Register a v1 -> v2 function here only when schema v2 exists.
export function validateActivity(raw,registry){
 const value=migrate(raw,ACTIVITY_SCHEMA_VERSION,activityMigrations);record(value,'Activity');stableId(value.id);
 if(typeof value.name!=='string'||!value.name.trim()||value.name.length>120)throw Error('Give the activity a name (up to 120 characters).');
 const game=registry.game(value.gameType),content=record(value.content,'Content');
 if(!game.supportedContentTypes.includes(content.type))throw Error('Content is incompatible with this game.');
 const adapter=registry.content(content.type);const migrated=migrate(content,adapter.version,adapter.migrations,'version');adapter.validate(migrated.data);
 const theme=record(value.themeConfig,'Themes'),gameplay=game.normalizeGameplay(record(value.gameplayConfig,'Gameplay'));
 const metadata=record(value.metadata,'Metadata');for(const key of ['createdAt','updatedAt'])if(typeof metadata[key]!=='string'||!Number.isFinite(Date.parse(metadata[key])))throw Error('Invalid activity timestamp.');
 // Explicit projection: transient state and arbitrary top-level fields never serialize.
 return {id:value.id,name:value.name.trim(),gameType:game.id,schemaVersion:ACTIVITY_SCHEMA_VERSION,content:{type:content.type,version:adapter.version,data:jsonCopy(migrated.data)},themeConfig:jsonCopy(theme),gameplayConfig:jsonCopy(gameplay),metadata:{createdAt:metadata.createdAt,updatedAt:metadata.updatedAt}};
}
export function createActivity({id=createEntityId(),name,gameType,content,themeConfig={},gameplayConfig={}},registry){const time=new Date().toISOString();return validateActivity({id,name,gameType,schemaVersion:ACTIVITY_SCHEMA_VERSION,content,themeConfig,gameplayConfig,metadata:{createdAt:time,updatedAt:time}},registry);}
export function updateActivity(activity,changes,registry){const previous=validateActivity(activity,registry);return validateActivity({...previous,...jsonCopy(changes),id:previous.id,gameType:previous.gameType,schemaVersion:previous.schemaVersion,metadata:{createdAt:previous.metadata.createdAt,updatedAt:new Date().toISOString()}},registry);}
export function exportActivity(activity,registry){return JSON.stringify({format:'sunny-stacy-activity',schemaVersion:1,activity:validateActivity(activity,registry)},null,2);}
export function importActivity(text,registry){if(typeof text!=='string'||text.length>10*1024*1024)throw Error('Activity JSON is too large.');let parsed;try{parsed=JSON.parse(text);}catch{throw Error('Invalid activity JSON.');}if(parsed?.format!=='sunny-stacy-activity'||parsed.schemaVersion!==1)throw Error('Unsupported activity file. Concept Set files use the existing set importer.');return validateActivity(parsed.activity,registry);}
export async function createRuntimeSession(activity,registry,services={}){
 const definition=freeze(validateActivity(activity,registry));
 // Resolver sees detached author data. Every session gets its own working copy.
 const content=structuredClone(await registry.content(definition.content.type).resolve(jsonCopy(definition.content.data),services));
 const session={id:createEntityId(),definition,startedAt:new Date().toISOString(),content,gameplayConfig:jsonCopy(definition.gameplayConfig),state:{},events:[]};return session;
}
export function activityResult(session,{completed=false,summary={},details={},events=session.events}={}){const completedAt=new Date().toISOString();return {schemaVersion:1,activityId:session.definition.id,gameType:session.definition.gameType,completed:!!completed,startedAt:session.startedAt,completedAt:completed?completedAt:null,duration:Math.max(0,Date.parse(completedAt)-Date.parse(session.startedAt)),summary:jsonCopy(summary),details:jsonCopy(details),events:jsonCopy(events)};}
