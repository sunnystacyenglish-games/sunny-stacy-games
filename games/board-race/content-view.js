import {showImage} from '../../shared/images.js';
import {concealTask,revealTask} from '../../shared/concept-blur.js';
export function renderConcept(dialog,concept,mode){
 const text=dialog.querySelector('#taskText'),image=dialog.querySelector('#taskImage'),button=dialog.querySelector('#reveal');
 text.textContent=typeof concept.word==='string'?concept.word:concept.text||'';text.hidden=!text.textContent;
 const media=concept.image,hasImage=!!(media&&(media.type==='upload'?media.blob instanceof Blob:media.value));
 image.hidden=!hasImage;image.replaceChildren();if(hasImage)showImage(image,media,'Task picture');
 const effective=text.hidden||!hasImage?'none':mode;
 concealTask(dialog,effective);if(effective==='none')revealTask(dialog);
 button.hidden=effective==='none';button.disabled=effective==='none';
}
