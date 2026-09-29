export const MARKERS={notebook:['X','O'],chalkboard:['X','O'],'board-game':['X','O'],ocean:['🐟','🦀'],nature:['🌸','🍀'],space:['☀️','🌙'],candy:['⭐','❤️'],'magic-school':['🔮','🕯️']};
export const marker=(theme,player)=>(MARKERS[theme]||MARKERS.notebook)[player==='X'?0:1];
