import { scan } from './lexParser.js';
let syntax = {
  Program: [['StatementList', 'EOF']],
  StatementList: [['Statement'], ['StatementList', 'Statement']],
  Statement: [['ExpressionStatement'], ['IfStatement'], ['VariableDeclaration'], ['FunctionDeclaration']],
  IfStatement: [['if', '(', 'Expression', ')', 'Statement']],
  VariableDeclaration: [
    ['var', 'Identifier', ';'],
    ['let', 'Identifier', ';'],
  ],
  FunctionDeclaration: [['function', 'Identifier', '(', ')', '{', 'StatementList', '}']],
  ExpressionStatement: [['Expression']],
  Expression: [['AdditiveExpression', ';']],
  AdditiveExpression: [
    ['MultiplicativeExpression'],
    ['AdditiveExpression', '+', 'MultiplicativeExpression'],
    ['AdditiveExpression', '-', 'MultiplicativeExpression'],
  ],
  MultiplicativeExpression: [
    ['PrimaryExpression'],
    ['MultiplicativeExpression', '*', 'PrimaryExpression'],
    ['MultiplicativeExpression', '/', 'PrimaryExpression'],
  ],
  PrimaryExpression: [['(', 'Expression', ')'], ['Literal'], ['Identifier']],
  Literal: [['Number'], ['String'], ['Boolean'], ['Null'], ['RegularExpression']],
};
let stateHash = {};
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
    // console.log(symbol);
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
function parse(source) {
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
      throw new Error('unexcepted token');
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
let evaluator = {
  Program(node) {
    return evaluate(node.children[0]);
  },
  StatementList(node) {
    if (node.children.length === 1) {
      return evaluate(node.children[0]);
    } else {
      evaluate(node.children[0]);
      return evaluate(node.children[1]);
    }
  },
  Statement(node) {
    return evaluate(node.children[0]);
  },
  VariableDeclaration(node) {
    console.log(node);
  },
};
function evaluate(node) {
  if (evaluator[node.type]) {
    return evaluator[node.type](node);
  }
}
let source = `
  var a;
  let b;
`;
let tree = parse(source);
evaluate(tree);
