export class Reference {
  constructor(object, property) {
    this.object = object;
    this.property = property;
  }
  get() {
    return this.object[this.property];
  }
  set(value) {
    this.object[this.property] = value;
  }
}

export function getRefVal(ref) {
  if (ref instanceof Reference) {
    return getRefVal(ref.get());
  } else {
    return (ref || {}).value || ref;
  }
}

export function getRefBoolean(ref) {
  if (ref instanceof Reference) {
    return ref.get().toBoolean().value;
  } else {
    return ((ref || {}).value || ref).toBoolean().value;
  }
}
export class Realm {
  constructor() {
    this.global = new Map();
    this.Object = new Map();
    this.Object.call = function () {};
    this.Object_prototype = new Map();
  }
}

export class ExecutionContext {
  constructor(realm, lexicalEnvironment, variableEnvironment) {
    variableEnvironment = variableEnvironment || lexicalEnvironment;
    this.lexicalEnvironment = lexicalEnvironment;
    this.variableEnvironment = variableEnvironment;
    this.realm = realm;
  }
}

export class JSValue {
  get Type() {
    if (this.constructor === JSNumber) {
      return 'number';
    } else if (this.constructor === JSString) {
      return 'string';
    } else if (this.constructor === JSBoolean) {
      return 'boolean';
    } else if (this.constructor === JSNull) {
      return 'null';
    } else if (this.constructor === JSUndefined) {
      return 'undefined';
    } else if (this.constructor === JSSymbol) {
      return 'symbol';
    } else if (this.constructor === JSObject) {
      return 'object';
    }
    return 'undefined';
  }
}

export class JSNumber extends JSValue {
  constructor(value) {
    super();
    this.memory = new ArrayBuffer(8);
    if (arguments.length) {
      new Float64Array(this.memory)[0] = value;
    } else {
      new Float64Array(this.memory)[0] = 0;
    }
  }
  get value() {
    return new Float64Array(this.memory)[0] || 0;
  }
  toString() {}
  toNumber() {
    return this;
  }
  toBoolean() {
    if (new Float64Array(this.memory)[0] === 0) {
      return new JSBoolean(false);
    } else {
      return new JSBoolean(true);
    }
  }
}

export class JSString extends JSValue {
  constructor(characters) {
    super();
    this.characters = characters;
  }
  toString() {
    return this;
  }
  toNumber() {}
  toBoolean() {
    if (new Float64Array(this.memory)[0] === 0) {
      return new JSBoolean(false);
    } else {
      return new JSBoolean(true);
    }
  }
}

export class JSBoolean extends JSValue {
  constructor(value) {
    super();
    this.value = value || false;
  }
  toNumber() {
    if (this.value) {
      return new JSNumber(1);
    } else {
      return new JSNumber(0);
    }
  }
  toString() {
    if (this.value) {
      return new JSString([...'true']);
    } else {
      return new JSString([...'false']);
    }
  }
  toBoolean() {
    return this;
  }
}

export class JSObject extends JSValue {
  constructor(proto) {
    super();
    this.properties = new Map();
    this.prototype = proto || null;
  }
  set(name, value) {
    this.setProperty(name, {
      value: value,
      enumerable: true,
      configurable: true,
      writeable: true,
    });
  }
  get(name) {
    // TODO prototype chain && getter
    return this.getProperty(name).value;
  }
  setProperty(name, attributes) {
    this.properties.set(name, attributes);
  }
  getProperty(name) {
    // TODO
    return this.properties.get(name);
  }
  setPrototype(proto) {
    this.prototype = proto;
  }
  getPrototype() {
    return this.prototype;
  }
}

export class JSNull extends JSValue {
  toNumber() {
    return new JSNumber(0);
  }
  toString() {
    return new JSString([...'null']);
  }
  toBoolean() {
    return new JSBoolean(false);
  }
}

export class JSUndefined extends JSValue {
  toNumber() {
    return new JSNumber(0);
  }
  toString() {
    return new JSString([...'null']);
  }
  toBoolean() {
    return new JSBoolean(false);
  }
}

export class JSSymbol extends JSValue {
  constructor(name) {
    super();
    this.name = name || '';
  }
}

export class CompletionRecord {
  constructor(type, value, target) {
    this.type = type || 'normal';
    this.value = value || new JSUndefined();
    this.target = target || null;
  }
}
