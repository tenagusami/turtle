'use strict';
module.exports = (()=> {
  const U=require('./utility.js');
  const R=require('ramda');
  const C=require('./coordinate.js');

  const forever=10000;
  const penDownFlag=true;
  const penUpFlag=false;
  
  const initialPosition = C.origin;

  const initialDirection = ()=>{
    return [90];
  };

  const newTrace= (position)=>{
    return [{penStatus:penUpFlag, position:position}];
  };

  const newTurtle=(draw,position=initialPosition)=>{
    return {direction: initialDirection(),
	    trace:newTrace(position),
	    draw: draw
	   };
  };

  const copyTurtle=(turtle)=>{
    return {direction: getDirection(turtle),
	    trace: U.copyVector(turtle.trace),
	    draw: turtle.draw};
  };
  
  const makeStatus=(penStatus,position)=>{
    return({penStatus: penStatus, position: position});
  };
  
  const appendStatus = R.curry((newStatus,turtle)=>{
    turtle.trace.push(newStatus);
    return turtle;
  });

  const currentStatus=(turtle)=>{return R.last(turtle.trace);};

  const penUpDown=R.curry((penDownTrue,turtle) =>{
    if(getStatus(turtle).penStatus===penDownTrue){
      return turtle;
    }
    appendStatus(
      makeStatus(penDownTrue,getPosition(turtle)),turtle);
    return turtle;
  });

  const turn=R.curry((dDirection,turtle)=>{
    turtle.direction = C.shiftDirection(turtle.direction,dDirection);
    return turtle;
  });

  const getStatus=(...args)=>{
    if(args.length>1){
      return args[1].trace[args[0]];
    }
    return currentStatus(args[0]);
  };

  const isPenDown=(...args)=>{return getStatus(...args).penStatus;};

  const isPenUp=(...args)=>{return !getStatus(...args).penStatus;};

  const getPosition=(...args)=>{
    return U.copyVector(getStatus(...args).position);
  };

  const getDirection=(turtle)=>{return U.copyVector(turtle.direction);};

  const setDirection=R.curry((newDirection,turtle)=>{
    turtle.direction=newDirection.map(U.rMathModulo(360));
    return turtle;
  });
  
  const penDown=penUpDown(penDownFlag);

  const penUp=penUpDown(penUpFlag);

  const shiftCoordinate=R.curry((dPosition,turtle)=>{
    const currentPosition=getPosition(turtle);
    appendStatus
    (makeStatus(isPenDown(turtle),
		C.addPosition(currentPosition,dPosition)),turtle);
    return turtle;
  });

  const shiftDistance=R.curry((distance,turtle)=>{
    return shiftCoordinate(
      C.shiftVector(distance,turtle.direction),turtle);
  });

  const shiftPosition=R.curry((argument,turtle)=>{
    if(typeof argument === 'number'){
      return shiftDistance(argument,turtle);
    }
    return shiftCoordinate(argument,turtle);
  });

  const forward=R.curry((distance,turtle)=>{
    let oldCoordinate=getPosition(turtle);
    let newTurtle=shiftPosition(distance)(turtle);
    let newCoordinate=getPosition(newTurtle);
    turtle.draw(oldCoordinate,newCoordinate);
    return newTurtle;
  });

  const leftTurn=(dDirection)=>{return turn(dDirection);};

  const rightTurn=(dDirection)=>{
    return turn(C.negateDirection(dDirection));
  };
  
  const repeatTimes=R.curry((dispatcher,times)=>{
    return (turtle)=>{
      let turtleNew=turtle;
      R.forEach((dummyIndex)=>{
	turtleNew=dispatcher(turtleNew);
      },U.intList(times));
      return turtleNew;
    };
  });

  const repeatForever=(dispatcher)=>{
    return (turtle)=>{
      let turtleNew=turtle;
      while(true){
	turtleNew=dispatcher(turtleNew);
      }
      return turtleNew;
    };
  };
  
  const repeat=(...args)=>{
    const dispatcher=args[0];
    if(args.length===1){
      //return repeatForever(dispatcher);
      return repeatTimes(dispatcher)(forever);
    };
    return repeatTimes(dispatcher)(args[1]);
   };

 
  const bearingAngle=R.curry((position,turtle)=>{
    let positionDirection=C.directionTo(getPosition(turtle),position);
    return C.subtractDirection(
      positionDirection,turtle.direction);
  });
  
  const face=R.curry((position,turtle)=>{
    return leftTurn(bearingAngle(position,turtle))(turtle);
  });
  
  return {newTurtle: newTurtle,
	  copyTurtle: copyTurtle,
	  getPosition: getPosition,
	  getDirection: getDirection,
	  setDirection: setDirection,
	  shiftPosition: shiftPosition,
	  forward: forward,
	  leftTurn: leftTurn,
	  rightTurn: rightTurn,
	  repeat: repeat,
	  repeatForever: repeatForever,
	  bearingAngle: bearingAngle,
	  face: face,
	  forever: forever
	 };
})();
