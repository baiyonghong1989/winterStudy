import {createElement } from './frameWork.js';
import {ease} from './ease.js'
import {Timeline,Animation} from './animation.js';
let t1 = new Timeline();
t1.add(new Animation(document.querySelector('#container').style,'transform',0,500,4000,null,ease,(val)=>`translateX(${val}px)`));
document.querySelector('#start').addEventListener('click',()=>{
  t1.start();
})

document.querySelector('#pause').addEventListener('click',()=>{
  t1.pause();
})

document.querySelector('#resume').addEventListener('click',()=>{
  t1.resume();
})
