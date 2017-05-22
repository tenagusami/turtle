'use strict';
module.exports = (()=> {
    const U=require('./utility.js');
    const R=require('ramda');
    const math=require('mathjs');
    
    const dimensionarity=2;
    const deg2Rad=math.pi/180;
    const rad2Deg=1/deg2Rad;

    const origin=U.intList(dimensionarity).fill(0);

    const addPosition=R.curry((position1,position2)=>{
	return U.intList(dimensionarity)
	    .map((index)=>{return position1[index]+position2[index];});
    });

    const distanceBetween=R.curry((position1,position2)=>{
	return math.sqrt(U.intList(dimensionarity)
			 .map((index)=>{return Math.pow(position1[index]-position2[index],2);})
			 .reduce(R.add,0));
    });
    
    const shiftVector=R.curry((distance,direction)=>{
	return [
	    distance*Math.cos(direction[0]*deg2Rad),
	    distance*Math.sin(direction[0]*deg2Rad)
	];
    });

    const vectorTo=R.curry((positionFrom,positionTo)=>{
	return U.intList(dimensionarity)
	    .map((index)=>{return positionTo[index]-positionFrom[index];});
    });
    
    const directionTo=R.curry((positionFrom,positionTo)=>{
	const vector=vectorTo(positionFrom,positionTo);
	return [math.atan2(vector[1],vector[0])*rad2Deg]
	    .map(U.rMathModulo(360));
	;
    });

    const isSamePosition=R.curry((position1,position2)=>{
	return R.all(
	    (index)=>{return position1[index]===position2[index];},
	    U.intList(dimensionarity));
    });

    const shiftDirection=R.curry((direction, dDirection)=>{
	if(dimensionarity===2){
	    if(typeof(dDirection)==='number'){
		return shiftDirection(direction,[dDirection]);
	    }
	    if (typeof(direction)==='number'){
		return shiftDirection([direction],dDirection);
	    }
	}
	return R.zipWith(R.add,direction,dDirection)
	    .map(U.rMathModulo(360));
    });

    const subtractDirection=R.curry((direction, dDirection)=>{
	return shiftDirection(direction,negateDirection(dDirection));
    });

    const multiplyDirection=R.curry((factor,direction)=>{
	if(typeof(direction)==='number' && dimensionarity===2){
	    return [U.rMathModulo(360,factor*direction)];
	}
	return direction.map(
	    R.pipe(R.multiply(factor),U.rMathModulo(360)));
    });

    const negateVector=R.map(R.negate);

    const addVector=addPosition;

    const subtractVector=R.curry((vector1,vector2)=>{
	return addVector(vector1,negateVector(vector2));
    });
    
    const negateDirection=(direction)=>{
	return multiplyDirection(-1,direction);
    };

    const makeDirection=R.curry((...args)=>{
	return [args[0]];
    });

    const innerProduct = R.curry((vector1,vector2)=>{
	return U.intList(dimensionarity)
	    .reduce((reduced,index)=>{
		return reduced+vector1[index]*vector2[index];
	    },0);
    });

    const perpendicular=(vector)=>{
	return [-vector[1],vector[0]];
    };

    return {
	addPosition: addPosition,
	addVector: addVector,
	dimensionarity: dimensionarity,
	directionTo: directionTo,
	distanceBetween: distanceBetween,
	innerProduct: innerProduct,
	isSamePosition: isSamePosition,
	makeDirection: makeDirection,
	multiplyDirection: multiplyDirection,
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
