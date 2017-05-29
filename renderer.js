'use strict';
const R=require('ramda');

// 各要素を保持
const clearCanvasButton = document.querySelector('#clear-canvas');
const saveCanvasButton = document.querySelector('#save-canvas');
const myCanvas = document.querySelector('#my-canvas');

// <canvas>のレンダリングコンテキストを保持
const ctx = myCanvas.getContext('2d');

// <canvas>の描画設定
const backgroundColor = '#ffffee';
const lineColor = '#00f';
const lineWidth = 1;

// <canvas>の背景を塗りつぶし
clearCanvas();

// <canvas>の描画処理の変数
let drawing = false;
let startPoint = {x: 0, y: 0};
let offset={x: myCanvas.width*0.5, y:myCanvas.height*0.5};

function clearCanvas () {
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, myCanvas.width, myCanvas.height);
}

function getPointOnCanvas (event) {
  const x = event.pageX - myCanvas.offsetLeft;
  const y = event.pageY - myCanvas.offsetTop;
  return {x, y};
}

/*clearCanvasButton.addEventListener('click', clearCanvas, false);

myCanvas.addEventListener('mousedown', (event) => {
  event.preventDefault();
  drawing = true;
  startPoint = getPointOnCanvas(event);
}, false);

myCanvas.addEventListener('mouseup', (event) => {
  event.preventDefault();
  drawing = false;
}, false);

myCanvas.addEventListener('mousemove', (event) => {
  if (!drawing) return;
  event.preventDefault();
  
  const endPoint = getPointOnCanvas(event);
  
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.moveTo(startPoint.x, startPoint.y);
  ctx.lineTo(endPoint.x, endPoint.y);
  ctx.stroke();

  startPoint = endPoint;
}, false);
 */

const drawer=R.curry((color,startCoordinate, endCoordinate)=>{
  window.setTimeout(()=>{
    const startPoint = { x:startCoordinate[0]+offset.x,
		       y:-startCoordinate[1]+offset.y};
    const endPoint = { x:endCoordinate[0]+offset.x,
		     y:-endCoordinate[1]+offset.y};
    drawing=true;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.stroke();
    drawing=false;
  },0);
});


const T=require('./movement.js');
const f=require('./field.js');
T.turtleGraphics(drawer,f.makeField(offset.x, offset.y));
