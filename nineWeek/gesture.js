let ele = document.documentElement;
let contexts = new Map();
let isListeningMouse = false;
ele.addEventListener('mousedown', (event) => {
  let context = Object.create(null);
  contexts.set('mouse_' + (1 << event.button), context);
  start(event, context);
  let mousemove = (event) => {
    let button = 1;
    while (button <= event.buttons) {
      if (button & event.buttons){
        // button的顺序跟mousedown的不一致，需要调整
        let key;
        if (button === 2) {
          key = 4;
        } else if (button === 4){
          key = 2
        } else {
          key = button;
        }
        let context = contexts.get('mouse_' + key);
        move(event, context);
      }
      button = button << 1;
    }
    move(event, context);
  };
  let mouseup = (event) => {
    end(event, contexts.get('mouse_' + (1 << event.button)));
    contexts.delete('mouse_' + (1 << event.button))
    if (event.buttons === 0){
      document.removeEventListener('mousemove', mousemove);
      document.removeEventListener('mouseup', mouseup);
      isListeningMouse = false;
    }

  };
  if (!isListeningMouse){
    document.addEventListener('mousemove', mousemove);
    document.addEventListener('mouseup', mouseup);
    isListeningMouse = true;
  }
});
ele.addEventListener('touchstart', (event) => {
  for (let touch of event.changedTouches) {
    let context = Object.create(null);
    contexts.set(touch.identifier, context);
    start(touch, context);
  }
});
ele.addEventListener('touchmove', (event) => {
  for (let touch of event.changedTouches) {
    move(touch, contexts.get(touch.identifier));
  }
});
ele.addEventListener('touchend', (event) => {
  for (let touch of event.changedTouches) {
    end(touch, contexts.get(touch.identifier));
    contexts.delete(touch.identifier);
  }
});
ele.addEventListener('touchcancel', (event) => {
  for (let touch of event.changedTouches) {
    cancel(touch, contexts.get(touch.identifier));
    contexts.delete(touch.identifier);
  }
});

let start = (point, context) => {
  context.isPan = false; //点击后移动，pan摄影术语，缓慢的触点推移。
  context.isPress = false; //长点击
  context.isTab = true; // 轻点

  (context.startX = point.clientX), (context.startY = point.clientY);

  context.handler = setTimeout(() => {
    context.isPan = false;
    context.isPress = true;
    context.isTab = false;
    // console.log('press');
    context.handler = null;
  }, 500);
};

let move = (point, context) => {
  let dx = point.clientX - context.startX,
    dy = point.clientY - context.startY;
  if (dx ** 2 + dy ** 2 > 100) {
    context.isPan = true;
    context.isPress = false;
    context.isTab = false;
    clearTimeout(context.handler);
    console.log('pan move');
  }
};

let end = (point, context) => {
  if (context.isTab) {
    dispatch('tap',{})
    clearTimeout(context.handler);
  }
  if (context.isPan) {
    console.log('pan End');
  }
  if (context.isPress) {
    console.log('press end');
  }
};

let cancel = (point, context) => {
  clearTimeout(context.handler);
  console.log('cancel');
};


function dispatch(type,properties,point){
  let event = new Event(type);
  for(let name in properties){
    event[name] = properties[name];
  }
  ele.dispatchEvent(event);
}
