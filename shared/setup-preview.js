import {applyTheme} from '../games/dobble/theme-view.js';
// Setup selects are drafts. Read committed settings only when the dialog closes.
export function setupThemePreview(dialog,select,committed,render=applyTheme){
 select.addEventListener('change',()=>{if(dialog.open)render(select.value);});
 dialog.addEventListener('close',()=>render(committed()));
}
