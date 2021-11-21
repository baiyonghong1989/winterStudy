import { Component, STATE, ATTRIBUTE } from './frameWork.js';
import { enableGesture } from './gesture.js';
import { Timeline, Animation } from './animation.js';
import { ease } from './ease.js';
export { STATE, ATTRIBUTE } from './frameWork.js';
export class Carousel extends Component {
  constructor() {
    super();
    this[STATE].position = 0;
  }

  // 手动拖拽及自动播放支持
  setManualAndAuto() {
    enableGesture(this.root);
    let timeLine = new Timeline();
    timeLine.start();
    let childrens = this.root.children;
    let hanlder = null;
    let autoStart = 0;
    let autoX = 0;
    this.root.addEventListener('start', (event) => {
      timeLine.pause();
      clearInterval(hanlder);
      let progress = (Date.now() - autoStart) / 500;
      autoX = ease(progress) * 500 - 500;
    });
    this.root.addEventListener('pan', (event) => {
      let x = event.clientX - event.startX - autoX;
      let current = this[STATE].position - (x - (x % 500)) / 500;
      for (let offset of [-1, 0, 1]) {
        let pos = current + offset;
        pos = ((pos % childrens.length) + childrens.length) % childrens.length;
        childrens[pos].style.transition = 'none';
        childrens[pos].style.transform = `translateX(${-pos * 500 + offset * 500 + (x % 500)}px)`;
      }
    });
    this.root.addEventListener('tap', (event) => {
      this.triggerEvent('click', {
        position: this[STATE].position,
        src: this[ATTRIBUTE].src[this[STATE].position],
      });
    });
    this.root.addEventListener('end', (event) => {
      timeLine.reset();
      timeLine.start();
      hanlder = setInterval(nextPicture, 3000);
      let x = event.clientX - event.startX - autoX;
      let current = this[STATE].position - (x - (x % 500)) / 500;
      let direction = Math.round((x % 500) / 500);
      if (event.isFlick) {
        if (event.velocity < 0) {
          direction = Math.ceil((x % 500) / 500);
        } else {
          direction = Math.floor((x % 500) / 500);
        }
      }
      for (let offset of [0, -1, 1]) {
        let pos = current + offset;
        pos = ((pos % childrens.length) + childrens.length) % childrens.length;
        childrens[pos].style.transition = 'none';
        timeLine.add(
          new Animation(
            childrens[pos].style,
            'transform',
            -pos * 500 + offset * 500 + (x % 500),
            -pos * 500 + offset * 500 + direction * 500,
            500,
            0,
            ease,
            (v) => `translateX(${v}px)`,
          ),
        );
      }

      this[STATE].position = this[STATE].position - (x - (x % 500)) / 500 - direction;
      this[STATE].position = ((this[STATE].position % childrens.length) + childrens.length) % childrens.length;
      this.triggerEvent('change', {
        position: this[STATE].position,
      });
    });

    // 自动轮播
    let nextPicture = () => {
      autoStart = Date.now();
      let nextIndex = (this[STATE].position + 1) % childrens.length;
      let current = childrens[this[STATE].position];
      let next = childrens[nextIndex];
      next.style.ref = next;
      current.style.ref = current;
      timeLine.add(
        new Animation(
          current.style,
          'transform',
          -this[STATE].position * 500,
          -this[STATE].position * 500 - 500,
          500,
          0,
          ease,
          (v) => `translateX(${v}px)`,
        ),
      );
      timeLine.add(
        new Animation(
          next.style,
          'transform',
          -nextIndex * 500 + 500,
          -nextIndex * 500,
          500,
          0,
          ease,
          (v) => `translateX(${v}px)`,
        ),
      );
      this[STATE].position = nextIndex;
      this.triggerEvent('change', {
        position: this[STATE].position,
      });
    };
    hanlder = setInterval(nextPicture, 3000);
  }

  render() {
    this.root = document.createElement('div');
    this.root.classList.add('carousel');
    for (let img of this[ATTRIBUTE].src || []) {
      let child = document.createElement('img');
      child.src = img;
      child.setAttribute('draggable', false);

      this.root.appendChild(child);
    }
    this.setManualAndAuto();
    return this.root;
  }
}
