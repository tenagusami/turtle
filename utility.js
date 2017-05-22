module.exports = (()=>{
  const R=require('ramda');
  const math=require('mathjs');
  const MersenneTwister = require('mersenne-twister');

  let generator = new MersenneTwister();
  
  const intList=R.range(0);

  const copyVector=(vector)=>{
    return [].concat(vector);
  };

  const randomR=(min,max)=>{
    return min+generator.random()*(max-min);
  };

  const rMathModulo = R.curry((modulus,dividend)=>{
    return dividend-modulus*math.floor(dividend/modulus);
  });

    const isOnInterval= R.curry((intervalMin,intervalMax,x)=>{
	return x>=intervalMin && x<=intervalMax;
    });

  return {
    copyVector: copyVector,
      intList:intList,
      isOnInterval: isOnInterval,
    randomR: randomR,
    rMathModulo: rMathModulo
  };
   
})();
