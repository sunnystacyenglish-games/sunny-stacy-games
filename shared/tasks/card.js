import {activityAssets} from '../activity/repository.js';
export async function cardContent(card){
 const fragment=document.createDocumentFragment();
 if(card.image){const image=document.createElement('img');image.alt='Card picture';image.src=await activityAssets.mediaURL(card.image);await image.decode().catch(()=>{throw Error('This card image could not load. Check its source.');});fragment.append(image);}
 if(card.text){const text=document.createElement('p');text.textContent=card.text;fragment.append(text);}
 return fragment;
}
