import { linear } from './ease.js';
const TICK = Symbol('tick');
const START_TIME = Symbol('start-time');
const ANIMATIONS = Symbol('animations');
const TICK_HANDLER = Symbol('tick-handler');
const PAUSE_START = Symbol('pause-start');
const PAUSE_TIME = Symbol('pause-time');
const STATE = {
  INIT:'INIT',
  START:'START',
  PAUSE:'PAUSE',
}
export class Timeline {
  constructor() {
    this.state = STATE.INIT;
    this[ANIMATIONS] = new Set();
    this[START_TIME] = new Map();
  }
  start() {
    if (this.state !== STATE.INIT){
      return ;
    }
    this.state = STATE.START;
    let startTime = Date.now();
    this[PAUSE_TIME] = 0;
    this[TICK] = () => {
      let tickStart = Date.now();
      for (let animation of this[ANIMATIONS]) {
        let t;
        if (this[START_TIME].get(animation) < startTime) {
          t = tickStart - startTime - this[PAUSE_TIME];
        } else {
          t = tickStart - this[START_TIME].get(animation) - this[PAUSE_TIME];
        }
        if (animation.duration < t) {
          this[ANIMATIONS].delete(animation);
          t = animation.duration;
        }
        if (t > 0) {
          animation.recevie(t);
        }
      }
      this[TICK_HANDLER] = requestAnimationFrame(this[TICK]);
    };
    this[TICK]();
  }
  pause() {
    if (this.state !== STATE.START){
      return ;
    }
    this.state = STATE.PAUSE;
    this[PAUSE_START] = Date.now();
    cancelAnimationFrame(this[TICK_HANDLER]);
  }
  resume() {
    if (this.state !== STATE.PAUSE){
      return ;
    }
    this.state = STATE.INIT;
    this[PAUSE_TIME] = this[PAUSE_TIME] + Date.now() - this[PAUSE_START];
    this[TICK]();
  }
  reset() {
    this.pause();
    this[PAUSE_TIME] = 0;
    this[ANIMATIONS] = new Set();
    this[START_TIME] = new Map();
    this[PAUSE_START] = 0;
    this[TICK_HANDLER] = null;
    this.state = STATE.INIT;
  }
  add(animation) {
    this[ANIMATIONS].add(animation);
    this[START_TIME].set(animation, animation.startTime || Date.now());
  }
}
export class Animation {
  constructor(object, property, startValue, endValue, duration, delay, timingFunction, templateFun, startTime) {
    this.object = object;
    this.property = property;
    this.startValue = startValue;
    this.endValue = endValue;
    this.duration = duration;
    this.timingFunction = timingFunction || linear;
    this.delay = delay;
    this.startTime = startTime || Date.now();
    this.templateFun = templateFun;
  }
  recevie(time) {
    let range = this.endValue - this.startValue;
    let currentValue = range * this.timingFunction(time / this.duration);
    this.object[this.property] = this.templateFun(this.startValue + currentValue);
  }
}
