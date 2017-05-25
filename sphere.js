'use strict';

module.exports = (()=> {
  const U=require('./utility.js');
  const R=require('ramda');
  const C=require('./coordinate.js');
  const v=require('./vector.js');
  const t=require('./turtle.js');
  const p=require('./projection.js');
  const math=require('mathjs');
  
  const dAngle=1;

  const makeNewField=(radius)=>{
    return {radius:radius};
  };
  
  const makeNewTurtle=R.curry((radius,longLat,draw2D)=>{
    return makeTurtle(
      //[0,-radius,0],[0,0,radius],[-radius,0,0],
      [radius,0,0],[0,0,radius],[0,-radius,0],
      sphericalDraw(longLat,draw2D));
  });

  const makeNewFieldTurtle=R.curry((radius,longLat,draw2D)=>{
    return [makeNewField(radius),makeNewTurtle(radius,longLat,draw2D)];
  });

  const makeTurtle=R.curry((position,heading,left,draw)=>{
    return {position: position,
	    heading: heading,
	    left: left,
	    draw: draw};
  });

  const rotatePosition=R.curry((angle,turtle)=>{
    return C.addVector(
      C.multiplyVector(math.cos(angle*C.deg2Rad),turtle.position,3),
      C.multiplyVector(math.sin(angle*C.deg2Rad),turtle.heading,3),3);
  });

  const rotateHeading=R.curry((angle,turtle)=>{
    return C.subtractVector(
      C.multiplyVector(math.cos(angle*C.deg2Rad),turtle.heading,3),
      C.multiplyVector(math.sin(angle*C.deg2Rad),turtle.position,3),3);
  });

  const rotateLeft=R.curry((angle,turtle)=>{
    return C.subtractVector(
      C.multiplyVector(math.cos(angle*C.deg2Rad),turtle.left,3),
      C.multiplyVector(math.sin(angle*C.deg2Rad),turtle.heading,3),3);
  });

  const forward1Time=R.curry((angle,[field,turtle])=>{
    turtle.draw(turtle.position,rotatePosition(angle,turtle));
    return shift(angle,[field,turtle]);
  });

  const shift=R.curry((angle,[field,turtle])=>{
    return [field,
	    makeTurtle(
	      rotatePosition(angle,turtle),
	      rotateHeading(angle,turtle),turtle.left,turtle.draw)];
  });

  const dForward=forward1Time(dAngle);

  const forward=R.curry((angle,ft)=>{
    const times=math.floor(angle/dAngle);
    const remainder=U.rMathModulo(dAngle,angle);
    /*return R.pipe(
      v.repeat(U.intList(times).map((index)=>{return dForward;})),
      forward1Time(remainder))(ft);*/
    //return forward1Time(angle)(ft);
    for(let i of U.intList(times)){
      ft=forward1Time(dAngle)(ft);
    }
    return forward1Time(remainder)(ft);
  });

  const leftTurn=R.curry((angle,[field,turtle])=>{
    return [field,
	    makeTurtle(
	      turtle.position,rotateHeading(-angle,turtle),
	      rotateLeft(angle,turtle),turtle.draw)];
  });

  const sphericalDraw=R.curry((longLat,draw2D)=>{
    const projector=p.projector(longLat);
    return R.curry((oldPosition3D,newPosition3D)=>{
      draw2D(projector(oldPosition3D),projector(newPosition3D));
    });
  });

  const drawSphericalFrame=R.curry(
    (radius,viewLongitudeLatitude,draw2D)=>{
      const length=radius*math.sin(dAngle*C.deg2Rad);
      const ft1=R.pipe(
	v.leftTurn(90),	
	v.repeat([v.leftTurn(dAngle),v.forward(length)],360))
      ([0,t.newTurtle(draw2D,[0,radius])]);
      
      let ft2=makeNewFieldTurtle(radius,viewLongitudeLatitude,draw2D);
      ft2=leftTurn(90)(ft2);
      for(let i of U.intList(360)){
	ft2=forward1Time(dAngle)(ft2);
      }
    });
  
  
  return {
    drawSphericalFrame: drawSphericalFrame,
    forward: forward,
    leftTurn: leftTurn,
    makeNewFieldTurtle: makeNewFieldTurtle
  };
  
})();
