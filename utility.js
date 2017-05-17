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
  
  return {
    copyVector: copyVector,
    intList:intList,
    randomR: randomR,
    rMathModulo: rMathModulo
  };
})();
