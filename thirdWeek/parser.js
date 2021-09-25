/* eslint-disable no-empty */
const EOF = Symbol('EOF');
const util = require('./util');
const layout = require('./layout');
let currentToken = {};
let currentAttribute = {};
let stack = [{ type: 'document', children: [] }];
let currentTextNode = null;
let css = require('css');
let cssRules = [];
module.exports.parseHTML = function (html) {
  let state = data;
  for (let c of html) {
    state = state(c);
  }
  state = state(EOF);
  return stack[0];
};

function data(c) {
  if (c === '<') {
    return tagOpen;
  } else if (c === EOF) {
    emit({
      type: 'EOF',
    });
    return;
  } else {
    emit({
      type: 'text',
      content: c,
    });
    return data;
  }
}

function tagOpen(c) {
  if (c === '/') {
    return endTagOpen;
  } else if (util.isLetter(c)) {
    currentToken = {
      type: 'startTag',
      tagName: '',
    };
    return tagName(c);
  } else {
    return;
  }
}

function endTagOpen(c) {
  if (util.isLetter(c)) {
    currentToken = {
      type: 'endTag',
      tagName: '',
    };
    return tagName(c);
  } else if (c === '>') {
  } else if (c === EOF) {
  } else {
  }
}

function tagName(c) {
  if (util.isEmptyChar(c)) {
    return beforeAttributeName;
  } else if (c == '/') {
    return selfClosingStartTag;
  } else if (util.isLetter(c)) {
    currentToken.tagName += c;
    return tagName;
  } else if (c === '>') {
    emit(currentToken);
    return data;
  } else {
    return tagName;
  }
}

function beforeAttributeName(c) {
  if (util.isEmptyChar(c)) {
    return beforeAttributeName;
  } else if (c === '>' || c === '/' || c === EOF) {
    return afterAttributeName(c);
  } else if (c === '=') {
    //
  } else {
    currentAttribute = {
      name: '',
      value: '',
    };
    return attributeName(c);
  }
}

function attributeName(c) {
  if (util.isEmptyChar(c) || c === '/' || c === '>' || c === EOF) {
    return afterAttributeName(c);
  } else if (c === '=') {
    return beforeAttributeValue;
  } else if (c === '\u0000') {
  } else if (c === "'" || c == '"' || c == '<') {
  } else {
    currentAttribute.name += c;
    return attributeName;
  }
}
function beforeAttributeValue(c) {
  if (util.isEmptyChar(c) || c === '/' || c === '>' || c === EOF) {
    return beforeAttributeValue;
  } else if (c == '"') {
    return doubleQuotedAttributeValue;
  } else if (c === "'") {
    return singleQuotedAttributeValue;
  } else {
    return unquotedAttributeValue(c);
  }
}

function afterAttributeName(c) {
  if (util.isEmptyChar(c)) {
    return afterAttributeName;
  } else if (c == '/') {
    return selfClosingStartTag;
  } else if (c === '=') {
    return beforeAttributeValue;
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c === EOF) {
  } else {
    currentToken[currentAttribute.name] = currentAttribute.value;
    currentAttribute = {
      name: '',
      value: '',
    };
    return attributeName(c);
  }
}
function doubleQuotedAttributeValue(c) {
  if (c == '"') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c === '\u0000') {
  } else if (c === EOF) {
    //
  } else {
    currentAttribute.value += c;
    return doubleQuotedAttributeValue;
  }
}
function singleQuotedAttributeValue(c) {
  if (c == "'") {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return afterQuotedAttributeValue;
  } else if (c === '\u0000') {
    //
  } else if (c === EOF) {
    //
  } else {
    currentAttribute.value += c;
    return singleQuotedAttributeValue;
  }
}
function afterQuotedAttributeValue(c) {
  if (util.isEmptyChar(c)) {
    return beforeAttributeName;
  } else if (c === '/') {
    return selfClosingStartTag;
  } else if (c == '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  }
}

function unquotedAttributeValue(c) {
  if (util.isEmptyChar(c)) {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return beforeAttributeName;
  } else if (c === '/') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    return selfClosingStartTag;
  } else if (c === '>') {
    currentToken[currentAttribute.name] = currentAttribute.value;
    emit(currentToken);
    return data;
  } else if (c === '\u0000') {
  } else if (c === '"' || c === "'" || c === '<' || c === '=' || c === '`') {
  } else if (c === EOF) {
  } else {
    currentAttribute.value += c;
    return unquotedAttributeValue;
  }
}

function selfClosingStartTag(c) {
  if (c === '>') {
    currentToken.isSelfClosing = true;
    emit(currentToken);
    return data;
  } else if (c == EOF) {
  } else {
  }
}

function emit(token) {
  let top = stack[stack.length - 1];
  if (token.type === 'text') {
    dealTextNode();
  }
  if (token.type === 'startTag') {
    dealStartTag();
  } else if (token.type === 'endTag') {
    dealEndTag();
  }

  function dealTextNode() {
    if (currentTextNode === null) {
      currentTextNode = {
        type: 'text',
        content: '',
      };
      top.children.push(currentTextNode);
    }
    currentTextNode.content += token.content;
  }

  function dealEndTag() {
    if (top.tagName !== token.tagName) {
      throw new Error('tag start end does not match');
    } else {
      if (top.tagName === 'style') {
        addCssRules(top.children[0].content);
      }
      layout(top);
      stack.pop();
    }
    currentTextNode = null;
  }
  function addCssRules(styleContent) {
    let ast = css.parse(styleContent);
    cssRules.push(...ast.stylesheet.rules);
  }
  function computeCss(element) {
    let elements = [...stack].reverse();
    element.computedStyle = element.computedStyle || {};
    for (let rule of cssRules) {
      let selectorParts = rule.selectors[0].split(' ').reverse();
      if (!match(element, selectorParts[0])) {
        continue;
      }
      let j = 1;
      for (let i = 0; i < elements.length; i++) {
        if (match(elements[i], selectorParts[j])) {
          j++;
        }
      }
      if (j >= selectorParts.length) {
        // matched
        let sp = getSpecificity(rule.selectors[0]);
        var computedStyle = element.computedStyle;
        for (let declaration of rule.declarations) {
          computedStyle[declaration.property] = computedStyle[declaration.property] || {};
          if (!computedStyle[declaration.property].specificity) {
            computedStyle[declaration.property].value = declaration.value;
            computedStyle[declaration.property].specificity = sp;
          } else if (compare(computedStyle[declaration.property].specificity, sp) < 0) {
            computedStyle[declaration.property].value = declaration.value;
            computedStyle[declaration.property].specificity = sp;
          }
        }
      }
    }
    function compare(sp1, sp2) {
      return sp1[0] - sp2[0] || sp1[1] - sp2[1] || sp1[2] - sp2[2] || sp1[3] - sp2[3];
    }
    function getSpecificity(selector) {
      let p = [0, 0, 0, 0];
      if (selector[0] === '#') {
        p[1] += 1;
      } else if (selector[0] === '.') {
        p[2] += 1;
      } else {
        p[3] += 1;
      }
      return p;
    }
    function match(element, selector) {
      if (!selector || !element.attributes) {
        return false;
      }
      if (selector[0] === '#') {
        let attr = element.attributes.filter((attr) => attr.name === 'id')[0];
        if (attr && attr.value === selector.slice(1)) {
          return true;
        }
      } else if (selector[0] === '.') {
        let attr = element.attributes.filter((attr) => attr.name === 'class')[0];
        if (attr && attr.value.split(' ').includes(selector.slice(1))) {
          return true;
        }
      } else {
        if (element.tagName === selector) {
          return true;
        }
      }
      return false;
    }
  }
  function dealStartTag() {
    let element = {
      type: 'element',
      children: [],
      attributes: [],
    };
    element.tagName = token.tagName;
    for (let p in token) {
      if (!['type', 'tagname'].includes(p)) {
        element.attributes.push({
          name: p,
          value: token[p],
        });
      }
    }
    computeCss(element);
    top.children.push(element);
    element.parent = top;
    if (!token.isSelfClosing) {
      stack.push(element);
    }
    currentTextNode = null;
  }
}
