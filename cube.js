'use strict';

module.exports = (()=> {
    const U=require('./utility.js');
    const R=require('ramda');
    const v=require('./vector.js');
    const t=require('./turtle.js');
    
    const permutationSetting = (edge) => {
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
	let p=permutationSetting(crossingEdge);
	return [vertice[p[0]],
		vertice[p[1]],
		vertice[p[2]],
		vertice[p[3]],
		vertice[p[4]],
		vertice[p[5]],
		vertice[p[6]],
		vertice[p[7]]];
    });

    const makeCubicField=()=>{
	return {cube: initialCubeVertice()};
    };

    const makeCubicFieldTurtle=(draw)=>{
	return [makeCubicField(),t.newTurtle(draw)];
    };

    
    
    const forward=R.curry((length,[cubicField,turtle])=>{
	return [cubicField,t.forward(length)(turtle)];
    });
    
    const leftTurn=R.curry((dDirection,[cubicField,turtle])=>{
	return [cubicField,t.leftTurn(dDirection)(turtle)];
    });
    
    return {
	forward,
	leftTurn
    };
    
    
})();
		  
