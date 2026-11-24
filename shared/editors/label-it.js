import {mountSceneEditor} from './scene.js';
import {acceptedLabels} from '../tasks/label-it.js';
export function mountLabelEditor(options){
 const d=options.activity.content.data;
 const scene={background:d.background,assets:[],objects:[],hotspots:d.targets.filter(t=>t.width&&t.height).map(({id,x,y,width,height})=>({id,x,y,width,height})),targets:d.targets.map(t=>({id:t.id,prompt:t.acceptedAnswers.join('\n'),answers:t.width&&t.height?[{id:t.id,type:'hotspot',hotspotId:t.id}]:[]}))};
 const editor=mountSceneEditor({...options,labelMode:true,activity:{...options.activity,content:{...options.activity.content,data:scene}}});
 const read=editor.read;editor.read=()=>{const scene=read();return {background:scene.background,targets:scene.targets.map(t=>{const h=scene.hotspots.find(h=>h.id===t.answers[0]?.hotspotId);return {id:t.id,x:h?.x||0,y:h?.y||0,width:h?.width||0,height:h?.height||0,acceptedAnswers:acceptedLabels(t.prompt)};})};};return editor;
}
