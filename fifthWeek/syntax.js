let syntax = {
  Program: [['StatementList', 'EOF']],
  StatementList: [['Statement'], ['StatementList', 'Statement']],
  Statement: [['ExpressionStatement'], ['IfStatement'], ['VariableDeclaration'], ['FunctionDeclaration']],
  IfStatement: [['if', '(', 'Expression', ')', 'Statement']],
  VariableDeclaration: [['var', 'Identifier', ';']],
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
  Literal: [['Number']],
};
let stateHash = {};
function closure(state) {
  console.log(JSON.stringify(state));
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
      current._isRuleEnd = true;
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
  IfStatement: end,
};
closure(start);
console.log(start);
