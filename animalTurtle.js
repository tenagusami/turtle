'use strict';

module.exports = (()=>{
  const R=require('ramda');
  const t=require('./turtle.js');
  const C=require('./coordinate.js');
  const U=require('./utility.js');
  const math=require('mathjs');
  const MersenneTwister = require('mersenne-twister');
  let generator = new MersenneTwister();
  
  const weaker=Symbol('weaker');
  const stronger=Symbol('stronger');

  const foodPosition=[200,0];

  const smell=R.curry((distanceOld,distanceNew)=>{
    return distanceOld<distanceNew?weaker:stronger;
  });

  const findBySmell2=R.curry((dDirection,field,turtle)=>{
    
    let newTurtle=turtle;
    for(let i of U.intList(1000)){
      const oldPosition=t.getPosition(newTurtle);
      newTurtle=t.forward(1)(newTurtle);
      if(smell(C.distanceBetween(oldPosition,foodPosition),
	       C.distanceBetween(t.getPosition(newTurtle),foodPosition))
	 ===weaker){
	newTurtle=t.rightTurn(dDirection)(newTurtle);
      }
    };
    return newTurtle;
  });

  const findBySmell3=R.curry((dDirection,rDirection,field,turtle)=>{
    let newTurtle=turtle;
    for(let i of U.intList(1000)){
      const oldPosition=t.getPosition(newTurtle);
      newTurtle=R.pipe(
	t.forward(1),
	t.leftTurn([U.randomR(-rDirection,rDirection)]))(newTurtle);
      if(smell(C.distanceBetween(oldPosition,foodPosition),
	       C.distanceBetween(t.getPosition(newTurtle),foodPosition))
	 ===weaker){
	newTurtle=t.rightTurn(dDirection)(newTurtle);
      }
    }
    return newTurtle;
  });

  const avoidBySmell=R.curry((dDirection,field,turtle)=>{
    let newTurtle=turtle;
    for(let i of U.intList(1000)){
      const oldPosition=t.getPosition(newTurtle);
      newTurtle=t.forward(1)(newTurtle);
      if(smell(C.distanceBetween(oldPosition,foodPosition),
	       C.distanceBetween(t.getPosition(newTurtle),foodPosition))
	 ===stronger){
	newTurtle=t.rightTurn(dDirection)(newTurtle);
      }
    };
    return newTurtle;
  });
  
  const distanceFactor=(turtle)=>{
    return 1/C.distanceBetween(t.getPosition(turtle),foodPosition);
  };
  
  const varyingStep = R.curry((side,dDirection,field,turtle)=>{
    let newTurtle=turtle;
    for(let i of U.intList(5000)){
      newTurtle=R.pipe(t.forward(distanceFactor(newTurtle)*side),
		       t.rightTurn(dDirection))(newTurtle);
    }
    return newTurtle;
  });

  const varyingDirection = R.curry((side,dDirection,field,turtle)=>{
    let newTurtle=turtle;
    for(let i of U.intList(50000)){
      newTurtle=R.pipe(
	t.forward(side),
	t.rightTurn(dDirection.map(R.multiply(distanceFactor(newTurtle)))))
      (newTurtle);
    }
    return newTurtle;
  });

  const keepABearing = R.curry((lightPosition,angle,field,turtle) =>{
    for(let i of U.intList(1000)){
      turtle=R.pipe(t.face(lightPosition),
		    t.leftTurn(angle),
		    t.forward(1))(turtle);
    }
    return turtle;
  });

  const doesRightEyeSee=R.curry((position,turtle)=>{
    const bearing=t.bearingAngle(position,turtle)[0];
    return bearing>300 || bearing<10;
  });

  const doesLeftEyeSee=R.curry((position,turtle)=>{
    const bearing=t.bearingAngle(position,turtle)[0];
    return bearing>350 || bearing<60;
  });

  const doesEyeSee=R.curry((position,turtle)=>{
    return doesRightEyeSee(position,turtle)
      || doesLeftEyeSee(position,turtle);
  });
  
  const headFor=R.curry((lightPosition,field,turtle)=>{
    for(let i of U.intList(1000)){
      if(doesEyeSee(lightPosition,turtle)){
	turtle=t.forward(1)(turtle);
      }else{
	turtle=t.leftTurn([10])(turtle);
      }
    }
    return turtle;
  });

  const intensity = R.curry(
    (visibleCriterion,offset,lightPosition,strength,turtle)=>{
      if(!visibleCriterion(lightPosition,turtle)){return 0;}
      const factor=strength/
	      math.pow(C.distanceBetween
		       (t.getPosition(turtle),lightPosition),2);
      const angle=t.bearingAngle(lightPosition,turtle)[0]-offset;
      return factor*math.cos(angle);
    });
  
  const intensityLeft = intensity(doesLeftEyeSee,45);
  const intensityRight = intensity(doesRightEyeSee,-45);
  
  const findBySight = R.curry((lightPosition,strength,field,turtle)=>{
    for(let i of U.intList(1000)){
      turtle=t.forward(1)(turtle);
      if(intensityLeft(lightPosition,strength,turtle)
	 >intensityRight(lightPosition,strength,turtle)){
	turtle=t.leftTurn([10])(turtle);
      }else{
	turtle=t.rightTurn([10])(turtle);
      }
    }
    return turtle;
  });

  const findBySight2 = R.curry(
    (lightPosition1,lightPosition2,strength1,strength2,field,turtle)=>{
    for(let i of U.intList(5000)){
      turtle=t.forward(1)(turtle);
      const totalLeft=intensityLeft(lightPosition1,strength1,turtle)
	      +intensityLeft(lightPosition2,strength2,turtle);
      const totalRight=intensityRight(lightPosition1,strength1,turtle)
	      +intensityRight(lightPosition2,strength2,turtle);
      if(totalLeft>totalRight){
	turtle=t.leftTurn([10])(turtle);
      }else{
	turtle=t.rightTurn([10])(turtle);
      }
    }
    return turtle;
  });

  const preyStep=R.curry((speed,turn,predator,prey)=>{
    return R.pipe(t.forward(speed),t.rightTurn(turn))(prey);
  });

  const preyStepAvoidBySmell=R.curry((speed,turn,predator,prey)=>{
    const oldPosition=t.getPosition(prey);
    prey=t.forward(speed)(prey);
    if(smell(
      C.distanceBetween(oldPosition,t.getPosition(predator)),
      C.distanceBetween(t.getPosition(prey),t.getPosition(predator)))
       ===stronger){
      prey=t.rightTurn(turn)(prey);
    }
    return prey;
  });


  const predatorStepSmell=R.curry((speed,turn,prey,predator)=>{
    const oldPosition=t.getPosition(predator);
    const preyPosition=t.getPosition(prey);
    predator=t.forward(speed)(predator);
    if(smell(C.distanceBetween(oldPosition,preyPosition),
	     C.distanceBetween(t.getPosition(predator),preyPosition))
       ===weaker){
      predator=t.rightTurn(turn)(predator);
    }
    return predator;
  });

  const predatorStepSight= R.curry((speed,turn,prey,predator)=>{
    const strength=1;
    predator=t.forward(speed)(predator);
    if(intensityLeft(t.getPosition(prey),strength,predator)
	 >intensityRight(t.getPosition(prey),strength,predator)){
      predator=t.leftTurn(turn)(predator);
      }else{
	predator=t.rightTurn(turn)(predator);
      }
    return predator;
  });
  
  const predatorPrey = R.curry((field,predator,prey)=>{
    for(let i of U.intList(10000)){
      predator=predatorStepSmell(4,[30])(prey)(predator);
      //predator=predatorStepSight(6,[5])(prey)(predator);
      prey=preyStep(2,[1])(predator)(prey);
      //prey=preyStepAvoidBySmell(0.5,[1])(predator)(prey);
      
    }
    return [predator,prey];
  });


  const
  chamber =
    R.curry(
      (base,side1,side2,direction1,direction2,field,turtle)=>{
	const originalPosition=t.getPosition(turtle);
	const originalDirection=t.getDirection(turtle);
	turtle=R.pipe(
	  t.forward(base),
	  t.leftTurn(direction2),
	  t.forward(side2))(turtle);
	const edgePosition=t.getPosition(turtle);
	turtle=
	  t.shiftPosition(C.vectorTo(edgePosition,originalPosition))
	(turtle);
	turtle.direction=originalDirection;
	turtle=R.pipe(t.leftTurn(direction1),
		      t.forward(side1),
		      t.face(edgePosition))(turtle);
	const ratioSimilarity=
		C.distanceBetween(t.getPosition(turtle),edgePosition)
		/base;
	return [turtle,ratioSimilarity];
      });
  
  const spiralGrowth=R.curry(
    (baseStart,side1,side2,direction1,direction2,field,turtle)=>{
      const
      spiralGrowthWithSimilarity =
	R.curry(
	  (base,side1,side2,field,turtle,count)=>{
	     if(count===0){return [turtle,1];}
	     let
	       [newTurtle,newRatio]=
	       chamber(base,side1,side2,direction1,direction2,field,turtle);
	     return spiralGrowthWithSimilarity
	     (newRatio*base,newRatio*side1,newRatio*side2,
	      field,newTurtle,count-1);
	  });
      return spiralGrowthWithSimilarity
      (baseStart,side1,side2,field,turtle,100)[0];
  });

  const branch =R.curry((length,level,field,turtle)=>{
    const branchIter = R.curry((length,level,turtle)=>{
      if(level===0){return turtle;}
      turtle=t.forward(length)(turtle);
      let turtle2=t.copyTurtle(turtle);
      turtle=branchIter(length/2,level-1,t.leftTurn([45])(turtle));
      turtle2=branchIter(length/2,level-1,t.rightTurn([45])(turtle2));
      return turtle;
    });
    return branchIter(length,level,turtle);
  });
  
  const leftBranch=R.curry((length,direction,level,field,turtle)=>{
    turtle=t.forward(2*length)(turtle);
    return node(length,direction,level,field,turtle);
  });

  const rightBranch=R.curry((length,direction,level,field,turtle)=>{
    turtle=t.forward(length)(turtle);
    return node(length,direction,level,field,turtle);
  });

  const node=R.curry((length,direction,level,field,turtle)=>{
    if(level===0){return turtle;}
    let turtle2=t.copyTurtle(turtle);
    turtle=t.leftTurn(direction)(turtle);
    turtle=leftBranch(length,direction,level-1,field,turtle);
    turtle2=t.rightTurn(direction.map(R.multiply(2)))(turtle2);
    turtle2=rightBranch(length,direction,level-1,field,turtle2);
    return turtle;    
  });
  
  return {
    branch: branch,
    findBySight: findBySight,
    findBySight2: findBySight2,
    findBySmell2: findBySmell2,
    findBySmell3: findBySmell3,
    headFor: headFor,
    keepABearing: keepABearing,
    node: node,
    predatorPrey: predatorPrey,
    spiralGrowth: spiralGrowth,    
    varyingDirection: varyingDirection,
    varyingStep: varyingStep
  };
})();





