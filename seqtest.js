const U=require('./utility.js');
const R=require('ramda');

const f0=(x)=>{return x;};
const f1=(x)=>{return x+1;};
const f2=(x)=>{return x+2;};
const f3=(x)=>{return x+3;};
const nIteration=100;
//const fgarray=[f0,f1,f2,f3];
const fgarray=U.intList(nIteration).fill(f1);

const reduceGenerator=R.curry(function* (functionArray,seed){
  let reduced=seed;
  let reducedOld=reduced;
  for(f of functionArray){
    reducedOld=reduced;
    reduced=f(reducedOld);
    yield reduced;
   }
});

var gen = reduceGenerator(fgarray)(0);
for(i of U.intList(nIteration+1)){
  let nex=gen.next();
  if(nex.done){break;}
  console.log(nex);
}

//for(var v of gen){
//    console.log(v);
//}
/*while (true){
    let nex=gen.next();
    if(!nex.done){break;}
    console.log(nex.value);
}*/
