import { Evaluator } from './evaluator.js';
import { parse } from './syntaxParser.js';

let source = `
 a = {b:3};
 a.b;
`;
let tree = parse(source);
let evaluate = new Evaluator();
console.log(evaluate.evaluate(tree));
