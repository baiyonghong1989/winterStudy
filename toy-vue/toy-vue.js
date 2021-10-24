export class ToyVue{
  constructor(config){
    this.template = document.querySelector(config.el);
    this.data = reactive(config.data);
    this.traversal(this.template)
  }
  traversal(node){
    if (node.nodeType === Node.TEXT_NODE){
      if (node.textContent.trim().match(/^{{([\d\D]+)}}$/)){
        let name = RegExp.$1;
        effect(()=> node.textContent = this.data[name]);
      }
    }
    if (node.childNodes && node.childNodes.length>0){
      for (let child of node.childNodes){
        this.traversal(child);
      }
    }
  }
}

export function reactive(object){
  let observed = new Proxy(object,{
    get(obj,prop){
      if (currentEffect){
        if (!effects.has(obj)){
          effects.set(obj,new Map());
        }
        if (!effects.get(obj).get(prop)){
          effects.get(obj).set(prop,[]);
        }
        effects.get(obj).get(prop).push(currentEffect);
      }
      return obj[prop];
    },
    set(obj,prop,val){
      obj[prop] = val;
      if (effects.get(obj) && effects.get(obj).get(prop)){
        for (effect of effects.get(obj).get(prop)){
          effect();
        }
      }
      return val;
    }
  })
  return observed;
}
let currentEffect = null;
let effects = new Map();
function effect(fn){
  currentEffect = fn;
  fn();
  currentEffect = null;
}


