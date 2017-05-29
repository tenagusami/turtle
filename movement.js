'use strict';

module.exports = (()=>{
  const U=require('./utility.js');
  const R=require('ramda');
  const t=require('./turtle.js');
  const math=require('mathjs');
  const f=require('./field.js');
  const C=require('./coordinate.js');
  const a=require('./animalTurtle.js');
  const rec=require('./recursiveDesign.js');
  const v=require('./vector.js');
  const tp=require('./topology.js');
  const りっぽうたい=require('./cube.js');
  const sp=require('./sphere.js');
  
  const poly=R.curry((side,direction)=>{
    return v.repeat([v.forward(side),v.rightTurn(direction)],10);
  });

  const newPoly=R.curry((side,direction)=>{
    return v.repeat([v.forward(side),
		     v.rightTurn(direction),
		     v.forward(side),
		     v.rightTurn(direction*2)],10);
  });

  const polySpiral=R.curry((side,direction,increment)=>{
    const polySpiralIter=R.curry((side,direction,increment,depth)=>{
      if(depth===0){return R.identity;}
      return R.pipe(
	v.forward(side),v.rightTurn(direction),
	polySpiralIter(side+increment,direction,increment,depth-1));
      
    });
    return polySpiralIter(side,direction,increment,1000);
  });
  
  const inwardSpiral=R.curry((side,direction,increment)=>{
    const inwardSpiralIter=R.curry((direction,depth)=>{
      if(depth===0){return R.identity;}
      return R.pipe(
	v.forward(side),v.rightTurn(direction),
	inwardSpiralIter(direction+increment,depth-1));
      
    });
    return inwardSpiralIter(direction,1000);
  });

  const spiro=R.curry((side,direction,max)=>{
    const subspiro=R.curry((side,direction,max,count)=>{
      if(count>max){return R.identity;}
      return R.pipe(v.forward(side*count),v.rightTurn(direction),
		    subspiro(side,direction,max,count+1));
    });
    return v.repeat([subspiro(side,direction,max,1)],1000);
  });

  const gspiro=R.curry((side,direction,max,list)=>{
    const subgspiro=R.curry((side,direction,max,count)=>{
      if(count>max){return R.identity;}
      let turn=undefined;
      if(count===list.find(
	(element,index,array)=>{
	  if(element===count){return element;}
	  return false;
	})){
	turn=v.leftTurn;
      }else{
	turn=v.rightTurn;
      }	
      return R.pipe(v.forward(side*count),turn(direction),
		    subgspiro(side,direction,max,count+1));
    });
    return v.repeat([subgspiro(side,direction,max,1)],1000);
  });
  
  const genGspiro=()=>{
    const r=2;
    const n=5;
    return gspiro(10,360*257/7,11,[3,4,6,7]);
  };

  const randomMove=R.curry(
    (distanceMin,distanceMax,directionMin,directionMax,ft)=>{
      const randomMoveIter=R.curry(
	(randomD,randomA,count,ft)=>{
	  if(count==0){return ft;}
	  return randomMoveIter(
	    U.randomR(distanceMin,distanceMax),
	    U.randomR(directionMin,directionMax),
	    count-1,
	    R.pipe(checkForward(randomD),v.leftTurn(randomA))(ft));
	});
      return randomMoveIter(
	U.randomR(distanceMin,distanceMax),
	U.randomR(directionMin,directionMax),
	1000)(ft);
    });

  const checkForward=R.curry((distance,[field,turtle])=>{
    if(f.isMovable(
      field,t.getPosition(turtle),distance,t.getDirection(turtle))){
      return v.forward(distance,[field,turtle]);
    }
    //return [field,turtle];
    return v.rightTurn(180)([field,turtle]);
    //return wriggle(distance,[field,turtle]);
  });

  const wriggle=R.curry((distance,[field,turtle])=>{
    if(f.isMovable(field,t.getPosition(turtle),
		   distance,t.getDirection(turtle))){
      return [field,turtle];
    }
    return wriggle(
      distance,
      R.pipe(v.rightTurn(1),v.forward(1))([field,turtle]));
  });

  const scaledForward=R.curry((scale,distance)=>{
    return v.forward(scale*distance);});
  
  const growScale=R.multiply;

  //const moveTurtle=poly(100,144);
  //const moveTurtle=newPoly(50,144);
  //const moveTurtle=polySpiral(100,95,1);
  //const moveTurtle=inwardSpiral(20,0,7);
  //const moveTurtle=spiro(10,60,10);
  //const moveTurtle=genGspiro();
  const moveTurtle=randomMove(0,10,-10,10);
  //const moveTurtle=a.findBySmell2([30]);
  //const moveTurtle=a.findBySmell3([60],120);
  //const moveTurtle=a.varyingStep(1000,[10]);
  //const moveTurtle=a.varyingDirection(1,[300]);
  //const moveTurtle=a.keepABearing([100,100],[60]);
  //const moveTurtle=a.headFor([100,100]);
  //const moveTurtle=a.findBySight([100,100],10);
  //const moveTurtle=a.findBySight2([100,100],[-100,100],1000,0.001);
  //const moveTurtle=a.spiralGrowth(1,1,1.5,[90],[90]);
  //const moveTurtle=rec.equiangularSpiral(0.01,[10],1.01);
  //const moveTurtle=a.branch(100,10);
  //const moveTurtle=a.node(10,[20],10);
  //const moveTurtle=rec.nestedTriangle(500);
  //const moveTurtle=rec.cornerTriangle(200);
  //const moveTurtle=rec.outwardTriangle(200);
  //const moveTurtle=rec.cornerPoly(100,C.makeDirection(60),0);
  //const moveTurtle=rec.snowflake(200,5);
  //const moveTurtle=rec.cCurve(5,10);
  //const moveTurtle=rec.leftDragon(3,13);
  //const moveTurtle=rec.HilbertCurve(8,5,1);
  //const moveTurtle=v.poly(100,[120]);
  //const moveTurtle=v.vector([0],100);
  //const moveTurtle=v.duopoly(10,[32],6,[4]);
  //const moveTurtle=v.multipoly([[5,[7]],[5,[-8]],[5,[9]],[5,[-10]]]);
  //const moveTurtle=v.gspiro(10,[90],9,[4]);
  //const moveTurtle=v.gospel(100,[40]);
  //const moveTurtle=tp.scissor(100,40);
  //const moveTurtle=tp.scissorPoly(100,80,100);
  //const makeFrame=poly(200,[90]);
  //const moveTurtle=cu.cubeForward(5000);
//  const moveTurtle=cu.poly(250,0,-144);
  //const moveTurtle=cu.poly(200,20,90);
  //const moveTurtle=cu.poly(2,0,-1);
  //const うごかす=りっぽうたい.一へんけい(50,math.atan(11)*C.rad2Deg);
//  const moveTurtle=R.pipe(sp.leftTurn(45),sp.forward(180));
  
  const move2Turtles=a.predatorPrey;
  
  
  const turtleGraphics=(draw,field)=>{
    //for a turtle on a plane
    //return moveTurtle(field)(t.newTurtle(draw('#00f')));
    return moveTurtle([field,t.newTurtle(draw('#00f'))]);

    //for 2 turtles on a plane
    //let predator=t.newTurtle(draw('#00f'));
    //let prey=t.newTurtle(draw('#f00'),[100,0]);
    //return move2Turtles(field,predator,prey);

    //for a turtle on a cube 
    //let frameResult=makeFrame(field)(t.newTurtle(draw('#00f')));
    //const 見るほうこうのいどけいど=[-70,80];
    //const へんのながさ=200;
    //const はじめのばしょ=[150,150];
    //const いろ1='#00f';
    //const いろ2='#0ff';
   // りっぽうたい.あたらしいさいころをdraw(
     // へんのながさ,見るほうこうのいどけいど,draw(いろ2));
    //const めんとかめ=うごかす(
    //  りっぽうたい.あたらしいめんとかめをつくる(
//	へんのながさ,はじめのばしょ,見るほうこうのいどけいど,draw(いろ1)));
    //return めんとかめ;

    //for a turtle on a sphere
    /*const viewLongitudeLatitude=[0,-10];
    const radius=200;
    sp.drawSphericalFrame(radius,viewLongitudeLatitude,draw('#0ff'));
    const ft=moveTurtle(
      sp.makeNewFieldTurtle(
	radius,viewLongitudeLatitude,draw('#00f')));
    return ft;*/

    
  };

  
  return {turtleGraphics: turtleGraphics};
})();
