'use strict';

module.exports = (()=> {
  const U=require('./utility.js');
  const R=require('ramda');
  const C=require('./coordinate.js');
  const v=require('./vector.js');

  const testFixProjection=(vertices)=>{
    const verticeCoordinates=
	  vertices.map((vertex)=>{return vertex.coord3D;});
    const [dummy1,dummy2,length]=verticeCoordinates[1];
    const lenHalf=length*0.5;
    const lenSq3=lenHalf*Math.sqrt(3);
    return [
      {coord2D: [-lenSq3,-lenHalf]},
      {coord2D: [-lenSq3,lenHalf]},
      {coord2D: [0,0]},
      {coord2D: [0,-length]},
      {coord2D: [0,0]},
      {coord2D: [0,length]},
      {coord2D: [lenSq3,lenHalf]},
      {coord2D: [lenSq3,-lenHalf]}
    ];
  };
  
  const longLatParallelProjection=R.curry(
    (longitude,latitude,vertices)=>{
      const projector=coord3D2Projected2D(longitude,latitude);
      return vertices.map((vertex)=>{
	return {coord2D: projector(vertex.coord3D)};
      });
    });

  
  const coord3D2Projected2D=R.curry((longitude,latitude)=>{
    return (vector3D)=>{
      const vector2D1=[vector3D[0],vector3D[1]];
      const vector2D2=v.rotate(-longitude,vector2D1);
      const vector3D2=[vector2D2[0],vector2D2[1],vector3D[2]];
      const vector2D3=[vector3D2[1],vector3D2[2]];
      const vector2D4=v.rotate(-latitude,vector2D3);
      return [vector3D2[0],vector2D4[0],vector2D4[1]];
    };
  });

  //const vertice3Dto2D=testFixProjection;
  const vertice3Dto2D=longLatParallelProjection;
  

  return {
    vertice3Dto2D: vertice3Dto2D
  };
  
})();
