import { scan } from './lexParser.js';
let syntax = {
  Program: [['StatementList', 'EOF']],
  StatementList: [['Statement'], ['StatementList', 'Statement']],
  Statement: [
    ['ExpressionStatement'],
    ['IfStatement'],
    ['WhileStatement'],
    ['VariableDeclaration'],
    ['FunctionDeclaration'],
    ['Block'],
  ],
  Block: [
    ['{', 'StatementList', '}'],
    ['{', '}'],
  ],
  IfStatement: [['if', '(', 'Expression', ')', 'Statement']],
  WhileStatement: [['while', '(', 'Expression', ')', 'Statement']],
  VariableDeclaration: [
    ['var', 'Identifier', ';'],
    ['let', 'Identifier', ';'],
  ],
  FunctionDeclaration: [['function', 'Identifier', '(', ')', '{', 'StatementList', '}']],
  ExpressionStatement: [['Expression', ';']],
  Expression: [['AssignmentExpression']],
  AssignmentExpression: [['LeftHandSideExpression', '=', 'LogicalORExpression'], ['LogicalORExpression']],
  LogicalORExpression: [['LogicalANDExpression'], ['LogicalORExpression', '||', 'LogicalANDExpression']],
  LogicalANDExpression: [['AdditiveExpression'], ['LogicalANDExpression', '&&', 'AdditiveExpression']],
  AdditiveExpression: [
    ['MultiplicativeExpression'],
    ['AdditiveExpression', '+', 'MultiplicativeExpression'],
    ['AdditiveExpression', '-', 'MultiplicativeExpression'],
  ],
  MultiplicativeExpression: [
    ['LeftHandSideExpression'],
    ['MultiplicativeExpression', '*', 'LeftHandSideExpression'],
    ['MultiplicativeExpression', '/', 'LeftHandSideExpression'],
  ],

  NewExpression: [['MemberExpression'], ['new', 'NewExpression']],
  MemberExpression: [
    ['PrimaryExpression'],
    ['PrimaryExpression', '.', 'Identifier'],
    ['PrimaryExpression'],
    '[',
    'Expression',
    ']',
  ],
  CallExpression: [
    ['MemberExpression', 'Arguments'],
    ['CallExpression', 'Arguments'],
  ],
  LeftHandSideExpression: [['CallExpression'], ['NewExpression']],
  Arguments: [
    ['(', ')'],
    ['(', 'ArgumentList', ')'],
  ],
  ArgumentList: [['AssignmentExpression'], ['ArgumentList', ',', 'AssignmentExpression']],
  PrimaryExpression: [['(', 'Expression', ')'], ['Literal'], ['Identifier']],
  Literal: [
    ['NumberLiteral'],
    ['StringLiteral'],
    ['BooleanLiteral'],
    ['NullLiteral'],
    ['RegularExpression'],
    ['ObjectLiteral'],
  ],
  ObjectLiteral: [
    ['{', '}'],
    ['{', 'PropertyList', '}'],
  ],
  PropertyList: [['Property'], ['PropertyList', ',', 'Property']],
  Property: [
    ['StringLiteral', ':', 'AdditiveExpression'],
    ['Identifier', ':', 'AdditiveExpression'],
  ],
};
let stateHash = {};

/**
 * 形成初始化的syntax状态链，设置每条闭环链的闭环状态及值
 * @param {*} state 初始状态
 */
function closure(state) {
  stateHash[JSON.stringify(state)] = state;
  let queue = [];
  for (let symbol in state) {
    if (!symbol.startsWith('_')) {
      queue.push(symbol);
    }
  }
  // 广度优先搜索
  while (queue.length) {
    let symbol = queue.shift();
    if (!syntax[symbol]) continue;
    for (let rule of syntax[symbol]) {
      if (!state[rule[0]]) {
        queue.push(rule[0]);
      }
      let current = state;
      // 将状态机的每一位都加到下一步去
      for (let part of rule) {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
      current._reduceType = symbol;
      current._reduceLength = rule.length;
    }
  }
  for (let symbol in state) {
    if (symbol.startsWith('_')) continue;
    if (stateHash[JSON.stringify(state[symbol])]) {
      state[symbol] = stateHash[JSON.stringify(state[symbol])];
    } else {
      closure(state[symbol]);
    }
  }
}

let end = {
  _isEnd: true,
};
let start = {
  Program: end,
};
closure(start);
console.log(start);

/**
 * 解析语法结构
 * @param {*} source 源码
 * @returns
 */
export function parse(source) {
  let stack = [start];
  let symbolStack = [];
  function reduce() {
    let state = stack[stack.length - 1];
    if (state._reduceType) {
      let children = [];
      for (let i = 0; i < state._reduceLength; i++) {
        stack.pop();
        children.push(symbolStack.pop());
      }
      return {
        type: state._reduceType,
        children: children.reverse(),
      };
    } else {
      throw new Error('unexcepted token' + JSON.stringify(state));
    }
  }
  function shift(symbol) {
    let state = stack[stack.length - 1];
    if (symbol.type in state) {
      stack.push(state[symbol.type]);
      symbolStack.push(symbol);
    } else {
      // reduce to non-terminal symbols
      shift(reduce());
      shift(symbol);
    }
  }
  for (let symbol /*terminal symblol */ of scan(source)) {
    shift(symbol);
  }
  return reduce();
}
