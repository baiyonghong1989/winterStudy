export class Listener {
  constructor(ele, recognizer) {
    let contexts = new Map();
    let isListeningMouse = false;
    ele.addEventListener('mousedown', (event) => {
      let context = Object.create(null);
      contexts.set('mouse_' + (1 << event.button), context);
      recognizer.start(event, context);
      let mousemove = (event) => {
        let button = 1;
        while (button <= event.buttons) {
          if (button & event.buttons) {
            // button的顺序跟mousedown的不一致，需要调整
            let key;
            if (button === 2) {
              key = 4;
            } else if (button === 4) {
              key = 2;
            } else {
              key = button;
            }
            let context = contexts.get('mouse_' + key);
            recognizer.move(event, context);
          }
          button = button << 1;
        }
      };
      let mouseup = (event) => {
        recognizer.end(event, contexts.get('mouse_' + (1 << event.button)));
        contexts.delete('mouse_' + (1 << event.button));
        if (event.buttons === 0) {
          document.removeEventListener('mousemove', mousemove);
          document.removeEventListener('mouseup', mouseup);
          isListeningMouse = false;
        }
      };
      if (!isListeningMouse) {
        document.addEventListener('mousemove', mousemove);
        document.addEventListener('mouseup', mouseup);
        isListeningMouse = true;
      }
    });
    ele.addEventListener('touchstart', (event) => {
      for (let touch of event.changedTouches) {
        let context = Object.create(null);
        contexts.set(touch.identifier, context);
        recognizer.start(touch, context);
      }
    });
    ele.addEventListener('touchmove', (event) => {
      for (let touch of event.changedTouches) {
        recognizer.move(touch, contexts.get(touch.identifier));
      }
    });
    ele.addEventListener('touchend', (event) => {
      for (let touch of event.changedTouches) {
        recognizer.end(touch, contexts.get(touch.identifier));
        contexts.delete(touch.identifier);
      }
    });
    ele.addEventListener('touchcancel', (event) => {
      for (let touch of event.changedTouches) {
        recognizer.cancel(touch, contexts.get(touch.identifier));
        contexts.delete(touch.identifier);
      }
    });
  }
}

export class Recognizer {
  constructor(dispatcher) {
    this.dispatcher = dispatcher;
  }
  start(point, context) {
    this.dispatcher.dispatch('start', { clientX: point.clientX, clientY: point.clientY });
    context.points = [
      {
        t: Date.now(),
        x: point.clientX,
        y: point.clientY,
      },
    ];
    context.isPan = false; //点击后移动，pan摄影术语，缓慢的触点推移。
    context.isPress = false; //长点击
    context.isTab = true; // 轻点

    (context.startX = point.clientX), (context.startY = point.clientY);

    context.handler = setTimeout(() => {
      context.isPan = false;
      context.isPress = true;
      context.isTab = false;
      context.handler = null;
    }, 500);
  }

  move(point, context) {
    let dx = point.clientX - context.startX,
      dy = point.clientY - context.startY;
    if (dx ** 2 + dy ** 2 > 100) {
      context.isPan = true;
      context.isPress = false;
      context.isTab = false;
      context.isVertical = Math.abs(dx) < Math.abs(dy);
      clearTimeout(context.handler);
      this.dispatcher.dispatch('pan', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
      });
    }

    context.points = context.points.filter((point) => Date.now() - point.t < 500);
    context.points.push({
      t: Date.now(),
      x: point.clientX,
      y: point.clientY,
    });
  }

  end(point, context) {
    if (context.isPress) {
      this.dispatcher.dispatch('pressEnd', {});
    }
    context.points = context.points.filter((point) => Date.now() - point.t < 500);
    let speed = 0;
    if (context.points.length > 0) {
      let distance = Math.sqrt((point.clientX - context.points[0].x) ** 2 + (point.clientY - context.points[0].y) ** 2);
      speed = distance / (Date.now() - context.points[0].t);
    }
    if (speed > 1.5) {
      context.isFlick = true;
    }
    if (context.isTab) {
      this.dispatcher.dispatch('tap', {});
      clearTimeout(context.handler);
    }
    if (context.isPan) {
      this.dispatcher.dispatch('panEnd', {
        startX: context.startX,
        startY: context.startY,
        clientX: point.clientX,
        clientY: point.clientY,
        isVertical: context.isVertical,
        isFlick: context.isFlick,
        velocity:speed
      });
    }
    this.dispatcher.dispatch('end', {
      startX: context.startX,
      startY: context.startY,
      clientX: point.clientX,
      clientY: point.clientY,
      isVertical: context.isVertical,
      isFlick: context.isFlick,
      velocity:speed
    });
  }

  cancel(point, context) {
    clearTimeout(context.handler);
    this.dispatcher.dispatch('cancel', {});
  }
}

export class Dispatcher {
  constructor(ele) {
    this.ele = ele;
  }
  dispatch(type, properties = Object.create(null)) {
    console.log(type);
    let event = new Event(type);
    for (let name in properties) {
      event[name] = properties[name];
    }
    this.ele.dispatchEvent(event);
  }
}

export function enableGesture(ele) {
  new Listener(ele, new Recognizer(new Dispatcher(ele)));
}
