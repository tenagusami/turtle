'use strict';
module.exports = (()=> {
    const U=require('./utility.js');
    const R=require('ramda');
    const C=require('./coordinate.js');
    const t=require('./turtle.js');
    const math=require('mathjs');

    const forever=t.forever;
    
    const forward=R.curry((length,[field,turtle])=>{
	return [field,t.forward(length)(turtle)];
    });

    const forwardWithoutDraw=R.curry((length,[field,turtle])=>{
	return [field,t.forwardWithoutDraw(length)(turtle)];
    });

    const shift=R.curry((shiftVector,[field,turtle])=>{
	return [field,t.shiftPosition(shiftVector)(turtle)];
    });
    
    const leftTurn=R.curry((dDirection,[field,turtle])=>{
	return [field,t.leftTurn(dDirection)(turtle)];
    });

    const rightTurn=R.curry((dDirection,[field,turtle])=>{
	return [field,t.rightTurn(dDirection)(turtle)];
    });

    const setDirection=R.curry((direction,[field,turtle])=>{
	return [field,t.setDirection(direction)(turtle)];
    });
    
    const repeat=R.curry((dispatcherList,times,[field,turtle])=>{
	return [field,U.intList(times).reduce(
	    (ft1,index)=>{
		return dispatcherList.reduce(
		    (ft2,dispatcher)=>{return dispatcher(ft2);},ft1);
	    },[field,turtle])];	
    });

    const repeatUntil=R.curry((dispatcherList,predicate,ft)=>{
	do {
	    ft=dispatcherList.reduce(
		(ft1,dispatcher)=>{return dispatcher(ft1);},ft);
	} while (!predicate(ft));
	return ft;
    });
    
    const repeatForever=R.curry((dispatcherList,[field,turtle])=>{
	return repeat(dispatcherList,t.forever,[field,turtle]);
    });
    
    const poly=R.curry((side,dDirection,[field,turtle])=>{
	return repeatForever([forward(side),rightTurn(dDirection)])
	([field,turtle]);
    });

    const vector=R.curry((direction,length)=>{
	return R.pipe(setDirection(direction),forward(length));
    });

    const duopoly=R.curry(
	(side1,direction1,side2,direction2)=>{
	    let time=0;
	    const incrementTime=([field,turtle])=>{time+=1;return [field,turtle];};
	    return repeatForever([
		([field,turtle])=>{
		    [field,turtle]=vector(
			C.multiplyDirection(time,direction1),side1)([field,turtle]);
		    [field,turtle]=vector(
			C.multiplyDirection(time,direction2),side2)([field,turtle]);
		    return [field,turtle];
		},incrementTime]);
	});

    const multipoly=(sideDirectionList)=>{
	let time=0;
	const incrementTime=([field,turtle])=>{time+=1;return [field,turtle];};
	return repeatForever([([field,turtle])=>{
	    return sideDirectionList.reduce(
		([reducedField,reducedTurtle],sideDirection)=>{
		    return vector(
			C.multiplyDirection(time,sideDirection[1]),sideDirection[0])
		    ([reducedField,reducedTurtle]);
		},[field,turtle]);
	},incrementTime]);
    };

    const gspiro=R.curry((side,direction,max,rightTurnList)=>{
	const subGspiro=(count)=>{
	    if(count===max){return R.identity;}
	    let turn=undefined;
	    if(count===rightTurnList.find(
		(element,index,array)=>{
		    if(element===count){return element;}
		    return false;
		})){
		turn=leftTurn;
	    }else{
		turn=rightTurn;
	    }
	    return R.pipe(forward(side*count),turn(direction),subGspiro(count+1));
	};
	return repeatForever([subGspiro(1)]);
    });

    const gospel=R.curry((side,direction)=>{
	const gospelIter=R.curry((direction,times)=>{
	    if(times===0){return R.identity;}
	    return R.pipe(leftTurn(direction),forward(side),
			  gospelIter(C.multiplyDirection(2)(direction),times-1));
	});
	return gospelIter(direction,100);
    });

    const scalarMultiple=R.curry((scalar,vector)=>{
	return vector.map(R.multiply(scalar));
    });

    const rotate=R.curry((direction,vector)=>{
	return C.addVector(
	    scalarMultiple(math.cos(direction[0]),vector),
	    scalarMultiple(math.sin(direction[0]),C.perpendicular(vector)));
    });
    
    return {
	duopoly: duopoly,
	forever: forever,
	forward: forward,
	forwardWithoutDraw: forwardWithoutDraw,
	gospel: gospel,
	gspiro: gspiro,
	leftTurn: leftTurn,
	multipoly: multipoly,
	poly: poly,
	repeat: repeat,
	repeatForever: repeatForever,
	repeatUntil: repeatUntil,
	rightTurn: rightTurn,
	shift: shift,
	vector: vector
    };
    
})();
