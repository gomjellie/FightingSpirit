import { CParser } from './parser';
import { Token, TokenType } from '../lexer/token';
import assert from 'node:assert';

describe('CParser', () => {
  describe('Basic Declarations', () => {
    it('should parse a simple variable declaration', () => {
      const tokens = [
        { type: TokenType.KEYWORD, value: 'int' },
        { type: TokenType.IDENTIFIER, value: 'x' },
        { type: TokenType.PUNCTUATOR, value: ';' },
        { type: TokenType.EOF, value: 'EOF' },
      ];
      const parser = new CParser(tokens as Token[]);
      const program = parser.parse();

      expect(program.declarations[0]).toMatchObject({
        type: 'Declaration',
        specifiers: [{ type: 'TypeSpecifier', specifier: 'int' }],
        declarators: [
          {
            type: 'InitDeclarator',
            declarator: {
              type: 'Declarator',
              directDeclarator: { type: 'DirectDeclarator', identifier: 'x' },
            },
          },
        ],
      });
    });

    it('should parse multiple variable declarations', () => {
      const tokens = [
        { type: TokenType.KEYWORD, value: 'int' },
        { type: TokenType.IDENTIFIER, value: 'x' },
        { type: TokenType.PUNCTUATOR, value: ',' },
        { type: TokenType.IDENTIFIER, value: 'y' },
        { type: TokenType.PUNCTUATOR, value: ';' },
        { type: TokenType.EOF, value: 'EOF' },
      ];
      const parser = new CParser(tokens as Token[]);
      const program = parser.parse();

      assert(program.declarations[0].type === 'Declaration');
      expect(program.declarations[0].declarators).toHaveLength(2);
    });
  });

  describe('Function Declarations', () => {
    it('should parse a simple function declaration', () => {
      const tokens = [
        { type: TokenType.KEYWORD, value: 'void' },
        { type: TokenType.IDENTIFIER, value: 'test' },
        { type: TokenType.PUNCTUATOR, value: '(' },
        { type: TokenType.PUNCTUATOR, value: ')' },
        { type: TokenType.PUNCTUATOR, value: '{' },
        { type: TokenType.PUNCTUATOR, value: '}' },
        { type: TokenType.EOF, value: 'EOF' },
      ];
      const parser = new CParser(tokens as Token[]);
      const program = parser.parse();

      expect(program.declarations[0]).toMatchObject({
        type: 'FunctionDefinition',
        specifiers: [{ type: 'TypeSpecifier', specifier: 'void' }],
        declarator: {
          type: 'Declarator',
          directDeclarator: { type: 'DirectDeclarator', identifier: 'test' },
        },
      });
    });

    it('should parse function with parameters', () => {
      const tokens = [
        { type: TokenType.KEYWORD, value: 'int' },
        { type: TokenType.IDENTIFIER, value: 'add' },
        { type: TokenType.PUNCTUATOR, value: '(' },
        { type: TokenType.KEYWORD, value: 'int' },
        { type: TokenType.IDENTIFIER, value: 'a' },
        { type: TokenType.PUNCTUATOR, value: ',' },
        { type: TokenType.KEYWORD, value: 'int' },
        { type: TokenType.IDENTIFIER, value: 'b' },
        { type: TokenType.PUNCTUATOR, value: ')' },
        { type: TokenType.PUNCTUATOR, value: '{' },
        { type: TokenType.PUNCTUATOR, value: '}' },
        { type: TokenType.EOF, value: 'EOF' },
      ];
      const parser = new CParser(tokens as Token[]);
      const program = parser.parse();

      assert(program.declarations[0].type === 'FunctionDefinition');
      expect(
        program.declarations[0].declarator?.directDeclarator.parameters
          ?.parameters
      ).toHaveLength(2);
    });
  });

  describe('Type Specifiers', () => {
    it('should parse struct declaration', () => {
      const tokens = [
        { type: TokenType.KEYWORD, value: 'struct' },
        { type: TokenType.IDENTIFIER, value: 'Point' },
        { type: TokenType.PUNCTUATOR, value: '{' },
        { type: TokenType.KEYWORD, value: 'int' },
        { type: TokenType.IDENTIFIER, value: 'x' },
        { type: TokenType.PUNCTUATOR, value: ';' },
        { type: TokenType.KEYWORD, value: 'int' },
        { type: TokenType.IDENTIFIER, value: 'y' },
        { type: TokenType.PUNCTUATOR, value: ';' },
        { type: TokenType.PUNCTUATOR, value: '}' },
        { type: TokenType.PUNCTUATOR, value: ';' },
        { type: TokenType.EOF, value: 'EOF' },
      ];
      const parser = new CParser(tokens as Token[]);
      const program = parser.parse();

      expect(program.declarations[0].specifiers[0]).toMatchObject({
        type: 'TypeSpecifier',
        specifier: {
          type: 'StructOrUnionSpecifier',
          kind: 'struct',
          identifier: 'Point',
        },
      });
    });

    it('should parse enum declaration', () => {
      const tokens = [
        { type: TokenType.KEYWORD, value: 'enum' },
        { type: TokenType.IDENTIFIER, value: 'Color' },
        { type: TokenType.PUNCTUATOR, value: '{' },
        { type: TokenType.IDENTIFIER, value: 'RED' },
        { type: TokenType.PUNCTUATOR, value: ',' },
        { type: TokenType.IDENTIFIER, value: 'GREEN' },
        { type: TokenType.PUNCTUATOR, value: ',' },
        { type: TokenType.IDENTIFIER, value: 'BLUE' },
        { type: TokenType.PUNCTUATOR, value: '}' },
        { type: TokenType.PUNCTUATOR, value: ';' },
        { type: TokenType.EOF, value: 'EOF' },
      ];
      const parser = new CParser(tokens as Token[]);
      const program = parser.parse();

      assert(program.declarations[0].specifiers[0].type === 'TypeSpecifier');
      assert(
        typeof program.declarations[0].specifiers[0].specifier === 'object'
      );
      assert(
        program.declarations[0].specifiers[0].specifier.type === 'EnumSpecifier'
      );
      expect(
        program.declarations[0].specifiers[0].specifier.enumerators
      ).toHaveLength(3);
    });
  });

  describe('Error Handling', () => {
    it('should throw error on missing semicolon', () => {
      const tokens = [
        { type: TokenType.KEYWORD, value: 'int' },
        { type: TokenType.IDENTIFIER, value: 'x' },
        { type: TokenType.EOF, value: 'EOF' },
      ];
      const parser = new CParser(tokens as Token[]);

      expect(() => parser.parse()).toThrow();
    });

    it('should throw error on invalid function declaration', () => {
      const tokens = [
        { type: TokenType.KEYWORD, value: 'void' },
        { type: TokenType.IDENTIFIER, value: 'test' },
        { type: TokenType.PUNCTUATOR, value: '(' },
        { type: TokenType.KEYWORD, value: 'invalid' },
        { type: TokenType.PUNCTUATOR, value: ')' },
        { type: TokenType.PUNCTUATOR, value: '{' },
        { type: TokenType.PUNCTUATOR, value: '}' },
        { type: TokenType.EOF, value: 'EOF' },
      ];
      const parser = new CParser(tokens as Token[]);

      expect(() => parser.parse()).toThrow();
    });
  });
});
