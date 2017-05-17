'use strict';

module.exports = (()=>{
  const U=require('./utility.js');
  const R=require('ramda');
  const t=require('./turtle.js');
  const C=require('./coordinate.js');

  const equiangularSpiral=R.curry
  ((size,direction,factor,field,turtle)=>{
    for(let i of U.intList(10000)){
      turtle=R.pipe(scaledForward(factor,size),
		    t.rightTurn(direction))(turtle);
      size=growScale(size,factor);
    }
    return turtle;
  });

  const nestedTriangle=R.curry((size,field,turtle)=>{
    if(size<1){return turtle;}
    for(let i of U.intList(3)){
      nestedTriangle(size/2,field,turtle);
      t.forward(size)(turtle);
      t.rightTurn([120])(turtle);
    }
    return turtle;
  });

  const cornerTriangle=R.curry((size,field,turtle)=>{
    if(size<1){return turtle;}
    for(let i of U.intList(3)){
      turtle=t.forward(size/2)(turtle);
      turtle=cornerTriangle(size/2,field,turtle);
      turtle=t.rightTurn([120])(turtle);
    }
    return turtle;
  });

  const outwardTriangle=R.curry((size,field,turtle)=>{
    if(size<1){return turtle;}
    for(let i of U.intList(3)){
      turtle=t.forward(size/2)(turtle);
      turtle=insert(size,field,turtle);
      turtle=t.forward(size/2)(turtle);
      turtle=t.rightTurn([120])(turtle);
    }
    return turtle;
  });

  const insert = R.curry((size,field,turtle)=>{
    turtle=t.leftTurn([120])(turtle);
    turtle=outwardTriangle(size/2,field,turtle);
    turtle=t.rightTurn([120])(turtle);
    return turtle;
  });

  const cornerPoly=R.curry((size,direction,totalTurn,field,turtle)=>{
    const cornerPolyStep=R.curry((size,direction,turtle)=>{
      turtle=t.forward(size)(turtle);
      turtle=cornerPoly(size/2,C.negateDirection(direction),0)(field,turtle);
      return t.rightTurn(direction)(turtle);
    });
    if(size<5){return turtle;}
    do{
      //while(!U.rMathModulo(360,totalTurn)<1){
      //for(let i of U.intList(4)){
      turtle=cornerPolyStep(size,direction,turtle);
      totalTurn=U.rMathModulo(360,totalTurn+direction[0]);
    }while(!U.rMathModulo(360,totalTurn)<1)
    return turtle;
  });

  const snowflake=R.curry((size,level,field,turtle)=>{
    const side=R.curry((size,level,turtle)=>{
      if(level===0){
	turtle=t.forward(size)(turtle);
	return turtle;
      }
      turtle=side(size/3,level-1)(turtle);
      turtle=t.leftTurn(C.makeDirection(60))(turtle);
      turtle=side(size/3,level-1)(turtle);
      turtle=t.rightTurn(C.makeDirection(120))(turtle);
      turtle=side(size/3,level-1)(turtle);
      turtle=t.leftTurn(C.makeDirection(60))(turtle);
      turtle=side(size/3,level-1)(turtle);
      return turtle;
    });
    for(let i of U.intList(3)){
      turtle=side(size,level)(turtle);
      turtle=t.rightTurn(C.makeDirection(120))(turtle);
    }
    return turtle;
  });

  const cCurve=R.curry((size,level,field,turtle)=>{
    if(level===0){
      t.forward(size)(turtle);
      return turtle;
    }
    turtle=cCurve(size,level-1)(field,turtle);
    turtle=t.rightTurn(C.makeDirection(90))(turtle);
    turtle=cCurve(size,level-1)(field,turtle);
    turtle=t.leftTurn(C.makeDirection(90))(turtle);
    return turtle;    
  });

  const leftDragon=R.curry((size,level,field,turtle)=>{
    if(level===0){
      turtle=t.forward(size)(turtle);
      return turtle;
    }
    turtle=leftDragon(size,level-1,field,turtle);
    turtle=t.leftTurn(C.makeDirection(90))(turtle);
    return rightDragon(size,level-1,field,turtle);
  });

  const rightDragon=R.curry((size,level,field,turtle)=>{
    if(level===0){
      turtle=t.forward(size)(turtle);
      return turtle;
    }
    turtle=leftDragon(size,level-1,field,turtle);
    turtle=t.rightTurn(90)(turtle);
    return rightDragon(size,level-1,field,turtle);
  });
  
  const HilbertCurve=R.curry((size,level,parity,field,turtle)=>{
    if(level===0){return turtle;}
    turtle=t.leftTurn(parity*90)(turtle);
    turtle=HilbertCurve(size,level-1,-parity)(field,turtle);
    turtle=t.forward(size)(turtle);
    turtle=t.rightTurn(parity*90)(turtle);
    turtle=HilbertCurve(size,level-1,parity)(field,turtle);
    turtle=t.forward(size)(turtle);
    turtle=HilbertCurve(size,level-1,parity)(field,turtle);
    turtle=t.rightTurn(parity*90)(turtle);
    turtle=t.forward(size)(turtle);
    turtle=HilbertCurve(size,level-1,-parity)(field,turtle);
    turtle=t.leftTurn(parity*90)(turtle);
    return turtle;
  });

  
  return {
    cCurve: cCurve,
    cornerPoly: cornerPoly,
    cornerTriangle: cornerTriangle,
    equiangularSpiral: equiangularSpiral,
    HilbertCurve: HilbertCurve,
    leftDragon: leftDragon,
    nestedTriangle: nestedTriangle,
    outwardTriangle: outwardTriangle,
    snowflake: snowflake
  };
      
})();
