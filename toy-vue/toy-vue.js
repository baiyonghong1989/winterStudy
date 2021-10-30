export class ToyVue {
  constructor(config) {
    this.template = document.querySelector(config.el);
    this.data = reactive(config.data);
    for (let methodName in config.methods) {
      this[methodName] = () => {
        config.methods[methodName].apply(this.data);
      };
    }
    this.traversal(this.template);
  }

  traversal(node) {
    this.travelsalDoubleBracket(node);
    this.travelsalVModel(node);
    this.travelsalVBind(node);
    this.travelsalVOn(node);
    if (node.childNodes && node.childNodes.length > 0) {
      for (let child of node.childNodes) {
        this.traversal(child);
      }
    }
  }

  // 处理双括号
  travelsalDoubleBracket(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent.trim().match(/^{{([\d\D]+)}}$/)) {
        let name = RegExp.$1.trim();
        effect(() => (node.textContent = this.data[name]));
      }
    }
  }

  // 处理v-model
  travelsalVModel(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      for (let attr of node.attributes) {
        if (attr.name === 'v-model') {
          node.addEventListener('input', () => {
            this.data[attr.value] = node.value;
          });
          effect(() => {
            node.value = this.data[attr.value];
          });
        }
      }
    }
  }
  // 处理v-bind
  travelsalVBind(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      for (let attr of node.attributes) {
        if (attr.name.match(/^v-bind:([\s\S]+)$/)) {
          let attrName = RegExp.$1.trim();
          let value = attr.value;
          effect(() => {
            node.setAttribute(attrName, this.data[value]);
          });
        }
      }
    }
  }

  // 处理v-bind
  travelsalVOn(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      for (let attr of node.attributes) {
        if (attr.name.match(/^v-on:([\s\S]+)$/)) {
          let eventName = RegExp.$1.trim();
          let funName = attr.value;
          node.addEventListener(eventName, this[funName]);
        }
      }
    }
  }
}

export function reactive(object) {
  let observed = new Proxy(object, {
    get(obj, prop) {
      if (currentEffect) {
        if (!effects.has(obj)) {
          effects.set(obj, new Map());
        }
        if (!effects.get(obj).get(prop)) {
          effects.get(obj).set(prop, []);
        }
        effects.get(obj).get(prop).push(currentEffect);
      }
      return obj[prop];
    },
    set(obj, prop, val) {
      obj[prop] = val;
      if (effects.get(obj) && effects.get(obj).get(prop)) {
        for (effect of effects.get(obj).get(prop)) {
          effect();
        }
      }
      return val;
    },
  });
  return observed;
}
let currentEffect = null;
let effects = new Map();
function effect(fn) {
  currentEffect = fn;
  fn();
  currentEffect = null;
}
