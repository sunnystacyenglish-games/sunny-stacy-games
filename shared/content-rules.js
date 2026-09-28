export const MIN_SET_ITEMS=5;
export const imageTypes=['image/png','image/jpeg','image/webp'];
export function validateSet(set){
  if(set?.imageSource!==undefined&&!['emoji','url','upload','mixed'].includes(set.imageSource))throw Error('Invalid set image source.');
  if(!set||typeof set.id!=='string'||!set.id||set.id.length>120||typeof set.name!=='string'||!set.name.trim()||set.name.length>120)throw Error('Give your set a name (up to 120 characters).');
  if(!Array.isArray(set.items)||!set.items.length||set.items.length>500)throw Error('A set needs between 1 and 500 items.');
  const ids=new Set();let imageBytes=0;
  for(const [i,item] of set.items.entries()){
    if(!item||typeof item.id!=='string'||!item.id||item.id.length>120||ids.has(item.id))throw Error(`Item ${i+1}: invalid or duplicate ID.`);ids.add(item.id);
    if(typeof item.word!=='string'||!item.word.trim()||item.word.length>120)throw Error(`Item ${i+1}: enter a word (up to 120 characters).`);
    const image=item.image;
    if(!image||!['emoji','url','upload'].includes(image.type))throw Error(`Item ${i+1}: choose an image.`);
    if(image.type==='emoji'&&(typeof image.value!=='string'||!image.value.trim()||image.value.length>40))throw Error(`Item ${i+1}: enter an emoji.`);
    if(image.type==='url'){
      try{const url=new URL(image.value);if(url.protocol!=='https:'||url.username||url.password||url.href.length>4096)throw Error();}catch{throw Error(`Item ${i+1}: use a valid HTTPS image URL.`);}
    }
    if(image.type==='upload'&&(!(image.blob instanceof Blob)||!imageTypes.includes(image.blob.type)||!image.blob.size||image.blob.size>3*1024*1024))throw Error(`Item ${i+1}: upload a PNG, JPEG or WEBP image (stored size up to 3 MB).`);
    if(image.type==='upload')imageBytes+=image.blob.size;
  }
  if(imageBytes>24*1024*1024)throw Error('Uploaded images in one set must total less than 24 MB. Use smaller images or split the set.');
  return set;
}
const segments=text=>[...new Intl.Segmenter(undefined,{granularity:'grapheme'}).segment(text)].map(part=>part.segment);
const pictograph=text=>/\p{Extended_Pictographic}|\p{Regional_Indicator}|[0-9#*]\uFE0F?\u20E3/u.test(text);
export function isEmoji(value){if(typeof value!=='string'||!value.trim()||value.length>40)return false;return segments(value.trim()).every(part=>/^\s+$/u.test(part)||pictograph(part)&&!/[\p{L}\p{N}]/u.test(part.replace(/[0-9#*]\uFE0F?\u20E3/gu,'')));}
export function isWord(value){return typeof value==='string'&&value.length<=120&&segments(value).some(part=>!pictograph(part)&&/[\p{L}\p{N}]/u.test(part));}
export function validateSemantics(item){if(!isWord(item?.word))throw Error('Enter a word');if(item?.image?.type==='emoji'&&!isEmoji(item.image.value))throw Error('Enter an emoji');}
export function validConceptCount(set){const seen=new Set();let count=0;for(const item of set?.items||[]){try{validateSet({id:'validation',name:'Validation',items:[item]});validateSemantics(item);if(!seen.has(item.id)){seen.add(item.id);count++;}}catch{}}return count;}
export function validatePlayableSet(set){validateSet(set);set.items.forEach((item,i)=>{try{validateSemantics(item);}catch(error){throw Error(`Item ${i+1}: ${error.message}`);}});if(validConceptCount(set)<MIN_SET_ITEMS)throw Error('Minimum: 5 valid items. Add words and images before saving or playing.');return set;}
export function canPlaySet(set){try{validatePlayableSet(set);return true;}catch{return false;}}
export function hasUsableWord(item){return isWord(item?.word);}
export function hasUsableImage(item){try{if(item?.image?.type==='emoji'&&!isEmoji(item.image.value))return false;validateSet({id:'image-validation',name:'Image validation',items:[{id:'image',word:'image',image:item?.image}]});return true;}catch{return false;}}
