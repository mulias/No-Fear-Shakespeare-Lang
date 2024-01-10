import * as fs from 'fs';
import Compiler from './horatio/compiler';
import Parser  from './horatio/parser';

const io = {
  print: (d: any) => process.stdout.write(`${d}`)
};

const compiler = new Compiler(io);

const input = fs.readFileSync('examples/hi.spl', 'utf8');

let parser = new Parser(input);

console.log(JSON.stringify(parser.parse(), null, 4));

// const program = compiler.compile(input);

// program.run();

