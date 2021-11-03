function createElement(type,attributes,...children){
  let element;
  if (typeof type === 'string'){
    element = document.createElement(type);
  } else {
    element = new type;
  }
  for (let attrName in attributes){
    element.setAttribute(attrName,attributes[attrName])
  }
  for (let child of children){
    if (typeof child === 'string'){
      child = document.createTextNode(child);
    }
    element.appendChild(child);
  }
  return element;
}
class Div{
  constructor(){

  }
  setAttribute(){

  }
  appendChild(){

  }
  mountTo(parent){

  }
}
let a = <Div id='a'>
      <span>aweff<div>fff</div></span><span></span><span></span><span></span><span></span>
</Div>
a.mountTo(document.body)
