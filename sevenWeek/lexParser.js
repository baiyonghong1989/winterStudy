/* eslint-disable no-empty */
let regexpMap = {
  InputElement: '<WhiteSpace>|<LineTerminator>|<Comments>|<Token>',
  WhiteSpace: / /,
  LineTerminator: /\n/,
  Comments: /\/\*(?:[^*]|\*[^/])*\*\/|\/\/[^\n]*/,
  Token: '<Literal>|<Keywords>|<Identifier>|<Punctuator>',
  Literal: '<NumberLiteral>|<BooleanLiteral>|<StringLiteral>|<NullLiteral>',
  NumberLiteral: /0x[0-9a-fA-F]+|0o[0-7]+|0b[01]+|(?:[1-9][0-9]*|0)(?:\.[0-9]+)?/,
  BooleanLiteral: /true|false/,
  StringLiteral: /"(?:[^\n]|\\[\s\S])*"|'(?:[^\n]|\\[\s\S])*'/,
  NullLiteral: /null/,
  Keywords: /if|else|for|function|let|var|new|while/,
  Identifier: /[a-zA-Z_$][a-zA-Z0-9_$]*/,
  Punctuator: /\|\||&&|\+|,|\?|:|\{|\{|\}|\.|\(|\)|=|<|\+\+|-|==|=>|\*|\[|\]|;/,
};
class XRegExp {
  constructor(source, flag, root = 'root') {
    this.table = new Map();
    this.regExp = new RegExp(this.compileRegExp(source, root, 0).source, flag);
  }
  compileRegExp(source, name, start) {
    if (source[name] instanceof RegExp) {
      return {
        source: source[name].source,
        length: 0,
      };
    }
    let length = 0;
    let regExp = source[name].replace(/<([^>]+)>/g, (str, $1) => {
      this.table.set(start + length, $1);
      ++length;
      let r = this.compileRegExp(source, $1, start + length);
      length += r.length;
      return '(' + r.source + ')';
    });
    return {
      source: regExp,
      length: length,
    };
  }
  exec(string) {
    let r = this.regExp.exec(string);
    for (let i = 1; i < r.length; i++) {
      if (r[i] !== void 0) {
        r[this.table.get(i - 1)] = r[i];
      }
    }
    return r;
  }
  get lastIndex() {
    return this.regExp.lastIndex;
  }
  set lastIndex(value) {
    this.regExp.lastIndex = value;
  }
}
export function* scan(str) {
  let regexp = new XRegExp(regexpMap, 'g', 'InputElement');
  while (regexp.lastIndex < str.length) {
    let r = regexp.exec(str);
    if (r.WhiteSpace) {
    } else if (r.LineTerminator) {
    } else if (r.Comments) {
    } else if (r.NumberLiteral) {
      yield {
        type: 'NumberLiteral',
        value: r[0],
      };
    } else if (r.BooleanLiteral) {
      yield {
        type: 'BooleanLiteral',
        value: r[0],
      };
    } else if (r.StringLiteral) {
      yield {
        type: 'StringLiteral',
        value: r[0],
      };
    } else if (r.Identifier) {
      yield {
        type: 'Identifier',
        name: r[0],
      };
    } else if (r.Keywords) {
      yield {
        type: r[0],
      };
    } else if (r.Punctuator) {
      yield {
        type: r[0],
      };
    } else {
      throw new Error('unexpected token: ' + r[0]);
    }
    if (!r[0].length) {
      break;
    }
  }
  yield {
    type: 'EOF',
  };
}

// let source = `
// /**
//  * @desc 高亮代码
//  *
// */
// function getHightDom(execResult){
//   let content = execResult[0];
//   let colorMap = {
//     Comments: 'green',
//     Literal: 'black',
//     Keywords: 'blue',
//     Identifier:'yellow',
//   }
//   Object.keys(colorMap).forEach((val)=>{
//     if (execResult[val]){
//       content = '<span style="color:"></span>'
//       return false;
//     }
//   })
//   return content;
// }
// `;
// for (let element of scan(source)) {
//   console.log(element);
// }
// module.exports = { scan };
