import { CLexer } from './lexer';
import { TokenType } from './token';

describe('CLexer', () => {
  describe('keywords and identifiers', () => {
    test('recognizes keywords', () => {
      const lexer = new CLexer('int void return if else while');
      const tokens = lexer.tokenize();
      expect(
        tokens.slice(0, -1).every((t) => t.type === TokenType.KEYWORD)
      ).toBe(true);
      expect(tokens.map((t) => t.value)).toEqual([
        'int',
        'void',
        'return',
        'if',
        'else',
        'while',
        '',
      ]);
    });

    test('recognizes identifiers', () => {
      const lexer = new CLexer('main foo bar123 _test');
      const tokens = lexer.tokenize();
      expect(
        tokens.slice(0, -1).every((t) => t.type === TokenType.IDENTIFIER)
      ).toBe(true);
      expect(tokens.map((t) => t.value)).toEqual([
        'main',
        'foo',
        'bar123',
        '_test',
        '',
      ]);
    });
  });

  describe('literals', () => {
    test('recognizes integer literals', () => {
      const lexer = new CLexer('123 0 42');
      const tokens = lexer.tokenize();
      expect(
        tokens.slice(0, -1).every((t) => t.type === TokenType.INTEGER)
      ).toBe(true);
      expect(tokens.map((t) => t.value)).toEqual(['123', '0', '42', '']);
    });

    test('recognizes float literals', () => {
      const lexer = new CLexer('3.14 0.5 42.0');
      const tokens = lexer.tokenize();
      expect(tokens.slice(0, -1).every((t) => t.type === TokenType.FLOAT)).toBe(
        true
      );
      expect(tokens.map((t) => t.value)).toEqual(['3.14', '0.5', '42.0', '']);
    });

    test('recognizes string literals', () => {
      const lexer = new CLexer('"hello" "world" "\\n"');
      const tokens = lexer.tokenize();
      expect(
        tokens.slice(0, -1).every((t) => t.type === TokenType.STRING)
      ).toBe(true);
      expect(tokens.map((t) => t.value)).toEqual(['hello', 'world', '\\n', '']);
    });

    test('recognizes character literals', () => {
      const lexer = new CLexer("'a' '\\n' '\\t'");
      const tokens = lexer.tokenize();
      expect(
        tokens.slice(0, -1).every((t) => t.type === TokenType.CHARACTER)
      ).toBe(true);
      expect(tokens.map((t) => t.value)).toEqual(['a', '\\n', '\\t', '']);
    });
  });

  describe('operators and punctuators', () => {
    test('recognizes arithmetic operators', () => {
      const lexer = new CLexer('+ - * / %');
      const tokens = lexer.tokenize();
      expect(
        tokens.slice(0, -1).every((t) => t.type === TokenType.OPERATOR)
      ).toBe(true);
      expect(tokens.map((t) => t.value)).toEqual(['+', '-', '*', '/', '%', '']);
    });

    test('recognizes compound assignment operators', () => {
      const lexer = new CLexer('+= -= *= /= %=');
      const tokens = lexer.tokenize();
      expect(
        tokens.slice(0, -1).every((t) => t.type === TokenType.OPERATOR)
      ).toBe(true);
      expect(tokens.map((t) => t.value)).toEqual([
        '+=',
        '-=',
        '*=',
        '/=',
        '%=',
        '',
      ]);
    });

    test('recognizes comparison operators', () => {
      const lexer = new CLexer('== != < > <= >=');
      const tokens = lexer.tokenize();
      expect(
        tokens.slice(0, -1).every((t) => t.type === TokenType.OPERATOR)
      ).toBe(true);
      expect(tokens.map((t) => t.value)).toEqual([
        '==',
        '!=',
        '<',
        '>',
        '<=',
        '>=',
        '',
      ]);
    });

    test('recognizes logical operators', () => {
      const lexer = new CLexer('&& || !');
      const tokens = lexer.tokenize();
      expect(
        tokens.slice(0, -1).every((t) => t.type === TokenType.OPERATOR)
      ).toBe(true);
      expect(tokens.map((t) => t.value)).toEqual(['&&', '||', '!', '']);
    });

    test('recognizes bitwise operators', () => {
      const lexer = new CLexer('& | ^ ~ << >>');
      const tokens = lexer.tokenize();
      expect(
        tokens.slice(0, -1).every((t) => t.type === TokenType.OPERATOR)
      ).toBe(true);
      expect(tokens.map((t) => t.value)).toEqual([
        '&',
        '|',
        '^',
        '~',
        '<<',
        '>>',
        '',
      ]);
    });

    test('recognizes punctuators', () => {
      const lexer = new CLexer('{ } ( ) [ ] . , ; : -> ...');
      const tokens = lexer.tokenize();
      expect(
        tokens.slice(0, -1).every((t) => t.type === TokenType.PUNCTUATOR)
      ).toBe(true);
      expect(tokens.map((t) => t.value)).toEqual([
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
        '->',
        '...',
        '',
      ]);
    });
  });

  describe('comments', () => {
    test('recognizes line comments', () => {
      const lexer = new CLexer('// This is a line comment\n');
      const tokens = lexer.tokenize();
      expect(tokens[0].type).toBe(TokenType.COMMENT);
      expect(tokens[0].value).toBe(' This is a line comment');
    });

    test('recognizes block comments', () => {
      const lexer = new CLexer('/* This is a\nblock comment */');
      const tokens = lexer.tokenize();
      expect(tokens[0].type).toBe(TokenType.COMMENT);
      expect(tokens[0].value).toBe(' This is a\nblock comment ');
    });
  });

  describe('complex code', () => {
    test('tokenizes function declaration', () => {
      const code = `int main(void) {\n  return 0;\n}`;
      const lexer = new CLexer(code);
      const tokens = lexer.tokenize();
      expect(tokens.map((t) => t.value)).toEqual([
        'int',
        'main',
        '(',
        'void',
        ')',
        '{',
        'return',
        '0',
        ';',
        '}',
        '',
      ]);
    });

    test('tokenizes variable declaration and initialization', () => {
      const code = 'int x = 42, y = 3.14;';
      const lexer = new CLexer(code);
      const tokens = lexer.tokenize();
      expect(tokens.map((t) => t.value)).toEqual([
        'int',
        'x',
        '=',
        '42',
        ',',
        'y',
        '=',
        '3.14',
        ';',
        '',
      ]);
    });

    test('tokenizes if statement with comparison', () => {
      const code = 'if (x > 0 && y <= 10) { z += x; }';
      const lexer = new CLexer(code);
      const tokens = lexer.tokenize();
      expect(tokens.map((t) => t.value)).toEqual([
        'if',
        '(',
        'x',
        '>',
        '0',
        '&&',
        'y',
        '<=',
        '10',
        ')',
        '{',
        'z',
        '+=',
        'x',
        ';',
        '}',
        '',
      ]);
    });
  });

  describe('line and column tracking', () => {
    test('tracks line numbers correctly', () => {
      const code = 'int\nx\n=\n42;';
      const lexer = new CLexer(code);
      const tokens = lexer.tokenize();
      expect(tokens.slice(0, -1).map((t) => t.line)).toEqual([1, 2, 3, 4, 4]);
    });

    test('tracks column numbers correctly', () => {
      const code = 'int x = 42;';
      const lexer = new CLexer(code);
      const tokens = lexer.tokenize();
      expect(tokens.slice(0, -1).map((t) => t.column)).toEqual([
        1, 5, 7, 9, 11,
      ]);
    });
  });
});
