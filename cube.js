'use strict';

module.exports = (()=> {
    const U=require('./utility.js');
    const R=require('ramda');
    const v=require('./vector.js');
    
    const permutationVertice = (edge) => {
	if (edge==='top'){
	    return [2,6,7,3,1,5,8,4];
	}
	if(edge==='right'){
	    return [4,3,7,8,1,2,6,5];
	}
	if(edge==='bottom'){
	    return [5,1,4,8,6,2,3,7];
	}
	if(edge==='left'){
	    return [4,3,7,8,1,2,6,5];
	}
	return[];
    };

    const initialCubeVertice = ()=>{
	return [1,2,3,4,5,6,7,8];
    };

    const frontVertice=(vertice)=>{
	return [vertice[0],vertice[1],vertice[2],vertice[3]];
    };

    const backVertice=(vertice)=>{
	return [vertice[4],vertice[5],vertice[6],vertice[7]];
    };
        
    const permuteVertice=R.curry((crossingEdge,vertice)=>{
    });
    
    
})();
		  
