/*
  # Lexer

  The lexer is responsible for turning the input string into
  a list of tokens. Usually a token looks the following way:

  ```javascript
  {
    "type": Symbol("Operator"),
    "value: "-"
  }
  ```

  In our case we're keeping everything simplified and store
  only the token's value. We can infer the type based on
  regular expressions defined below.

  In short, `lex` will turn the following expression:

  ```
  mul 3 sub 2 sum 1 3 4
  ```

  To the following array:

  ```
  ["mul", "3", "sub", "2", "sum", "1", "3", "4"]
  ```
*/
const lex = str => str.split(' ').map(s => s.trim()).filter(s => s.length);

/*
  # Parser

  The parser is responsible for turning the list of tokens
  into an AST or Abstract Syntax Tree. In the example below
  we use recursive descent parsing to produce the AST
  from the input token array.

  Visually, the parsing is a process which turns the array:

  ```javascript
  const tokens = ["sub", "2", "sum", "1", "3", "4"];
  ```

  to the following tree:

  ```
   sub
   / \
  2  sum
     /|\
    1 3 4
  ```

  The parser uses the following grammar to parse the input token array:

  ```
  num := 0-9+
  op := sum | sub | div | mul
  expr := num | op expr+
  ```

  This translated to plain English, means:
  - `num` can be any sequence of the numbers between 0 and 9.
  - `op` can be any of `sum`, `sub`, `div`, `mul`.
  - `expr` can be either a number (i.e. `num`) or an operation followed by one or more `expr`s.

  Notice that `expr` has a recursive declaration.
*/

const Op = Symbol('op');
const Num = Symbol('num');

const parse = tokens => {

  let c = 0;

  const peek = () => tokens[c];
  const consume = () => tokens[c++];

  const parseNum = () => ({ val: parseInt(consume()), type: Num });

  const parseOp = () => {
    const node = { val: consume(), type: Op, expr: [] };
    while (peek()) node.expr.push(parseExpr());
    return node;
  };

  const parseExpr = () => /\d/.test(peek()) ? parseNum() : parseOp();

  return parseExpr();
};

/*
  # Evaluator

  Finally, this is our evaluator. In it we simply visit each node
  from the tree with pre-order traversal and either:

  - Return the corresponding value, in case the node is of type number.
  - Perform the corresponding arithmetic operation, in case of an operation node.
*/
const evaluate = ast => {
  const opAcMap = {
    sum: args => args.reduce((a, b) => a + b, 0),
    sub: args => args.reduce((a, b) => a - b),
    div: args => args.reduce((a, b) => a / b),
    mul: args => args.reduce((a, b) => a * b, 1)
  };

  if (ast.type === Num) return ast.val;
  return opAcMap[ast.val](ast.expr.map(evaluate));
};

/*
  # Code generator

  Alternatively, instead of interpreting the AST, we can translate
  it to another language. Here's how we can do that with JavaScript.
*/
const compile = ast => {
  const opMap = { sum: '+', mul: '*', sub: '-', div: '/' };
  const compileNum = ast => ast.val;
  const compileOp = ast => `(${ast.expr.map(compile).join(' ' + opMap[ast.val] + ' ')})`;
  const compile = ast => ast.type === Num ? compileNum(ast) : compileOp(ast);
  return compile(ast);
};

const program = 'mul 3 sub 2 sum 1 3 4';

/*
  # Interpreter

  In order to interpret the input stream we feed the parser with the input
  from the lexer and the evaluator with the output of the parser.
*/
console.log(evaluate(parse(lex(program))));

/*
  # Compiler

  In order to compile the expression to JavaScript, the only change we need to make
  is to update the outermost `evaluate` invocation to `compile`.
*/
console.log(compile(parse(lex(program))));

