import {activityRegistry} from './activity/catalog.js';
import {activityRepository,exportBundle,importBundle} from './activity/repository.js';
import {validateActivity} from './activity/definition.js';
// Stable author-document IDs remain in the existing store. No copy-on-reference.
const repository=activityRepository(activityRegistry);
export const contentRepository={
 list:()=>repository.list(),
 async get(id){const raw=await repository.get(id);return raw?validateActivity(raw,activityRegistry):null;},
 save:value=>repository.save(value),
 export:value=>exportBundle(value,activityRegistry),
 import:text=>importBundle(text,activityRegistry)
};
export const contentTypes=[['conceptSet','Concept Set','Words and pictures'],['scene','Scene','Background, objects and targets'],['bridge','Bridge','Sequences, gaps and distractors'],['sentenceCorrection','Sentence Correction','Correct and incorrect sentence pairs'],['cardDecks','Card Deck','Cards organised into decks']];
