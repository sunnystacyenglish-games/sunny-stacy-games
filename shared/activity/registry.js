import {freeze,jsonCopy,stableId} from './contracts.js';
// Separate registries: no game-name switch, no shared mega-config.
export function createActivityRegistry(){
 const games=new Map(),types=new Map(),editors=new Map();
 const add=(map,key,value)=>{stableId(key);if(map.has(key))throw Error('Already registered: '+key);map.set(key,value);return value;};
 const get=(map,key)=>{if(!map.has(key))throw Error('Unsupported activity component: '+key);return map.get(key);};
 return {
  registerContent(type){if(!Number.isInteger(type.version)||type.version<1||typeof type.validate!=='function'||typeof type.resolve!=='function')throw Error('Content needs version, validate and resolve.');return add(types,type.type,Object.freeze({...type}));},
  registerGame(game){if(!Array.isArray(game.supportedContentTypes)||!game.supportedContentTypes.length||typeof game.normalizeGameplay!=='function')throw Error('Game contract is incomplete.');game.supportedContentTypes.forEach(type=>get(types,type));return add(games,game.id,freeze({...game,supportedContentTypes:[...game.supportedContentTypes],defaultGameplayConfig:jsonCopy(game.defaultGameplayConfig||{}),capabilities:{assignment:false,automaticScoring:false,teacherReview:false,supportsReusableSets:false,customEditor:false,...game.capabilities},editors:{...game.editors}}));},
  registerEditor(id,mount){if(typeof mount!=='function')throw Error('Editor must be a mount function.');add(editors,id,mount);},
  game:id=>get(games,id), content:type=>get(types,type), games:()=>[...games.values()],
  editor(gameId,type){const game=get(games,gameId);if(!game.supportedContentTypes.includes(type))throw Error('This game does not support '+type);return get(editors,game.editors[type]||get(types,type).editor);}
 };
}
