import {
  Reference,
  ExecutionContext,
  Realm,
  getRefVal,
  getRefBoolean,
  JSBoolean,
  JSNull,
  JSObject,
  JSString,
  JSSymbol,
  JSUndefined,
  JSNumber,
} from './runtime.js';

export class Evaluator {
  constructor() {
    this.realm = new Realm();
    this.globalObject = {};
    this.ecs = [new ExecutionContext(this.realm, this.globalObject)];
  }
  evaluate(node) {
    console.log(node);
    if (this[node.type]) {
      return this[node.type](node);
    }
  }
  Program(node) {
    return this.evaluate(node.children[0]);
  }
  StatementList(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    } else {
      this.evaluate(node.children[0]);
      return this.evaluate(node.children[1]);
    }
  }
  Statement(node) {
    return this.evaluate(node.children[0]);
  }
  IfStatement(node) {
    let condition = this.evaluate(node.children[2]);
    if (getRefBoolean(condition.toBoolean())) {
      return this.evaluate(node.children[4]);
    }
  }
  WhileStatement(node) {
    while (true) {
      console.count('id');
      let condition = this.evaluate(node.children[2]);
      if (getRefBoolean(condition)) {
        this.evaluate(node.children[4]);
      } else {
        break;
      }
    }
  }
  VariableDeclaration(node) {
    let runningEC = this.ecs[this.ecs.length - 1];
    runningEC.variableEnvironment[node.children[0].name];
  }
  ExpressionStatement(node) {
    return this.evaluate(node.children[0]);
  }
  Expression(node) {
    return this.evaluate(node.children[0]);
  }
  AdditiveExpression(node) {
    if (node.children.length == 1) {
      return this.evaluate(node.children[0]);
    } else {
      if (node.children[1].type === '+') {
        return getRefVal(this.evaluate(node.children[0])) + getRefVal(this.evaluate(node.children[2]));
      } else if (node.children[1].type === '-') {
        return new JSNumber(getRefVal(this.evaluate(node.children[0])) - getRefVal(this.evaluate(node.children[2])));
      }
    }
    return this.evaluate(node.children[0]);
  }
  MultiplicativeExpression(node) {
    return this.evaluate(node.children[0]);
  }
  PrimaryExpression(node) {
    return this.evaluate(node.children[0]);
  }
  Literal(node) {
    return this.evaluate(node.children[0]);
  }
  NumberLiteral(node) {
    let str = node.value;
    let len = str.length;
    let value = 0;
    let unit = 10;
    if (str.match(/^0b/)) {
      unit = 2;
      len -= 2;
    } else if (str.match(/^0o/)) {
      unit = 8;
      len -= 2;
    } else if (str.match(/^0x/)) {
      unit = 16;
      len -= 2;
    }
    while (len--) {
      let c = str.charCodeAt(str.length - len - 1);
      if (c >= 'a'.charCodeAt(0)) {
        c = c - 'a'.charCodeAt(0) + 10;
      } else if (c >= 'A'.charCodeAt(0)) {
        c = c - 'A'.charCodeAt(0) + 10;
      } else if (c >= '0'.charCodeAt(0)) {
        c = c - '0'.charCodeAt(0);
      }
      value = value * unit + c;
    }
    return new JSNumber(value);
  }
  StringLiteral(node) {
    let result = [];
    let map = {
      '"': '"',
      "'": "'",
      '\\': '\\',
      0: String.fromCharCode(0x0000),
      b: String.fromCharCode(0x0008),
      f: String.fromCharCode(0x000c),
      n: String.fromCharCode(0x000a),
      r: String.fromCharCode(0x000d),
      t: String.fromCharCode(0x0009),
      v: String.fromCharCode(0x000b),
    };
    for (let i = 1; i < node.value.length - 1; i++) {
      if (node.value[i] === '\\') {
        ++i;
        let c = node.value[i];
        if (c in map) {
          result.push(map[c]);
        } else {
          result.push(c);
        }
      } else {
        result.push(node.value[i]);
      }
    }
    return result;
  }
  BooleanLiteral(node) {
    if (node.value === 'false') {
      return new JSBoolean(false);
    } else {
      return new JSBoolean(true);
    }
  }
  ObjectLiteral(node) {
    if (node.children.length === 2) {
      return {};
    }
    if (node.children.length === 3) {
      let object = new Map();
      this.PropertyList(node.children[1], object);
      return object;
    }
  }
  PropertyList(node, object) {
    if (node.children.length === 1) {
      this.Property(node.children[0], object);
    } else {
      this.PropertyList(node.children[0], object);
      this.Property(node.children[2], object);
    }
  }
  Property(node, object) {
    let name;
    if (node.children[0].type === 'Identifier') {
      name = node.children[0].name;
    } else if (node.children[0].type === 'StringLiteral') {
      name = this.evaluate(node.children[0]);
    }
    object.set(name, {
      value: this.evaluate(node.children[2]),
      writable: true,
      enumerable: true,
      configable: true,
    });
  }
  Identifier(node) {
    let runningEC = this.ecs[this.ecs.length - 1];
    return new Reference(runningEC.lexicalEnvironment, node.name);
  }
  Block(node) {
    if (node.children.length === 2) {
      return;
    }
    return this.evaluate(node.children[1]);
  }
  AssignmentExpression(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    }
    let left = this.evaluate(node.children[0]);
    let right = this.evaluate(node.children[2]);
    left.set(right);
    console.log(left);
  }
  LogicalORExpression(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    }
    let result = this.evaluate(node.children[0]);
    if (result) {
      return result;
    } else {
      return this.evaluate(node.children[2]);
    }
  }
  LogicalANDExpression(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    }
    let result = this.evaluate(node.children[0]);
    if (!result) {
      return result;
    } else {
      return this.evaluate(node.children[2]);
    }
  }
  LeftHandSideExpression(node) {
    return this.evaluate(node.children[0]);
  }
  NewExpression(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    }
    if (node.children.length === 2) {
      let cls = this.evaluate(node.children[1]);
      return cls.construct();
    }
  }
  CallExpression(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    }
    if (node.children.length === 2) {
      let func = this.evaluate(node.children[0]);
      // let args = this.evaluate(node.children[1]);
      return func.call();
    }
  }
  MemberExpression(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    }
    if (node.children.length === 3) {
      let obj = this.evaluate(node.children[0]).get();
      let prop = obj.get(node.children[2].name);
      if ('value' in prop) {
        return prop.value;
      }
      if ('get' in prop) {
        return prop.get.call(obj);
      }
    }
  }
}
