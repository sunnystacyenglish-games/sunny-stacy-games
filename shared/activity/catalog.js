import {definition as spy} from '../../games/i-spy/activity.js';
import {registerAuthoringEditors} from '../editors/register.js';
import {createActivityRegistry} from './registry.js';
import {record,stableId} from './contracts.js';
import {validatePlayableSet} from '../content-rules.js';
import {definition as dobble} from '../../games/dobble/activity.js';
import {definition as wordly} from '../../games/wordly/activity.js';
import {definition as ttt} from '../../games/tic-tac-toe/activity.js';
import {definition as dice} from '../../games/story-dice/activity.js';
export const activityRegistry=createActivityRegistry();
activityRegistry.registerContent({type:'conceptSet',version:1,editor:'conceptSet',validate(data){record(data);stableId(data.setId);},async resolve(data,{sets}={}){if(!sets?.get)throw Error('Content repository unavailable.');const set=await sets.get(data.setId);if(!set)throw Error('This set is unavailable.');return validatePlayableSet(set);}});
// Existing Story/Sentence prompt library, not a future custom authoring model.
activityRegistry.registerContent({type:'builtInPrompts',version:1,editor:'builtInPrompts',validate(data){if(!['story','sentence'].includes(data?.mode))throw Error('Unknown built-in prompt library.');},resolve:data=>({...data})});
for(const definition of [dobble,ttt,wordly,dice])activityRegistry.registerGame(definition);

registerAuthoringEditors(activityRegistry);

activityRegistry.registerGame(spy);
