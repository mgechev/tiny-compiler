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
*/
const lex = str => str.split(' ').map(s => s.trim()).filter(s => s.length);

/*

  # Parser

  The parser is responsible for turing the list of tokens
  into an AST or Abstract Syntax Tree. In the example below
  we use recursive descent parsing to produce the AST
  from the input token array.

  Visually, the parsing is a process which turns the array:

  ```javascript
  const tokens = ["-", "2", "+", "1", "3", "4"];
  ```

  to the following tree:

  ```
    -
   / \
  2   +
    1 3 4
  ```

  The parser uses the following grammar to parse the input token array:

  ```
  num := 0-9
  op := + | - | / | *
  expr := num | op expr* | (expr)
  ```
*/

const Op = Symbol('op');
const Num = Symbol('num');

const opre = /(\+|-|\*|\/)/;
const numre = /[0-9]/;

const parse = tokens => {

  let c = 0;

  const cur = () => tokens[c];
  const next = () => tokens[++c];
  const prev = () => tokens[--c];

  const parseNum = () => {
    const node = { val: parseInt(cur()), type: Num };
    next();
    return node;
  };

  const parseOp = () => {
    const node = { val: cur(), type: Op, expr: [] };
    next();
    while (cur()) node.expr.push(parseExpr());
    return node;
  };

  const parseExpr = () => {
    let node;
    if (numre.test(cur())) {
      node = parseNum();
    } else if (opre.test(cur())) {
      node = parseOp();
    }
    return node;
  };

  return parseExpr();
};

/*

  # Evaluator

  Finally, this is our evaluator. In it we simply visit each node
  from the tree with pre-order traversal and either:

  - Return the corresponding value, in case the node is of type number.
  - Perform the corresponding arithmetic operation, in case of an operation node.

*/
const eval = ast => {
  const reduce = (op, args, init = 0) => args.reduce(op, init);
  const sum = args => reduce((a, b) => b + a, args);
  const sub = args => reduce((a, b) => b - a, args);
  const div = args => reduce((a, b) => b / a, args, 1);
  const mul = args => reduce((a, b) => b * a, args, 1);

  const opAcMap = {
    '+': sum,
    '-': sub,
    '/': div,
    '*': mul
  };

  switch (ast.type) {
    case Num: return ast.val;
    case Op: return opAcMap[ast.val](ast.expr.map(e => eval(e)));
  }
};

/*
  # Interpreter

  In order to interpret the input stream we feed the parser with the input
  from the lexer and the evaluator with the output of the parser.

*/

const program = '* 3 - 2 + 1 3 4';
const ast = parse(lex(program));
console.log(eval(ast));
