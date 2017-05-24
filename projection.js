'use strict';

module.exports = (()=> {
    const U=require('./utility.js');
    const R=require('ramda');
    const C=require('./coordinate.js');
    const v=require('./vector.js');

    const vertice3Dto2D=(vertices)=>{
	const [dummy1,dummy2,length]=vertices[1].coord3D;
	const lenHalf=length*0.5;
	const lenSq3=lenHalf*Math.sqrt(3);
	return [{coord2D: [-lenSq3,-lenHalf]},
		{coord2D: [-lenSq3,lenHalf]},
		{coord2D: [0,0]},
		{coord2D: [0,-length]},
		{coord2D: [0,0]},
		{coord2D: [0,length]},
		{coord2D: [lenSq3,lenHalf]},
		{coord2D: [lenSq3,-lenHalf]}
	       ];
    };
	
    return {
	vertice3Dto2D: vertice3Dto2D
    };
    
})();
