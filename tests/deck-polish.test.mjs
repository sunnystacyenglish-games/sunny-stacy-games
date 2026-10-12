import assert from 'node:assert/strict';
import {deckComposition,deckKey} from '../games/board-race/decks.js';
import {normalizeDeckBlurMap,concealedCardPart} from '../games/board-race/deck-blur.js';
for(let n=1;n<=5;n++)for(const [w,h] of [[160,90],[260,480],[480,480],[800,260],[1100,350]]){
 const layout=deckComposition(n,w,h);assert.deepEqual(layout,deckComposition(n,w,h));assert.equal(layout.positions.length,n);assert(layout.height>layout.width);
 for(const [i,[x,y]] of layout.positions.entries()){assert(x-layout.width/2>=11.99&&x+layout.width/2+7<w);assert(y-layout.height/2>=11.99&&y+layout.height/2+7<h);for(const [a,b] of layout.positions.slice(0,i))assert(Math.abs(x-a)>=layout.width+17.99||Math.abs(y-b)>=layout.height+17.99);}
}
assert.equal(deckComposition(3,1000,350).rows,1);
const a=deckKey('doc','a'),b=deckKey('doc','b'),map=normalizeDeckBlurMap({[a]:'word-blur',[b]:'picture-blur',invalid:'word-blur'});assert.equal(map[a],'word-blur');assert.equal(map[b],'picture-blur');assert.equal(map.invalid,undefined);assert.deepEqual(normalizeDeckBlurMap(null),{});
for(const card of [{text:'Long authored question\nAnother line'},{text:'',image:{}},{text:'Word and image',image:{}}])for(const mode of ['word-blur','picture-blur','none'])assert.equal(concealedCardPart(card,mode),mode==='word-blur'&&card.text?'text':mode==='picture-blur'&&card.image?'image':null);
console.log('PASS adaptive portrait decks, safe clearance, deterministic row choice, stable blur IDs, defaults and all nine component/blur combinations');
