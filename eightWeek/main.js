import { Component } from './frameWork';
class Carousel extends Component {
  constructor() {
    super();
    this.attributes = new Object();
  }
  setAttribute(name, value) {
    this.attributes[name] = value;
  }

  // 手动拖拽支持
  setManualDrag() {
    let childrens = this.root.children;
    let position = 0;
    this.root.addEventListener('mousedown', (event) => {
      let startX = event.clientX;
      let move = (event) => {
        let x = event.clientX - startX;
        let current = position - (x - (x % 500)) / 500;
        for (let offset of [-1, 0, 1]) {
          let pos = current + offset;
          pos = (pos + childrens.length) % childrens.length;
          childrens[pos].style.transition = 'none';
          childrens[pos].style.transform = `translateX(${-pos * 500 + offset * 500 + (x % 500)}px)`;
        }
      };
      let up = (event) => {
        let x = event.clientX - startX;
        position = position - Math.round(x / 500);
        for (let offset of [0, -Math.sign(Math.round(x / 500) - x + 250 * Math.sign(x))]) {
          let pos = position + offset;
          pos = (pos + childrens.length) % childrens.length;
          childrens[pos].style.transition = '';
          childrens[pos].style.transform = `translateX(${-pos * 500 + offset * 500}px)`;
        }
        document.removeEventListener('mousemove', move);
        document.removeEventListener('mouseup', up);
      };
      document.addEventListener('mousemove', move);
      document.addEventListener('mouseup', up);
    });
  }
  // 自动轮播
  setAutoRound() {
    let childrens = this.root.children;
    let currentIndex = 0;
    setInterval(() => {
      let nextIndex = (currentIndex + 1) % childrens.length;
      let current = childrens[currentIndex];
      let next = childrens[nextIndex];
      next.style.transition = 'none';
      next.style.transform = `translateX(${100 - 100 * nextIndex}%)`;
      setTimeout(() => {
        next.style.transition = '';
        current.style.transform = `translateX(${-nextIndex * 100}%)`;
        next.hidden = false;
        next.style.transform = `translateX(${-nextIndex * 100}%)`;
        currentIndex = nextIndex;
      });
    }, 3000);
  }
  render() {
    this.root = document.createElement('div');
    this.root.classList.add('carousel');
    for (let img of this.attributes.src || []) {
      let child = document.createElement('img');
      child.src = img;
      child.setAttribute('draggable', false);
      this.root.appendChild(child);
    }
    // this.setAutoRound();
    this.setManualDrag();
    return this.root;
  }
  mountTo(parent) {
    parent.appendChild(this.render());
  }
}
let imgList = [
  'https://developer.huawei.com/images/home/bbbs.jpg',
  'https://developer.huawei.com/images/new-content/home/new-1-x.jpg',
  'https://developer.huawei.com/images/new-content/home/zixun-4.jpg',
  'https://developer.huawei.com/images/new-content/home/new-maoxiaozhi.jpg',
  'https://developer.huawei.com/images/new-content/home/new-ar.jpg',
];
let carousel = <Carousel src={imgList} />;
console.log(123);
carousel.mountTo(document.body);
