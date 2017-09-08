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
  only the token's value. Later, we can infer the type based on
  regular expressions defined below.

*/

const lex = str => str.split(' ').map(s => s.trim()).filter(s => s.length);

/*

  # Parser

  The parser is responsible for turing the list of tokens
  into an AST or Abstract Syntax Tree. In the example below
  we use recursive descent parsing to produce the AST
  from the input token array.

  Visually, parsing is a process which will turn the token array:

  ```javascript
  const tokens = ["-", "2", "+", "1", "3", "4"];
  ```

  into the following tree:

  ```
    -
   / \
  2   +
    1 3 4
  ```

  This parser uses the following grammar to parse the input token array:

  ```
  num := 0-9
  op := + | - | / | *
  expr := num | op expr* | (expr)
  ```

  For details see https://en.wikipedia.org/wiki/Backus%E2%80%93Naur_form.

*/

const Op = Symbol('op');
const Num = Symbol('num');

class NumNode {
  constructor(val) {
    this.type = Num;
    this.val = val;
  }
}

class OpNode {
  constructor(val, expr) {
    this.val = val;
    this.type = Op;
    this.expr = expr;
  }
}

const opre = /(\+|-|\*|\/)/;
const numre = /[0-9]/;

const parse = tokens => {

  let c = 0;

  const cur = () => tokens[c];
  const next = () => tokens[++c];
  const prev = () => tokens[--c];

  const parseNum = () => {
    const node = new NumNode(parseInt(cur()))
    next();
    return node;
  };

  const parseOp = () => {
    const op = cur();
    const node = new OpNode(op, []);
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

  The evaluator visits each node from the tree with pre-order
  traversal and either:

  - Return the corresponding value, in case the node is of type number.
  - Perform the corresponding arithmetic operation, in case of a `OpNode`.

*/

const eval = ast => {
  const reduce = (op, args) => args.reduce((p, c) => op(p, c), 0);
  const sum = args => reduce((a, b) => b + a, args);
  const sub = args => reduce((a, b) => b - a, args);
  const div = args => reduce((a, b) => b / a, args);
  const mul = args => reduce((a, b) => b * a, args);

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

  In order to interpret the input string we feed the parser with the output
  from the lexer and the evaluator with the output of the parser.

*/

const program = '- 2 + 1 3 4';
const ast = parse(lex(program));
console.log(eval(ast));

