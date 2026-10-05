export const CONTENT_LIMITS=Object.freeze({conceptSet:Object.freeze({concepts:50}),bridge:Object.freeze({bridges:20,gapsPerBridge:5}),scene:Object.freeze({instances:50,targets:20}),sentenceCorrection:Object.freeze({sentences:30}),cardDecks:Object.freeze({decks:6,cardsPerDeck:30,cardsTotal:100})});
export function enforceLimit(count,limit,label){if(count>limit)throw Error(`${label}: maximum ${limit}. Existing content has not been removed.`);}
export function canGrow(count,limit){return count<limit;}
export function validateConceptCapacity(set,previousCount=0){enforceLimit(set.items.length,Math.max(CONTENT_LIMITS.conceptSet.concepts,previousCount),'Concepts');return set;}
