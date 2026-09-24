export function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
export function button(text,handler,className=''){const node=element('button',className,text);node.type='button';node.addEventListener('click',handler);return node;}
export function message(text,error=false){const host=document.querySelector('#message');host.textContent=text;host.classList.toggle('error',error);host.hidden=!text;}
export function confirmDialog(title,description,action='Delete'){
  return new Promise(resolve=>{
    const dialog=element('dialog','app-dialog');dialog.setAttribute('aria-label',title);dialog.append(element('h2','',title),element('p','',description));
    const actions=element('div','row');actions.append(button('Cancel',()=>dialog.close('cancel')),button(action,()=>dialog.close('yes'),'primary'));dialog.append(actions);document.body.append(dialog);
    dialog.addEventListener('close',()=>{const accepted=dialog.returnValue==='yes';dialog.remove();resolve(accepted);},{once:true});dialog.showModal();
  });
}
export function chooseGame(set){
  const dialog=element('dialog','app-dialog');dialog.setAttribute('aria-label','Choose a game');dialog.append(element('h2','',`Play ${set.name}`));
  dialog.append(element('p','',`All ${set.items.length} concepts rotate through Dobble. Choose the number of cards and items in Settings; smaller sets need fewer items/cards.`));
  const link=element('a','button primary','Play Dobble →');link.href=`../games/dobble/?set=${encodeURIComponent(set.id)}`;dialog.append(link);
  dialog.append(element('p','muted','Tower · Memory · Snakes & Ladders · Tic-Tac-Toe · Sudoku · Sorting — Coming soon'),button('Close',()=>dialog.close()));
  document.body.append(dialog);dialog.addEventListener('close',()=>dialog.remove(),{once:true});dialog.showModal();
}
