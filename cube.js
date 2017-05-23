'use strict';

module.exports = (()=> {
    const U=require('./utility.js');
    const R=require('ramda');
    const C=require('./coordinate.js');
    const v=require('./vector.js');
    const t=require('./turtle.js');
    
    const permutationSetting = (edge) => {
	if (edge==='top'){
	    return [1,5,6,2,0,4,7,3];
	}
	if(edge==='right'){
	    return [3,2,6,7,0,1,5,4];
	}
	if(edge==='bottom'){
	    return [4,0,3,7,5,1,2,6];
	}
	if(edge==='left'){
	    return [3,2,6,7,0,1,5,4];
	}
	return[];
    };

    const initialCubeVertices = (edgeLength)=>{
	return [{index: 0, coord3D:[0,0,0]},
		{index: 1, coord3D:[0,0,edgeLength]},
		{index: 2, coord3D:[edgeLength,0,edgeLength]},
		{index: 3, coord3D:[edgeLength,0,0]},
		{index: 4, coord3D:[0,edgeLength,0]},
		{index: 5, coord3D:[0,edgeLength,edgeLength]},
		{index: 6, coord3D:[edgeLength,edgeLength,edgeLength]},
		{index: 7, coord3D:[edgeLength,edgeLength,0]}];
    };

    const frontVertices=(vertices)=>{
	return [vertices[0],vertices[1],vertices[2],vertices[3]];
    };

    const backVertices=(vertices)=>{
	return [vertices[4],vertices[5],vertices[6],vertices[7]];
    };
        
    const permuteVertices=R.curry((crossingEdgeName,vertices)=>{
	let p=permutationSetting(crossingEdgeName);
	return [vertices[p[0]],
		vertices[p[1]],
		vertices[p[2]],
		vertices[p[3]],
		vertices[p[4]],
		vertices[p[5]],
		vertices[p[6]],
		vertices[p[7]]];
    });

    const crossingEdgeIndex2Name=(crossingEdgeIndex)=>{
	if(crossingEdgeIndex===0){return 'left';}
	if(crossingEdgeIndex===1){return 'top';}
	if(crossingEdgeIndex===2){return 'right';}
	if(crossingEdgeIndex===3){return 'bottom';}
	return 'none';
    };

    const shuffleVertices=R.curry((crossingEdgeIndex,field)=>{
	return makeCubicField(
	    field.edgeLength,
	    permuteVertices(crossingEdgeIndex2Name(crossingEdgeIndex))
	    (field.vertices),
	    field.edgeVectors);	    
    });
    
    const makeCubicField=(edgeLength,vertices,edgeVectors)=>{
	return {
	    edgeLength: edgeLength,
	    vertices: vertices,
	    edgeVectors: edgeVectors
	};
    };

    const makeNewCubicFieldTurtle=R.curry((length,initial2DPosition,draw)=>{
	return [makeCubicField
		(length,initialCubeVertices(length),makeEdgeVectors(length)),
		t.shiftPosition(initial2DPosition)(t.newTurtle(draw))];
    });

    const vertices2DCoordinate = (length)=>{
	return [[0,0],[0,length],[length,length],[length,0]];
    };
    
    const edgeVector = R.curry(
	(vertices2DPosition,vertexIndex1,vertexIndex2)=>{
	    return {
		startPosition: vertices2DPosition[vertexIndex1],
		shift: C.vectorTo(
		    vertices2DPosition[vertexIndex1],
		    vertices2DPosition[vertexIndex2])};
	});
    
    const makeEdgeVectors = (edgeLength)=>{
	const vertices2DPosition=vertices2DCoordinate(edgeLength);
	return [edgeVector(vertices2DPosition,0,1),
		edgeVector(vertices2DPosition,1,2),
		edgeVector(vertices2DPosition,2,3),
		edgeVector(vertices2DPosition,3,0)];
    };

    const makeCrossReporter=R.curry((willCross,edgeIndex,fraction)=>{
	return {intersect: willCross,
		edgeIndex: edgeIndex,
		fraction: fraction};
    });

    const makeNoCrossReporter=()=>{
	return makeCrossReporter(false,-1,-1);
    };
    
    const willCrossEdge=R.curry((edgeIndex,moveLength,[field,turtle])=>{
	const turtlePosition=t.getPosition(turtle);
	const edgeStartPosition=field.edgeVectors[edgeIndex].startPosition;
	const moveVector=
	      C.shiftVector(moveLength,t.getDirection(turtle));
	const edgeVector=field.edgeVectors[edgeIndex].shift;
	const lineParameterOnEdgeDenominator=
	      C.innerProduct(C.perpendicular(moveVector),
			     edgeVector);
	if(Math.abs(lineParameterOnEdgeDenominator)<1.e-8){
	    return makeNoCrossReporter();
	}
	const lineParameterOnEdge=
	      C.innerProduct(
		  C.perpendicular(moveVector),
		  C.subtractVector(turtlePosition,edgeStartPosition))
	      /lineParameterOnEdgeDenominator;
	const lineParameterOnCourse=
	      C.innerProduct(
		  C.perpendicular(edgeVector),
		  C.subtractVector(edgeStartPosition,turtlePosition))
	      /C.innerProduct(C.perpendicular(edgeVector),
			      moveVector);
	return makeCrossReporter(
	    lineParameterOnEdge>0
		&& lineParameterOnEdge<=1
		&& lineParameterOnCourse>0
		&& lineParameterOnCourse<=1,	    
	    edgeIndex, lineParameterOnCourse);
    });

    const willIntersect=R.curry((moveLength,ft)=>{
	for(let edgeIndex of U.intList(4)){
	    const willCross=willCrossEdge(edgeIndex,moveLength,ft);
	    if(willCross.intersect){
		return willCross;
	    }
	}
	return makeNoCrossReporter();
    });
    
    const forward=R.curry((length,ft)=>{
	const acrossEdge=willIntersect(length,ft);
	if(acrossEdge.intersect){
	    return forwardAcrossEdge(length,acrossEdge)(ft);
	}
	return v.forward(length)(ft);
    });

    const wrapTurtle=R.curry((wrapEdgeIndex,[field,turtle])=>{
	const wrapVector=field.edgeVectors[R.mathMod(wrapEdgeIndex+1,4)].shift;
	return v.shift(wrapVector)([field,turtle]);
    });
    
    const forwardAcrossEdge=R.curry((length,acrossEdge,ft)=>{
	const [field,turtle]=
	      R.pipe(v.forward(length*acrossEdge.fraction),
		     wrapTurtle(acrossEdge.edgeIndex))(ft);
	const newFT=[shuffleVertices(acrossEdge.edgeIndex)(field),turtle];
	return forward(length*(1-acrossEdge.fraction))(newFT);
    });
    
    const cubeForward=(length)=>{
	return forward(length);
    };

    const poly=R.curry((side,dDirection)=>{
	return v.repeatForever([forward(side),v.leftTurn(dDirection)]);
    });

    const cubicDraw=R.curry((edgeLength,draw2D)=>{
	const cubeVertices=initialCubeVertices(edgeLength);
	return R.curry(
	    (frontVertices,oldPosition2D,newPosition2D)=>{
		const faceXVector=
		      C.subtractVector(frontVertices[3].coord3D,
				       frontVertices[0].coord3D);
		const faceYVector=
		      C.subtractVector(frontVertices[1].coord3D,
				       frontVertices[0].coord3D);
		
	    });
    });
    
    return {
	cubeForward,
	forward,
	makeNewCubicFieldTurtle,
	poly
    };
    
    
})();
		  
