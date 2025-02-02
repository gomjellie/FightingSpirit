import { CParser } from './parser';
import { Token, TokenType } from '../lexer/token';
import assert from 'node:assert';

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

  it('should parse function with parameter(int argc, char** argv)', () => {
    const tokens = [
      { type: TokenType.KEYWORD, value: 'int' },
      { type: TokenType.IDENTIFIER, value: 'main' },
      { type: TokenType.PUNCTUATOR, value: '(' },
      { type: TokenType.KEYWORD, value: 'int' },
      { type: TokenType.IDENTIFIER, value: 'argc' },
      { type: TokenType.PUNCTUATOR, value: ',' },
      { type: TokenType.KEYWORD, value: 'char' },
      { type: TokenType.PUNCTUATOR, value: '*' },
      { type: TokenType.PUNCTUATOR, value: '*' },
      { type: TokenType.IDENTIFIER, value: 'argv' },
      { type: TokenType.PUNCTUATOR, value: ')' },
      { type: TokenType.PUNCTUATOR, value: '{' },
      { type: TokenType.PUNCTUATOR, value: '}' },
      { type: TokenType.EOF, value: 'EOF' },
    ];

    const parser = new CParser(tokens as Token[]);
    const program = parser.parse();
    expect(program.declarations[0]).toMatchObject({
      type: 'FunctionDefinition',
      specifiers: [{ type: 'TypeSpecifier', specifier: 'int' }],
      declarator: {
        type: 'Declarator',
        directDeclarator: {
          type: 'DirectDeclarator',
          identifier: 'main',
          parameters: {
            type: 'ParameterTypeList',
            parameters: [
              {
                type: 'ParameterDeclaration',
                specifiers: [{ type: 'TypeSpecifier', specifier: 'int' }],
                declarator: {
                  type: 'Declarator',
                  directDeclarator: {
                    type: 'DirectDeclarator',
                    identifier: 'argc',
                  },
                },
              },
              {
                type: 'ParameterDeclaration',
                specifiers: [{ type: 'TypeSpecifier', specifier: 'char' }],
                declarator: {
                  type: 'Declarator',
                  pointer: { type: 'Pointer', qualifiers: [] },
                  directDeclarator: {
                    type: 'DirectDeclarator',
                    identifier: 'argv',
                  },
                },
              },
            ],
          },
        },
      },
    });
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
    assert(typeof program.declarations[0].specifiers[0].specifier === 'object');
    assert(
      program.declarations[0].specifiers[0].specifier.type === 'EnumSpecifier'
    );
    expect(
      program.declarations[0].specifiers[0].specifier.enumerators
    ).toHaveLength(3);
  });
});

describe('Pointers', () => {
  it('should parse pointer declaration', () => {
    const tokens = [
      { type: TokenType.KEYWORD, value: 'int' },
      { type: TokenType.PUNCTUATOR, value: '*' },
      { type: TokenType.IDENTIFIER, value: 'ptr' },
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
            pointer: { type: 'Pointer', qualifiers: [] },
            directDeclarator: { type: 'DirectDeclarator', identifier: 'ptr' },
          },
        },
      ],
    });
  });

  it('should parse double pointer declaration', () => {
    const tokens = [
      { type: TokenType.KEYWORD, value: 'int' },
      { type: TokenType.PUNCTUATOR, value: '*' },
      { type: TokenType.PUNCTUATOR, value: '*' },
      { type: TokenType.IDENTIFIER, value: 'doublePtr' },
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
            pointer: {
              type: 'Pointer',
              qualifiers: [],
              pointer: { type: 'Pointer', qualifiers: [] },
            },
            directDeclarator: {
              type: 'DirectDeclarator',
              identifier: 'doublePtr',
            },
          },
        },
      ],
    });
  });
});

describe('Loop Statements', () => {
  it('should parse for loop', () => {
    const tokens = [
      { type: TokenType.KEYWORD, value: 'void' },
      { type: TokenType.IDENTIFIER, value: 'test' },
      { type: TokenType.PUNCTUATOR, value: '(' },
      { type: TokenType.PUNCTUATOR, value: ')' },
      { type: TokenType.PUNCTUATOR, value: '{' },
      { type: TokenType.KEYWORD, value: 'for' },
      { type: TokenType.PUNCTUATOR, value: '(' },
      { type: TokenType.KEYWORD, value: 'int' },
      { type: TokenType.IDENTIFIER, value: 'i' },
      { type: TokenType.OPERATOR, value: '=' },
      { type: TokenType.INTEGER, value: '0' },
      { type: TokenType.PUNCTUATOR, value: ';' },
      { type: TokenType.IDENTIFIER, value: 'i' },
      { type: TokenType.OPERATOR, value: '<' },
      { type: TokenType.INTEGER, value: '10' },
      { type: TokenType.PUNCTUATOR, value: ';' },
      { type: TokenType.IDENTIFIER, value: 'i' },
      { type: TokenType.OPERATOR, value: '++' },
      { type: TokenType.PUNCTUATOR, value: ')' },
      { type: TokenType.PUNCTUATOR, value: '{' },
      { type: TokenType.PUNCTUATOR, value: '}' },
      { type: TokenType.PUNCTUATOR, value: '}' },
      { type: TokenType.EOF, value: 'EOF' },
    ];
    const parser = new CParser(tokens as Token[]);
    const program = parser.parse();

    assert(program.declarations[0].type === 'FunctionDefinition');
    expect(program.declarations[0].body.statements[0]).toMatchObject({
      type: 'IterationStatement',
      kind: 'for',
      initialization: expect.any(Object),
      condition: expect.any(Object),
      update: expect.any(Object),
    });
  });

  it('should parse while loop', () => {
    const tokens = [
      { type: TokenType.KEYWORD, value: 'void' },
      { type: TokenType.IDENTIFIER, value: 'test' },
      { type: TokenType.PUNCTUATOR, value: '(' },
      { type: TokenType.PUNCTUATOR, value: ')' },
      { type: TokenType.PUNCTUATOR, value: '{' },
      { type: TokenType.KEYWORD, value: 'while' },
      { type: TokenType.PUNCTUATOR, value: '(' },
      { type: TokenType.INTEGER, value: '1' },
      { type: TokenType.PUNCTUATOR, value: ')' },
      { type: TokenType.PUNCTUATOR, value: '{' },
      { type: TokenType.PUNCTUATOR, value: '}' },
      { type: TokenType.PUNCTUATOR, value: '}' },
      { type: TokenType.EOF, value: 'EOF' },
    ];
    const parser = new CParser(tokens as Token[]);
    const program = parser.parse();

    assert(program.declarations[0].type === 'FunctionDefinition');
    expect(program.declarations[0].body.statements[0]).toMatchObject({
      type: 'IterationStatement',
      kind: 'while',
      condition: expect.any(Object),
    });
  });

  it('should parse do-while loop', () => {
    const tokens = [
      { type: TokenType.KEYWORD, value: 'void' },
      { type: TokenType.IDENTIFIER, value: 'test' },
      { type: TokenType.PUNCTUATOR, value: '(' },
      { type: TokenType.PUNCTUATOR, value: ')' },
      { type: TokenType.PUNCTUATOR, value: '{' },
      { type: TokenType.KEYWORD, value: 'do' },
      { type: TokenType.PUNCTUATOR, value: '{' },
      { type: TokenType.PUNCTUATOR, value: '}' },
      { type: TokenType.KEYWORD, value: 'while' },
      { type: TokenType.PUNCTUATOR, value: '(' },
      { type: TokenType.INTEGER, value: '1' },
      { type: TokenType.PUNCTUATOR, value: ')' },
      { type: TokenType.PUNCTUATOR, value: ';' },
      { type: TokenType.PUNCTUATOR, value: '}' },
      { type: TokenType.EOF, value: 'EOF' },
    ];
    const parser = new CParser(tokens as Token[]);
    const program = parser.parse();

    assert(program.declarations[0].type === 'FunctionDefinition');
    expect(program.declarations[0].body.statements[0]).toMatchObject({
      type: 'IterationStatement',
      kind: 'do-while',
      condition: expect.any(Object),
    });
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
