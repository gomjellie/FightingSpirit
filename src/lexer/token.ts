export enum TokenType {
  // Keywords
  KEYWORD = 'KEYWORD',
  IDENTIFIER = 'IDENTIFIER',

  // Literals
  INTEGER = 'INTEGER',
  FLOAT = 'FLOAT',
  CHARACTER = 'CHARACTER',
  STRING = 'STRING',

  // Operators
  OPERATOR = 'OPERATOR',
  ASSIGNMENT = 'ASSIGNMENT',

  // Punctuators
  PUNCTUATOR = 'PUNCTUATOR',

  // Special
  COMMENT = 'COMMENT',
  EOF = 'EOF',
}

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export const Keywords = new Set([
  'auto',
  'break',
  'case',
  'char',
  'const',
  'continue',
  'default',
  'do',
  'double',
  'else',
  'enum',
  'extern',
  'float',
  'for',
  'goto',
  'if',
  'int',
  'long',
  'register',
  'return',
  'short',
  'signed',
  'sizeof',
  'static',
  'struct',
  'switch',
  'typedef',
  'union',
  'unsigned',
  'void',
  'volatile',
  'while',
]);

export const Operators = new Set([
  '+',
  '-',
  '*',
  '/',
  '%',
  '++',
  '--',
  '==',
  '!=',
  '<',
  '>',
  '<=',
  '>=',
  '&&',
  '||',
  '!',
  '&',
  '|',
  '^',
  '~',
  '<<',
  '>>',
  '=',
  '+=',
  '-=',
  '*=',
  '/=',
  '%=',
  '<<=',
  '>>=',
  '&=',
  '^=',
  '|=',
]);

export const Punctuators = new Set([
  '{',
  '}',
  '(',
  ')',
  '[',
  ']',
  '.',
  ',',
  ';',
  ':',
  '...',
  '->',
]);
