import {
  Reference,
  ExecutionContext,
  Realm,
  getRefVal,
  getRefBoolean,
  JSBoolean,
  JSUndefined,
  JSNumber,
  CompletionRecord,
  ObjectEnvironmentRecord,
  EnvironmentRecord,
  JSObject,
  getPrimitiveVal,
  JSString,
} from './runtime.js';

export class Evaluator {
  constructor() {
    this.realm = new Realm();
    this.globalObject = new Map();
    // 全局注入log function
    this.globalObject.set('log', new JSObject());
    this.globalObject.get('log').call = (args) => {
      console.log(args);
    };

    // 初始化顶层的执行环境，设置lexicalEnvironment 和 variableEnvironment 为全局初始map，顶层对象上层没有outer，所以使用ObjectEnvironmentRecord api初始化。
    this.ecs = [
      new ExecutionContext(
        this.realm,
        new ObjectEnvironmentRecord(this.globalObject),
        new ObjectEnvironmentRecord(this.globalObject),
      ),
    ];
  }

  // module 的解析，需要在每个module解析时新建执行环境。将当前执行环境的顶层执行环节注入到module的环境中。
  evaluateModule(node){
    let globalEC = this.ecs[0];
    let newEC = new ExecutionContext(this.realm,
      new EnvironmentRecord(globalEC.lexicalEnvironment),
      new EnvironmentRecord(globalEC.lexicalEnvironment));
    this.ecs.push(newEC);
    this.evaluate(node);
    this.ecs.pop();
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
      let record = this.evaluate(node.children[0]);
      if (record.type === 'normal') {
        return this.evaluate(node.children[1]);
      } else {
        return record;
      }
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
  FunctionDeclaration(node) {
    let name = node.children[1].name;
    let code = node.children[node.children.length - 2];
    let func = new JSObject();
    func.call = (args) => {
      let runningEC = this.ecs[this.ecs.length - 1];
      let newEC = new ExecutionContext(
        runningEC.realm,
        new EnvironmentRecord(func.environment),
        new EnvironmentRecord(func.environment),
      );
      this.ecs.push(newEC);
      this.evaluate(code);
      this.ecs.pop();
    };
    let runningEC = this.ecs[this.ecs.length - 1];
    runningEC.lexicalEnvironment.add(name);
    runningEC.lexicalEnvironment.set(name, func);
    func.environment = runningEC.lexicalEnvironment;
    return new CompletionRecord('normal');
  }
  WhileStatement(node) {
    while (true) {
      console.count('id');
      let condition = this.evaluate(node.children[2]);
      if (getRefBoolean(condition)) {
        let record = this.evaluate(node.children[4]);
        if (record.type === 'continue') {
          continue;
        } else if (record.type === 'break') {
          return new CompletionRecord('normal');
        }
      } else {
        return new CompletionRecord('normal');
      }
    }
  }
  BreakStatement() {
    return new CompletionRecord('break');
  }
  VariableDeclaration(node) {
    let runningEC = this.ecs[this.ecs.length - 1];
    runningEC.lexicalEnvironment.add(node.children[1].name);
    return new CompletionRecord('normal', new JSUndefined());
  }
  ExpressionStatement(node) {
    let result = this.evaluate(node.children[0]);
    if (result instanceof Reference) {
      result = result.get();
    }
    return new CompletionRecord('normal', result);
  }
  Expression(node) {
    return this.evaluate(node.children[0]);
  }
  AdditiveExpression(node) {
    if (node.children.length == 1) {
      return this.evaluate(node.children[0]);
    } else {
      if (node.children[1].type === '+') {
        return new JSNumber(
          getPrimitiveVal(this.evaluate(node.children[0])) + getPrimitiveVal(this.evaluate(node.children[2])),
        );
      } else if (node.children[1].type === '-') {
        return new JSNumber(
          getPrimitiveVal(this.evaluate(node.children[0])) - getPrimitiveVal(this.evaluate(node.children[2])),
        );
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
    return new JSString(result);
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
    let runningEC = this.ecs[this.ecs.length - 1];
    let newEC = new ExecutionContext(
      runningEC.realm,
      new EnvironmentRecord(runningEC.lexicalEnvironment),
      runningEC.variableEnvironment,
    );
    this.ecs.push(newEC);
    let result = this.evaluate(node.children[1]);
    this.ecs.pop();
    return result;
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
  Arguments(node) {
    if (node.children.length === 2) {
      return [];
    } else {
      return this.evaluate(node.children[1]);
    }
  }
  ArgumentList(node) {
    if (node.children.length === 1) {
      return [getRefVal(this.evaluate(node.children[0]))];
    } else {
      let result = this.evaluate(node.children[2]);
      return this.evaluate(node.children[0]).concat(getRefVal(result));
    }
  }
  CallExpression(node) {
    if (node.children.length === 1) {
      return this.evaluate(node.children[0]);
    }
    if (node.children.length === 2) {
      let func = this.evaluate(node.children[0]);
      let args = this.evaluate(node.children[1]);
      if (func instanceof Reference) {
        func = func.get();
      }
      return func.call(args);
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
