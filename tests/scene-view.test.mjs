import assert from 'node:assert/strict';
import {fitSceneView, sceneToView, viewToScene, lensToScene} from '../shared/activity/scene-view.js';
const near = (a, b) => assert.ok(Math.abs(a-b) < 1e-9, `${a} != ${b}`);
let cases = 0;
for (const viewport of [{width:390,height:600},{width:760,height:320},{width:1280,height:720}]) {
  for (const image of [{width:1200,height:2400},{width:3000,height:1000}]) {
    for (const zoom of [1,2,4]) for (const pan of [-10000,0,10000]) {
      const rect = fitSceneView(viewport,image,{zoom,panX:pan,panY:-pan});
      near(rect.width/rect.height,image.width/image.height);
      if (rect.width >= viewport.width) { assert.ok(rect.left <= 1e-9); assert.ok(rect.left+rect.width >= viewport.width-1e-9); }
      else near(rect.left,(viewport.width-rect.width)/2);
      if (rect.height >= viewport.height) { assert.ok(rect.top <= 1e-9); assert.ok(rect.top+rect.height >= viewport.height-1e-9); }
      else near(rect.top,(viewport.height-rect.height)/2);
      for (const point of [{x:0,y:0},{x:1,y:1},{x:.1234,y:.8765},{x:-.02,y:.5}]) {
        const rendered = sceneToView(point,rect), back = viewToScene(rendered,rect);
        near(back.x,point.x); near(back.y,point.y);
        const center = sceneToView({x:.5,y:.5},rect);
        const lensPoint = {x:center.x+2*(rendered.x-center.x),y:center.y+2*(rendered.y-center.y)};
        const sample = lensToScene(lensPoint,center,rect,2);
        near(sample.x,point.x);near(sample.y,point.y);cases++;
      }
    }
  }
}
const portrait=fitSceneView({width:800,height:600},{width:1000,height:2000});
assert.ok(viewToScene({x:0,y:300},portrait).x < 0, 'Letterbox clicks stay outside the scene');
assert.throws(()=>fitSceneView({width:0,height:600},{width:100,height:200}),RangeError);
assert.throws(()=>lensToScene({x:0,y:0},{x:0,y:0},portrait,0),RangeError);
console.log(`PASS scene view: ${cases} inverse/lens mappings, aspect ratios, pan bounds and letterboxing`);
