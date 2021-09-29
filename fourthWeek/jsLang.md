inputElement :: = WhiteSpace | LineTerminator | Comment | Token

WhiteSpace ::= " " | "　"
LineTerminator ::= "\n" | "\r"
Comment :: = SingleLienComment | MultilineComment
SingleLineComment ::= "/" "/" <any>*
MultilineComment ::= "/" "*" ([^*] | "*" [^/])* "*" "/"
Token :: = Literal | Keywords | Identifier | Punctuator


Literal ::= NumberLiteral | BooleanLiteral | StringLiteral | NullLiteral
Keywords ::= "if" | 'else' | "for" | "function" | "let" | "var" | ...
Punctuator = "+" | "_" | "/" | "{" | "}" | ...
Identifier :: <变量>

Program ::= Statement+
<!-- 顺序、分支、循环 结构化程序设计的三种结构 -->
Statement ::= ExpressionStatement | IfStatement 
    | ForStatement | WhileStatement | VariableDeclation 
    | FunctionDeclation | ClassDeclation | BreakStatement 
    |  ContinueStatement | ReturnStatement | ThrowStatement | TryStatement

ExpressionStatement ::= Expression ";"
Expression ::= AddtiveExpression
AddtiveExpression ::= MultiplicativeExpression | AddtiveExpression ("+" | "-") MultiplicativeExpression
MultiplicativeExpression ::= 
