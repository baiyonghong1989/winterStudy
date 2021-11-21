import { createElement } from './frameWork.js';
import { Carousel } from './Carousel.js';
import { Button } from './Button.js';
import { List } from './List.js';
let imgList = [
  'https://developer.huawei.com/images/home/bbbs.jpg',
  'https://developer.huawei.com/images/new-content/home/new-1-x.jpg',
  'https://developer.huawei.com/images/new-content/home/zixun-4.jpg',
  'https://developer.huawei.com/images/new-content/home/new-maoxiaozhi.jpg',
  'https://developer.huawei.com/images/new-content/home/new-ar.jpg',
];

// let carousel = <Carousel src={imgList} onChange={event=>console.log(event.detail.position)} onClick={event=>console.log(event)} />;
// carousel.mountTo(document.body);

// let button = <Button>main</Button>;
// button.mountTo(document.body);

let list = (
  <List data={imgList}>
    {(record) => (
      <div>
        <img src={record}></img>
      </div>
    )}
  </List>
);
list.mountTo(document.body);
