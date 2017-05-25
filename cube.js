'use strict';

module.exports = (()=> {
  const U=require('./utility.js');
  const R=require('ramda');
  const C=require('./coordinate.js');
  const v=require('./vector.js');
  const t=require('./turtle.js');
  const p=require('./projection.js');
  
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
      return [4,5,1,0,7,6,2,3];
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

  const makeNewCubicFieldTurtle=R.curry(
    (length,initial2DPosition,longLat,draw)=>{
      return [makeCubicField
	      (length,initialCubeVertices(length),makeEdgeVectors(length)),
	      t.shiftPosition(initial2DPosition)
	      (t.newTurtle(cubicDraw(length,longLat,draw)))];
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
    if(U.isOnInterval(0,1,lineParameterOnEdge)){
      if(lineParameterOnCourse>0
	 && lineParameterOnCourse<1){
	return makeCrossReporter(true,edgeIndex, lineParameterOnCourse);
      }else if(lineParameterOnCourse===0
	       && isBeyondEdge(t.getDirection(turtle),edgeIndex)){
	return makeCrossReporter(true,edgeIndex, lineParameterOnCourse);
      }
    }
    return makeNoCrossReporter();
  });

  const isBeyondEdge=R.curry(([direction],edgeIndex)=>{
    if(edgeIndex===0){
      return direction>90 && direction<270;
    }else if (edgeIndex===1){
      return direction>0 && direction<180;
    }else if (edgeIndex===2){
      return (direction>=0 && direction<90) || direction>270;
    }else if (edgeIndex===3){
      return direction>180 && direction<360;
    }
    return false;
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
    return forwardWithoutCrossing(length)(ft);
  });

  const forwardWithoutCrossing=R.curry((length,[field,turtle])=>{
    const oldCoordinate=t.getPosition(turtle);
    const newTurtle=t.shiftPosition(length)(turtle);
    const newCoordinate=t.getPosition(newTurtle);
    turtle.draw(frontVertices(field.vertices),oldCoordinate,newCoordinate);
    return [field,newTurtle];
  });
  
  const wrapTurtle=R.curry((wrapEdgeIndex,[field,turtle])=>{
    const wrapVector=field.edgeVectors[R.mathMod(wrapEdgeIndex+1,4)].shift;
    return v.shift(wrapVector)([field,turtle]);
  });
  
  const forwardAcrossEdge=R.curry((length,acrossEdge,ft)=>{
    const [field,turtle]=
	  R.pipe(forwardWithoutCrossing(length*acrossEdge.fraction),
		 wrapTurtle(acrossEdge.edgeIndex))(ft);
    const newFT=[shuffleVertices(acrossEdge.edgeIndex)(field),turtle];
    return forward(length*(1-acrossEdge.fraction))(newFT);
  });
  
  const cubeForward=forward;

  const monogon=R.curry((length,direction)=>{
    return R.pipe(leftTurn(direction),
		  v.repeatForever([forward(length)]));
		  //v.repeat([forward(length)],4));
  });
  const poly=R.curry((side,direction,dDirection)=>{
    return R.pipe(
      leftTurn(direction),
      v.repeatForever([forward(side),v.leftTurn(dDirection)]));
  });

  const leftTurn=v.leftTurn;
  
  const drawCubicFrame=R.curry((edgeLength,[longitude,latitude],draw2D)=>{
    const cubeVertices=initialCubeVertices(edgeLength);
    const cube2DVertices=p.vertice3Dto2D(longitude,latitude,cubeVertices);
    draw2D(cube2DVertices[0].coord2D,cube2DVertices[1].coord2D);
    draw2D(cube2DVertices[1].coord2D,cube2DVertices[2].coord2D);
    draw2D(cube2DVertices[2].coord2D,cube2DVertices[3].coord2D);
    draw2D(cube2DVertices[3].coord2D,cube2DVertices[0].coord2D);
    draw2D(cube2DVertices[0].coord2D,cube2DVertices[4].coord2D);
    draw2D(cube2DVertices[1].coord2D,cube2DVertices[5].coord2D);
    draw2D(cube2DVertices[2].coord2D,cube2DVertices[6].coord2D);
    draw2D(cube2DVertices[3].coord2D,cube2DVertices[7].coord2D);
    draw2D(cube2DVertices[4].coord2D,cube2DVertices[5].coord2D);
    draw2D(cube2DVertices[5].coord2D,cube2DVertices[6].coord2D);
    draw2D(cube2DVertices[6].coord2D,cube2DVertices[7].coord2D);
    draw2D(cube2DVertices[7].coord2D,cube2DVertices[4].coord2D);
  });
  
  const cubicDraw=R.curry((edgeLength,[longitude,latitude],draw2D)=>{
    const cubeVertices=initialCubeVertices(edgeLength);
    const cube2DVertices=p.vertice3Dto2D(longitude,latitude,cubeVertices);
    return R.curry(
      (frontVertices,oldPosition2D,newPosition2D)=>{
	const faceXVectorProjected=
	      C.subtractVector(
		cube2DVertices[frontVertices[3].index].coord2D,
		cube2DVertices[frontVertices[0].index].coord2D);
	const faceYVectorProjected=
	      C.subtractVector(
		cube2DVertices[frontVertices[1].index].coord2D,
		cube2DVertices[frontVertices[0].index].coord2D);
	const oldNormalized=
	      C.multiplyVector(1/edgeLength,oldPosition2D);
	const newNormalized=
	      C.multiplyVector(1/edgeLength,newPosition2D);
	const projectedOld=
	      C.addVector(
		cube2DVertices[frontVertices[0].index].coord2D,
		C.addVector(
		  C.multiplyVector(
		    oldNormalized[0],faceXVectorProjected),
		  C.multiplyVector(
		    oldNormalized[1],faceYVectorProjected)));
	const projectedNew=
	      C.addVector(
		cube2DVertices[frontVertices[0].index].coord2D,
		C.addVector(
		  C.multiplyVector(
		    newNormalized[0],faceXVectorProjected),
		  C.multiplyVector(
		    newNormalized[1],faceYVectorProjected)));
	draw2D(projectedOld,projectedNew);
      });
  });
  
  return {
    cubeForward: cubeForward,
    cubicDraw: cubicDraw,
    drawCubicFrame: drawCubicFrame,
    forward: forward,
    leftTurn: leftTurn,
    makeNewCubicFieldTurtle: makeNewCubicFieldTurtle,
    monogon: monogon,
    poly: poly
  };
  
  
})();

