import {createElement } from './frameWork';
import {Carousel} from './carousel';
import {Timeline,Animation} from './animation';
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

let t1 = new Timeline();
t1.start();
t1.add(new Animation({},'a',0,100,1000,null));
