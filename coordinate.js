'use strict';
module.exports = (()=> {
  const U=require('./utility.js');
  const R=require('ramda');
  const math=require('mathjs');
  
  const dimensionarity=2;
  const deg2Rad=math.pi/180;
  const rad2Deg=1/deg2Rad;

  const origin=(dim=2)=>{return U.intList(dim).fill(0);};

  const addPosition=R.curry((position1,position2,dim=2)=>{
    return U.intList(dim)
      .map((index)=>{return U.roundDecimal(10,position1[index]+position2[index]);});
  });

  const distanceBetween=R.curry((position1,position2,dim=2)=>{
    const vectorDifference=subtractVector(position1,position2,dim);
    return math.sqrt(
      innerProduct(vectorDifference,vectorDifference,dim));
  });
  
  const shiftVector=R.curry((distance,direction,dim=2)=>{
    return [
      distance*Math.cos(direction[0]*deg2Rad),
      distance*Math.sin(direction[0]*deg2Rad)
    ];
  });

  const vectorTo=R.curry((positionFrom,positionTo,dim=2)=>{
    return U.intList(dim)
      .map((index)=>{return positionTo[index]-positionFrom[index];});
  });
  
  const directionTo=R.curry((positionFrom,positionTo,dim=2)=>{
    const vector=vectorTo(positionFrom,positionTo,dim);
    return [math.atan2(vector[1],vector[0])*rad2Deg]
      .map(U.rMathModulo(360));
    ;
  });

  const isSamePosition=R.curry((position1,position2,dim=2)=>{
    return R.all(
      (index)=>{return position1[index]===position2[index];},
      U.intList(dim));
  });

  const shiftDirection=R.curry((direction, dDirection,dim=2)=>{
    if(dim===2){
      if(typeof(dDirection)==='number'){
	return shiftDirection(direction,[dDirection],dim);
      }
      if (typeof(direction)==='number'){
	return shiftDirection([direction],dDirection,dim);
      }
    }
    return R.zipWith(R.add,direction,dDirection)
      .map(U.rMathModulo(360));
  });

  const subtractDirection=R.curry((direction, dDirection,dim=2)=>{
    return shiftDirection(direction,negateDirection(dDirection),dim);
  });

  const multiplyDirection=R.curry((factor,direction,dim=2)=>{
    if(typeof(direction)==='number' && dim===2){
      return [U.rMathModulo(360,factor*direction)];
    }
    return direction.map(
      R.pipe(R.multiply(factor),U.rMathModulo(360)));
  });

  const multiplyVector=R.curry((factor,vector)=>{
    return vector.map(R.multiply(factor));
  });

  const negateVector=R.map(R.negate);

  const addVector=addPosition;

  const subtractVector=R.curry((vector1,vector2,dim=2)=>{
    return addVector(vector1,negateVector(vector2),dim);
  });
  
  const negateDirection=(direction)=>{
    return multiplyDirection(-1,direction);
  };

  const makeDirection=R.curry((...args)=>{
    return [args[0]];
  });

  const innerProduct = R.curry((vector1,vector2,dim=2)=>{
    return U.roundDecimal(
      10, U.intList(dim)
	.reduce((reduced,index)=>{
	  return reduced+vector1[index]*vector2[index];
	},0));
  });
			       
  const perpendicular=(vector,dim=2)=>{
    return [-vector[1],vector[0]];
  };

  return {
    addPosition: addPosition,
    addVector: addVector,
    deg2Rad: deg2Rad,
    directionTo: directionTo,
    distanceBetween: distanceBetween,
    innerProduct: innerProduct,
    isSamePosition: isSamePosition,
    makeDirection: makeDirection,
    multiplyDirection: multiplyDirection,
    multiplyVector: multiplyVector,
    negateDirection: negateDirection,
    negateVector: negateVector,
    origin: origin,
    perpendicular: perpendicular,
    shiftDirection: shiftDirection,
    shiftVector: shiftVector,
    subtractDirection: subtractDirection,
    subtractVector: subtractVector,
    vectorTo: vectorTo
  };
})();
