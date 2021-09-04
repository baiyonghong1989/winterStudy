module.exports = {
  // 单行宽度，参考规范3.3，建议5的值120
  printWidth: 120,
  // 使用tab键缩减的空格数，参考规范3.2规则15使用2个空格
  tabWidth: 2,
  // 不使用tab使用空格缩进，参考规范3.2规则15不允许插入制表符
  useTabs: false,
  // 句尾添加分号，参考规范3.7建议16
  semi: true,
  // 使用单引号，参考规范7.2建议36
  singleQuote: true,
  // 对象属性的引号使用，consistent为有一个属性需要引号就都需要引号。as-needed仅在需要的时候使用.参考规范7.4建议40
  quoteProps: 'as-needed',
  // jsx 不使用单引号，而使用双引号
  jsxSingleQuote: false,
  // 对象或者数组最后一个元素加逗号.[1,2,3,],参考规范3.7建议15
  trailingComma: 'all',
  // 在对象字面量声明所使用的的花括号后（{）和前（}）输出空格,参考规范3.5建议13
  bracketSpacing: true,
  // jsx 标签的反尖括号需要换行
  jsxBracketSameLine: false,
  // 只有一个参数的箭头函数的参数默认不带圆括号，参考规范6.3规则31
  arrowParens: 'always',
  // 每个文件格式化的范围是文件的全部内容
  rangeStart: 0,
  rangeEnd: Infinity,
  // 不需要写文件开头的 @prettier
  requirePragma: false,
  // 不需要自动在文件开头插入 @prettier
  insertPragma: false,
  // 使用默认的折行标准
  proseWrap: 'preserve',
  // 根据显示样式决定 html 要不要折行
  htmlWhitespaceSensitivity: 'css',
  // vue 文件中的 script 和 style 内使用缩进
  vueIndentScriptAndStyle: true,
  // 换行符使用 auto
  endOfLine: 'auto',
  // 格式化嵌入的内容
  embeddedLanguageFormatting: 'auto',
};
