'use strict';

module.exports = (()=>{
  const R=require('ramda');
  const C=require('./coordinate.js');
  
  const makeField=R.curry((xAbsMax,yAbsMax)=>{
    return {
      xAbsMax: xAbsMax,
      yAbsMax: yAbsMax
    };
  });

  const isOutOfBounds=R.curry((field,coordinate)=>{
    return Math.abs(coordinate[0])>field.xAbsMax
      || Math.abs(coordinate[1])>field.xAbsMax;
  });

  const isMovablePosition=R.curry((field,coordinate)=>{
    return !isOutOfBounds(field,coordinate);
  });

  const isMovable=R.curry((field,position,distance,direction)=>{
    return isMovablePosition(
      field,
      C.addPosition(position,C.shiftVector(distance,direction)));
  });
  
  return {
    makeField: makeField,
    isMovable: isMovable,
    isMovablePosition: isMovablePosition
  };
})();
