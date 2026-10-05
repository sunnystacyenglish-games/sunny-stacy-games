import {upgradeScene} from '../activity/scene.js';
import {validators} from './models.js';
import {mountBridgeEditor} from './bridge.js';
import {mountSceneEditor} from './scene.js';
import {mountSentenceEditor} from './sentences.js';
import {mountDeckEditor} from './decks.js';
export const editorTypes=[['bridge','Bridge Editor',mountBridgeEditor],['scene','Scene Editor',mountSceneEditor],['sentenceCorrection','Sentence Correction',mountSentenceEditor],['cardDecks','Card Deck Editor',mountDeckEditor]];
export function registerAuthoringEditors(registry){for(const [type,,mount] of editorTypes){registry.registerContent({type,version:type==='scene'?2:1,migrations:type==='scene'?{1:c=>({...c,version:2,data:upgradeScene(c.data)})}:{},editor:type,validate:validators[type],resolve:data=>structuredClone(data)});registry.registerEditor(type,mount);registry.registerGame({id:'authoring-'+type,supportedContentTypes:[type],defaultGameplayConfig:{},normalizeGameplay:()=>({}),editors:{[type]:type},capabilities:{customEditor:true}});}}
