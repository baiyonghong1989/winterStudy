export function createElement(type, attributes, ...children) {
  let element;
  if (typeof type === 'string') {
    element = new ElementWrapper(type);
  } else {
    element = new type();
  }
  for (let attrName in attributes) {
    element.setAttribute(attrName, attributes[attrName]);
  }
  let procesChildren = (children) => {
    for (let child of children) {
      if (child instanceof Array){
        procesChildren(child);
        continue;
      }
      if (typeof child === 'string') {
        child = new TextWrapper(child);
      }
      element.appendChild(child);
    }
  }
  procesChildren(children);

  return element;
}

export const STATE = Symbol('state');
export const ATTRIBUTE = Symbol('attirbute');
export class Component{
  constructor() {
    this[STATE] = Object.create(null);
    this[ATTRIBUTE] = Object.create(null)
  }
  setAttribute(name, value) {
    this[ATTRIBUTE][name] = value;
  }
  appendChild(child) {
    child.mountTo(this.root);
  }
  mountTo(parent) {
    if (!this.root){
      this.render();
    }
    parent.appendChild(this.root);
  }
  render(){
    return this.root;
  }
  triggerEvent(type,args){
    this[ATTRIBUTE]['on'+type.replace(/^[\s\S]/,s=>s.toUpperCase())](new CustomEvent(type,{
      detail:args
    }));
  }
}
class ElementWrapper extends Component{
  constructor(type) {
    super();
    this.root = document.createElement(type);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(child) {
    child.mountTo(this.root);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}
class TextWrapper {
  constructor(content) {
    this.root = document.createTextNode(content);
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value);
  }
  appendChild(child) {
    child.mountTo(this.root);
  }
  mountTo(parent) {
    parent.appendChild(this.root);
  }
}
