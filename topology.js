'use strict';

module.exports = (()=> {
  const U=require('./utility.js');
  const R=require('ramda');
  const C=require('./coordinate.js');
  const v=require('./vector.js');

  const scissor=R.curry((distance,phase)=>{
    return R.pipe(
      v.rightTurn(phase),
      v.forward(distance),
      v.leftTurn(2*phase),
      v.forward(distance),
      v.rightTurn(phase));
  });

  const scissorPoly=R.curry((distance,direction,phase)=>{
    let totalTurning=0;
    const incrementTotalTurning=(ft)=>{
      totalTurning=C.shiftDirection(totalTurning,direction);
      return ft;
    };
    const predicate=(ft)=>{
      return U.rMathModulo(360)(totalTurning)<1.e-8;
    };
    return v.repeatUntil([
      (ft)=>{
	return R.pipe(scissor(direction,phase),v.leftTurn(direction))(ft);
      },incrementTotalTurning],predicate);
  });
  
  return {
    scissor: scissor,
    scissorPoly: scissorPoly
  };
  
})();
