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

  The parser is responsible for turing the list of tokens
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
  num := 0-9
  op := sum | sub | div | mul
  expr := num | op expr+
  ```
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
The AST generated is stored in `parse` variable in the form of a javascript object:
parse = {
	val: 'mul',
	type: Op,
	expr: [
		{
			val: '3',
			type: Num
		},
		{
			val: 'sub',
			type: Op,
			expr: [
				{
					val: '2',
					type: Num
				},
				{
					val: 'sum',
					type: Op,
					expr: [
						{
							val: '1',
							type: Num
						},
						{
							val: '2',
							type: Num
						},
						{
							val: '3',
							type: Num
						}
					]
				}
			]
		}
	]
};
*/

/*
  # Evaluator

  Finally, this is our evaluator. In it we simply visit each node
  from the tree with pre-order traversal and either:

  - Return the corresponding value, in case the node is of type number.
  - Perform the corresponding arithmetic operation, in case of an operation node.
*/
const eval = ast => {
  const opAcMap = {
    sum: args => args.reduce((a, b) => a + b, 0),
    sub: args => args.reduce((a, b) => a - b),
    div: args => args.reduce((a, b) => a / b),
    mul: args => args.reduce((a, b) => a * b, 1)
  };

  if (ast.type === Num) return ast.val;
  return opAcMap[ast.val](ast.expr.map(eval));
};

/*
  # Code generator

  Alternatively, instead of interpreting the AST, we can translate
  it to another language. Here's how we can do that with JavaScript.
*/
const transpile = ast => {
  const opMap = { sum: '+', mul: '*', sub: '-', div: '/' };
  const transpileNum = ast => ast.val;
  const transpileOp = ast => `(${ast.expr.map(transpile).join(' ' + opMap[ast.val] + ' ')})`;
  const transpile = ast => ast.type === Num ? transpileNum(ast) : transpileOp(ast);
  return transpile(ast);
};

const program = 'mul 3 sub 2 sum 1 3 4';

/*
  # Interpreter

  In order to interpret the input stream we feed the parser with the input
  from the lexer and the evaluator with the output of the parser.
*/
console.log(eval(parse(lex(program))));

/*
  # Transpiler

  In order to transpile the expression to JavaScript, the only change we need to make
  is to update the outermost `eval` invocation to `transpile`.
*/
console.log(transpile(parse(lex(program))));

