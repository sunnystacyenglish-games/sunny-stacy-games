export const MARKERS={notebook:['X','O'],chalkboard:['🔵','🔴'],'board-game':['❤️','⭐'],ocean:['🐟','🦀'],nature:['🌸','🍄'],space:['🚀','🛸'],candy:['🍦','🍩'],'magic-school':['🪄','🕯️']};
export const marker=(theme,player)=>(MARKERS[theme]||MARKERS.notebook)[player==='X'?0:1];
