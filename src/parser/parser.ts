import { Token, TokenType } from '../lexer/token';
import {
  Program,
  ExternalDeclaration,
  FunctionDefinition,
  Declaration,
  DeclarationSpecifier,
  StorageClassSpecifier,
  TypeSpecifier,
  TypeQualifier,
  StructOrUnionSpecifier,
  StructDeclaration,
  StructDeclarator,
  EnumSpecifier,
  Enumerator,
  Declarator,
  Pointer,
  DirectDeclarator,
  ParameterTypeList,
  ParameterDeclaration,
  AbstractDeclarator,
  DirectAbstractDeclarator,
  InitDeclarator,
  Initializer,
  InitializerList,
  CompoundStatement,
  Statement,
  LabeledStatement,
  ExpressionStatement,
  SelectionStatement,
  IterationStatement,
  JumpStatement,
  Expression,
  Position,
  SourceLocation,
} from './types';

export class CParser {
  private tokens: Token[];
  private position: number;
  private currentToken: Token;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.position = 0;
    this.currentToken = tokens[0];
  }

  private advance(): boolean {
    this.position++;
    this.currentToken =
      this.position < this.tokens.length
        ? this.tokens[this.position]
        : this.tokens[this.tokens.length - 1];
    return this.currentToken.type !== TokenType.EOF;
  }

  private peek(offset: number = 1): Token | undefined {
    const peekPosition = this.position + offset;
    return peekPosition < this.tokens.length
      ? this.tokens[peekPosition]
      : undefined;
  }

  private match(value: string): boolean {
    if (this.currentToken.value === value) {
      this.advance();
      return true;
    }
    return false;
  }

  private expect(type: TokenType, value?: string): Token {
    const token = this.currentToken;
    if (token.type !== type || (value && token.value !== value)) {
      throw new Error(`Expected ${value || type}, got ${token.value}`);
    }
    this.advance();
    return token;
  }

  private createLocation(start: Position, end: Position): SourceLocation {
    return { start, end };
  }

  public parse(): Program {
    const declarations: ExternalDeclaration[] = [];
    while (this.currentToken.type !== TokenType.EOF) {
      const declaration = this.parseExternalDeclaration();
      if (declaration) {
        declarations.push(declaration);
      }
    }
    return { type: 'Program', declarations };
  }

  private parseExternalDeclaration(): ExternalDeclaration {
    const specifiers = this.parseDeclarationSpecifiers();

    // Check if this is a declaration without declarators
    if (this.currentToken.value === ';') {
      this.advance();
      return {
        type: 'Declaration',
        specifiers,
        declarators: [],
      };
    }

    const declarator = this.parseDeclarator();

    // If we see a comma or semicolon, this is a declaration
    if (this.currentToken.value === ',' || this.currentToken.value === ';') {
      const declarators = [
        { type: 'InitDeclarator', declarator } as InitDeclarator,
      ];

      while (this.currentToken.value === ',') {
        this.advance();
        declarators.push({
          type: 'InitDeclarator',
          declarator: this.parseDeclarator(),
        });
      }

      this.expect(TokenType.PUNCTUATOR, ';');

      return {
        type: 'Declaration',
        specifiers,
        declarators,
      };
    }

    // If we see an opening brace, this is a function definition
    if (this.currentToken.value === '{') {
      const body = this.parseCompoundStatement();

      return {
        type: 'FunctionDefinition',
        specifiers,
        declarator,
        declarations: [],
        body,
      };
    }

    throw new Error(`Unexpected token: ${this.currentToken.value}`);
  }

  private parseDeclarationSpecifiers(): DeclarationSpecifier[] {
    const specifiers: DeclarationSpecifier[] = [];
    while (true) {
      if (this.isStorageClassSpecifier()) {
        specifiers.push(this.parseStorageClassSpecifier());
      } else if (this.isTypeSpecifier()) {
        specifiers.push(this.parseTypeSpecifier());
      } else if (this.isTypeQualifier()) {
        specifiers.push(this.parseTypeQualifier());
      } else {
        break;
      }
    }
    return specifiers;
  }

  private isStorageClassSpecifier(): boolean {
    const value = this.currentToken.value;
    return ['auto', 'register', 'static', 'extern', 'typedef'].includes(value);
  }

  private parseStorageClassSpecifier(): StorageClassSpecifier {
    const token = this.currentToken;
    this.advance();
    return {
      type: 'StorageClassSpecifier',
      specifier: token.value as
        | 'auto'
        | 'register'
        | 'static'
        | 'extern'
        | 'typedef',
    };
  }

  private isTypeSpecifier(): boolean {
    const value = this.currentToken.value;
    return [
      'void',
      'char',
      'short',
      'int',
      'long',
      'float',
      'double',
      'signed',
      'unsigned',
      'struct',
      'union',
      'enum',
    ].includes(value);
  }

  private parseTypeSpecifier(): TypeSpecifier {
    if (
      this.currentToken.value === 'struct' ||
      this.currentToken.value === 'union'
    ) {
      return {
        type: 'TypeSpecifier',
        specifier: this.parseStructOrUnionSpecifier(),
      };
    } else if (this.currentToken.value === 'enum') {
      return {
        type: 'TypeSpecifier',
        specifier: this.parseEnumSpecifier(),
      };
    } else {
      const token = this.currentToken;
      this.advance();
      return {
        type: 'TypeSpecifier',
        specifier: token.value,
      };
    }
  }

  private parseStructOrUnionSpecifier(): StructOrUnionSpecifier {
    const kind = this.currentToken.value as 'struct' | 'union';
    this.advance();

    let identifier: string | undefined;
    if (this.currentToken.type === TokenType.IDENTIFIER) {
      identifier = this.currentToken.value;
      this.advance();
    }

    if (this.currentToken.value === '{') {
      this.advance();
      const declarations: StructDeclaration[] = [];
      while ((this.currentToken.value as string) !== '}') {
        declarations.push(this.parseStructDeclaration());
      }
      this.expect(TokenType.PUNCTUATOR, '}');

      return {
        type: 'StructOrUnionSpecifier',
        kind,
        identifier,
        declarations,
      };
    }

    return {
      type: 'StructOrUnionSpecifier',
      kind,
      identifier,
    };
  }

  private parseStructDeclaration(): StructDeclaration {
    const specifiers = this.parseSpecifierQualifierList();
    const declarators: StructDeclarator[] = [];

    do {
      const declarator = this.parseStructDeclarator();
      if (declarator) {
        declarators.push(declarator);
      }
    } while (this.currentToken.value === ',' && this.advance());

    this.expect(TokenType.PUNCTUATOR, ';');
    return { type: 'StructDeclaration', specifiers, declarators };
  }

  private parseSpecifierQualifierList(): (TypeSpecifier | TypeQualifier)[] {
    const list: (TypeSpecifier | TypeQualifier)[] = [];
    while (this.isTypeSpecifier() || this.isTypeQualifier()) {
      if (this.isTypeSpecifier()) {
        list.push(this.parseTypeSpecifier());
      } else {
        list.push(this.parseTypeQualifier());
      }
    }
    return list;
  }

  private parseStructDeclarator(): StructDeclarator {
    let declarator: Declarator | undefined;
    if (this.currentToken.value !== ':') {
      declarator = this.parseDeclarator();
    }

    let bitfield: Expression | undefined;
    if (this.currentToken.value === ':') {
      this.advance();
      bitfield = this.parseConstantExpression();
    }

    return { type: 'StructDeclarator', declarator, bitfield };
  }

  private parseEnumSpecifier(): EnumSpecifier {
    this.expect(TokenType.KEYWORD, 'enum');

    let identifier: string | undefined;
    if (this.currentToken.type === TokenType.IDENTIFIER) {
      identifier = this.currentToken.value;
      this.advance();
    }

    if ((this.currentToken.value as string) === '{') {
      this.advance();
      const enumerators: Enumerator[] = [];

      do {
        const enumIdentifier = this.expect(TokenType.IDENTIFIER).value;
        let value: Expression | undefined;

        if (this.currentToken.value === '=') {
          this.advance();
          value = this.parseConstantExpression();
        }

        enumerators.push({
          type: 'Enumerator',
          identifier: enumIdentifier,
          value,
        });
      } while (this.currentToken.value === ',' && this.advance());

      this.expect(TokenType.PUNCTUATOR, '}');

      return {
        type: 'EnumSpecifier',
        identifier,
        enumerators,
      };
    }

    return {
      type: 'EnumSpecifier',
      identifier,
    };
  }

  private isTypeQualifier(): boolean {
    return (
      this.currentToken.value === 'const' ||
      this.currentToken.value === 'volatile'
    );
  }

  private parseTypeQualifier(): TypeQualifier {
    const token = this.currentToken;
    this.advance();
    return {
      type: 'TypeQualifier',
      qualifier: token.value as 'const' | 'volatile',
    };
  }

  private parseDeclarator(): Declarator {
    const pointer = this.parsePointer();
    const directDeclarator = this.parseDirectDeclarator();
    return { type: 'Declarator', pointer, directDeclarator };
  }

  private parsePointer(): Pointer | undefined {
    if (this.currentToken.value !== '*') {
      return undefined;
    }

    this.advance();
    const qualifiers: TypeQualifier[] = [];
    while (this.isTypeQualifier()) {
      qualifiers.push(this.parseTypeQualifier());
    }

    const pointer = this.parsePointer();
    return { type: 'Pointer', qualifiers, pointer };
  }

  private parseDirectDeclarator(): DirectDeclarator {
    let directDeclarator: DirectDeclarator;

    if (this.currentToken.type === TokenType.IDENTIFIER) {
      directDeclarator = {
        type: 'DirectDeclarator',
        identifier: this.currentToken.value,
      };
      this.advance();
    } else if (this.currentToken.value === '(') {
      this.advance();
      const declarator = this.parseDeclarator();
      this.expect(TokenType.PUNCTUATOR, ')');
      directDeclarator = {
        type: 'DirectDeclarator',
        declarator,
      };
    } else {
      throw new Error('Expected identifier or (');
    }

    while (true) {
      if (this.currentToken.value === '[') {
        this.advance();
        const dimension =
          (this.currentToken.value as string) !== ']'
            ? this.parseConstantExpression()
            : undefined;
        this.expect(TokenType.PUNCTUATOR, ']');
        directDeclarator.arrayDimensions =
          directDeclarator.arrayDimensions || [];
        directDeclarator.arrayDimensions.push(dimension!);
      } else if (this.currentToken.value === '(') {
        this.advance();
        if (this.currentToken.type === TokenType.IDENTIFIER) {
          directDeclarator.identifierList = [];
          while (true) {
            directDeclarator.identifierList.push(
              this.expect(TokenType.IDENTIFIER).value
            );
            if ((this.currentToken.value as string) !== ',') break;
            this.advance();
          }
        } else {
          directDeclarator.parameters = this.parseParameterTypeList();
        }
        this.expect(TokenType.PUNCTUATOR, ')');
      } else {
        break;
      }
    }

    return directDeclarator;
  }

  private parseParameterTypeList(): ParameterTypeList {
    const parameters: ParameterDeclaration[] = [];
    let hasEllipsis = false;

    if (this.currentToken.value !== ')') {
      do {
        if (this.currentToken.value === '...') {
          hasEllipsis = true;
          this.advance();
          break;
        }
        parameters.push(this.parseParameterDeclaration());
      } while (this.currentToken.value === ',' && this.advance());
    }

    return { type: 'ParameterTypeList', parameters, hasEllipsis };
  }

  private parseParameterDeclaration(): ParameterDeclaration {
    const specifiers = this.parseDeclarationSpecifiers();
    let declarator: Declarator | undefined;
    let abstractDeclarator: AbstractDeclarator | undefined;

    if (this.currentToken.type === TokenType.IDENTIFIER) {
      declarator = this.parseDeclarator();
    } else if (
      this.currentToken.value === '*' ||
      this.currentToken.value === '('
    ) {
      abstractDeclarator = this.parseAbstractDeclarator();
    }

    return {
      type: 'ParameterDeclaration',
      specifiers,
      declarator,
      abstractDeclarator,
    };
  }

  private parseAbstractDeclarator(): AbstractDeclarator {
    const pointer = this.parsePointer();
    const directAbstractDeclarator = this.parseDirectAbstractDeclarator();
    return { type: 'AbstractDeclarator', pointer, directAbstractDeclarator };
  }

  private parseDirectAbstractDeclarator():
    | DirectAbstractDeclarator
    | undefined {
    if (this.currentToken.value !== '(' && this.currentToken.value !== '[') {
      return undefined;
    }

    const node: DirectAbstractDeclarator = { type: 'DirectAbstractDeclarator' };

    while (true) {
      if (this.currentToken.value === '[') {
        this.advance();
        if ((this.currentToken.value as string) !== ']') {
          const dimension = this.parseConstantExpression();
          node.arrayDimensions = node.arrayDimensions || [];
          node.arrayDimensions.push(dimension);
          this.expect(TokenType.PUNCTUATOR, ']');
        } else if (this.match('(')) {
          node.parameters = this.parseParameterTypeList();
          this.expect(TokenType.PUNCTUATOR, ')');
        } else {
          break;
        }
      }

      return node;
    }
  }

  private parseStatement(): Statement | null {
    if (this.currentToken.type === TokenType.KEYWORD) {
      switch (this.currentToken.value) {
        case 'if':
          return this.parseIfStatement();
        case 'for':
          return this.parseForLoop();
        case 'while':
          return this.parseWhileLoop();
        case 'do':
          return this.parseDoWhileLoop();
        case 'return':
          return this.parseReturnStatement();
        case 'break':
          return this.parseBreakStatement();
        case 'continue':
          return this.parseContinueStatement();
        case 'goto':
          return this.parseGotoStatement();
      }
    }

    if (
      this.currentToken.type === TokenType.IDENTIFIER &&
      this.peek()?.value === ':'
    ) {
      return this.parseLabeledStatement();
    }

    return this.parseExpressionStatement();
  }

  private parseCompoundStatement(): CompoundStatement {
    this.expect(TokenType.PUNCTUATOR, '{');
    const declarations: Declaration[] = [];
    const statements: Statement[] = [];

    while (this.currentToken.value !== '}') {
      if (this.isDeclarationSpecifier()) {
        const declaration = this.parseDeclaration();
        if (declaration) declarations.push(declaration);
      } else {
        const statement = this.parseStatement();
        if (statement) statements.push(statement);
      }
    }

    this.expect(TokenType.PUNCTUATOR, '}');
    return { type: 'CompoundStatement', declarations, statements };
  }

  private parseDeclaration(): Declaration {
    const specifiers = this.parseDeclarationSpecifiers();
    const declarators: InitDeclarator[] = [];

    if (this.currentToken.value !== ';') {
      do {
        const declarator = this.parseInitDeclarator();
        if (declarator) declarators.push(declarator);
      } while (this.currentToken.value === ',' && this.advance());
    }

    this.expect(TokenType.PUNCTUATOR, ';');
    return { type: 'Declaration', specifiers, declarators };
  }

  private parseInitDeclarator(): InitDeclarator {
    const declarator = this.parseDeclarator();
    let initializer: Initializer | undefined;

    if (this.currentToken.value === '=') {
      this.advance();
      initializer = this.parseInitializer();
    }

    return { type: 'InitDeclarator', declarator, initializer };
  }

  private parseInitializer(): Initializer {
    if (this.currentToken.value === '{') {
      return this.parseInitializerList();
    }
    return this.parseAssignmentExpression();
  }

  private parseInitializerList(): InitializerList {
    this.expect(TokenType.PUNCTUATOR, '{');
    const initializers: Initializer[] = [];

    if (this.currentToken.value !== '}') {
      do {
        initializers.push(this.parseInitializer());
      } while (this.currentToken.value === ',' && this.advance());
    }

    this.expect(TokenType.PUNCTUATOR, '}');
    return { type: 'InitializerList', initializers };
  }

  private parseIfStatement(): SelectionStatement {
    this.expect(TokenType.KEYWORD, 'if');
    this.expect(TokenType.PUNCTUATOR, '(');
    const condition = this.parseExpression();
    this.expect(TokenType.PUNCTUATOR, ')');
    const consequent = this.parseStatement();
    let alternate;
    if (this.currentToken.value === 'else') {
      this.advance();
      alternate = this.parseStatement();
    }

    if (!consequent || !alternate) {
      throw new Error('Missing statement in if-else block');
    }
    return {
      type: 'SelectionStatement',
      kind: 'if',
      condition,
      consequent,
      alternate,
    };
  }

  private parseWhileLoop(): IterationStatement {
    this.expect(TokenType.KEYWORD, 'while');
    this.expect(TokenType.PUNCTUATOR, '(');
    const condition = this.parseExpression();
    this.expect(TokenType.PUNCTUATOR, ')');
    const body = this.parseStatement();
    if (!body) {
      throw new Error('Missing statement in while loop');
    }
    return { type: 'IterationStatement', kind: 'while', condition, body };
  }

  private parseDoWhileLoop(): IterationStatement {
    this.expect(TokenType.KEYWORD, 'do');
    const body = this.parseStatement();
    this.expect(TokenType.KEYWORD, 'while');
    this.expect(TokenType.PUNCTUATOR, '(');
    const condition = this.parseExpression();
    this.expect(TokenType.PUNCTUATOR, ')');
    this.expect(TokenType.PUNCTUATOR, ';');
    if (!body) {
      throw new Error('Missing statement in do-while loop');
    }
    return { type: 'IterationStatement', kind: 'do-while', condition, body };
  }

  private parseForLoop(): IterationStatement {
    this.expect(TokenType.KEYWORD, 'for');
    this.expect(TokenType.PUNCTUATOR, '(');

    let initialization;
    if (this.currentToken.value !== ';') {
      initialization = this.parseExpression();
    }
    this.expect(TokenType.PUNCTUATOR, ';');

    let condition;
    if (this.currentToken.value !== ';') {
      condition = this.parseExpression();
    }
    this.expect(TokenType.PUNCTUATOR, ';');

    let update;
    if (this.currentToken.value !== ')') {
      update = this.parseExpression();
    }
    this.expect(TokenType.PUNCTUATOR, ')');

    const body = this.parseStatement();
    if (!body) {
      throw new Error('Missing statement in for loop');
    }
    return {
      type: 'IterationStatement',
      kind: 'for',
      initialization,
      condition,
      update,
      body,
    };
  }

  private parseReturnStatement(): Statement {
    this.advance(); // consume 'return'
    const expression =
      this.currentToken.value !== ';' ? this.parseExpression() : undefined;
    this.expect(TokenType.PUNCTUATOR, ';');
    return { type: 'ReturnStatement', expression };
  }

  private parseBreakStatement(): Statement {
    this.advance(); // consume 'break'
    this.expect(TokenType.PUNCTUATOR, ';');
    return { type: 'BreakStatement' };
  }

  private parseContinueStatement(): Statement {
    this.advance(); // consume 'continue'
    this.expect(TokenType.PUNCTUATOR, ';');
    return { type: 'ContinueStatement' };
  }

  private parseGotoStatement(): Statement {
    this.advance(); // consume 'goto'
    const label = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.PUNCTUATOR, ';');
    return { type: 'GotoStatement', label };
  }

  private parseLabeledStatement(): LabeledStatement {
    const label = this.expect(TokenType.IDENTIFIER).value;
    this.expect(TokenType.PUNCTUATOR, ':');
    const statement = this.parseStatement();
    if (!statement) {
      throw new Error('Missing statement after label');
    }
    return { type: 'LabeledStatement', label, statement };
  }

  private parseExpressionStatement(): ExpressionStatement {
    const expression = this.parseExpression();
    this.expect(TokenType.PUNCTUATOR, ';');
    return { type: 'ExpressionStatement', expression };
  }

  private isDeclarationSpecifier(): boolean {
    return (
      this.isStorageClassSpecifier() ||
      this.isTypeSpecifier() ||
      this.isTypeQualifier()
    );
  }

  private parseExpression(): Expression {
    let expr = this.parseAssignmentExpression();

    while (this.currentToken.value === ',') {
      this.advance();
      const right = this.parseAssignmentExpression();
      expr = {
        type: 'Expression',
        operator: ',',
        left: expr,
        right,
      };
    }

    return expr;
  }

  private parseAssignmentExpression(): Expression {
    const left = this.parseConditionalExpression();

    if (
      this.currentToken.type === TokenType.OPERATOR &&
      [
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
      ].includes(this.currentToken.value)
    ) {
      const operator = this.currentToken.value as
        | '='
        | '+='
        | '-='
        | '*='
        | '/='
        | '%='
        | '<<='
        | '>>='
        | '&='
        | '^='
        | '|=';
      this.advance();
      const right = this.parseAssignmentExpression();
      return {
        type: 'Expression',
        operator,
        left,
        right,
      };
    }

    return left;
  }

  private parseConstantExpression(): Expression {
    return this.parseConditionalExpression();
  }

  private parseConditionalExpression(): Expression {
    let expr = this.parseLogicalOrExpression();

    if (this.currentToken.value === '?') {
      this.advance();
      const consequent = this.parseExpression();
      this.expect(TokenType.PUNCTUATOR, ':');
      const alternate = this.parseConditionalExpression();
      expr = {
        type: 'Expression',
        operator: '?:',
        condition: expr,
        consequent,
        alternate,
      };
    }

    return expr;
  }

  private parseLogicalOrExpression(): Expression {
    let expr = this.parseLogicalAndExpression();

    while (this.currentToken.value === '||') {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.parseLogicalAndExpression();
      expr = {
        type: 'Expression',
        operator,
        left: expr,
        right,
      };
    }

    return expr;
  }

  private parseLogicalAndExpression(): Expression {
    let expr = this.parseInclusiveOrExpression();

    while (this.currentToken.value === '&&') {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.parseInclusiveOrExpression();
      expr = {
        type: 'Expression',
        operator,
        left: expr,
        right,
      };
    }

    return expr;
  }

  private parseInclusiveOrExpression(): Expression {
    let expr = this.parseExclusiveOrExpression();

    while (this.currentToken.value === '|') {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.parseExclusiveOrExpression();
      expr = {
        type: 'Expression',
        operator,
        left: expr,
        right,
      };
    }

    return expr;
  }

  private parseExclusiveOrExpression(): Expression {
    let expr = this.parseAndExpression();

    while (this.currentToken.value === '^') {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.parseAndExpression();
      expr = {
        type: 'Expression',
        operator,
        left: expr,
        right,
      };
    }

    return expr;
  }

  private parseAndExpression(): Expression {
    let expr = this.parseEqualityExpression();

    while (this.currentToken.value === '&') {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.parseEqualityExpression();
      expr = {
        type: 'Expression',
        operator,
        left: expr,
        right,
      };
    }

    return expr;
  }

  private parseEqualityExpression(): Expression {
    let expr = this.parseRelationalExpression();

    while (
      this.currentToken.value === '==' ||
      this.currentToken.value === '!='
    ) {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.parseRelationalExpression();
      expr = {
        type: 'Expression',
        operator,
        left: expr,
        right,
      };
    }

    return expr;
  }

  private parseRelationalExpression(): Expression {
    let expr = this.parseShiftExpression();

    while (['<', '>', '<=', '>='].includes(this.currentToken.value)) {
      const operator = this.currentToken.value as '<' | '>' | '<=' | '>=';
      this.advance();
      const right = this.parseShiftExpression();
      expr = {
        type: 'Expression',
        operator,
        left: expr,
        right,
      };
    }

    return expr;
  }

  private parseShiftExpression(): Expression {
    let expr = this.parseAdditiveExpression();

    while (
      this.currentToken.value === '<<' ||
      this.currentToken.value === '>>'
    ) {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.parseAdditiveExpression();
      expr = {
        type: 'Expression',
        operator,
        left: expr,
        right,
      };
    }

    return expr;
  }

  private parseAdditiveExpression(): Expression {
    let expr = this.parseMultiplicativeExpression();

    while (this.currentToken.value === '+' || this.currentToken.value === '-') {
      const operator = this.currentToken.value;
      this.advance();
      const right = this.parseMultiplicativeExpression();
      expr = {
        type: 'Expression',
        operator,
        left: expr,
        right,
      };
    }

    return expr;
  }

  private parseMultiplicativeExpression(): Expression {
    let expr = this.parseCastExpression();

    while (['*', '/', '%'].includes(this.currentToken.value)) {
      const operator = this.currentToken.value as '*' | '/' | '%';
      this.advance();
      const right = this.parseCastExpression();
      expr = {
        type: 'Expression',
        operator,
        left: expr,
        right,
      };
    }

    return expr;
  }

  private parseCastExpression(): Expression {
    if (this.currentToken.value === '(' && this.isTypeName()) {
      this.advance();
      const typeName = this.parseTypeName();
      this.expect(TokenType.PUNCTUATOR, ')');
      const expr = this.parseCastExpression();
      return {
        type: 'Expression',
        operator: 'cast',
        typeName,
        expression: expr,
      };
    }

    return this.parseUnaryExpression();
  }

  private isTypeName(): boolean {
    return this.isTypeSpecifier() || this.isTypeQualifier();
  }

  private parseTypeName(): {
    specifiers: (TypeSpecifier | TypeQualifier)[];
    abstractDeclarator?: AbstractDeclarator;
  } {
    const specifiers: (TypeSpecifier | TypeQualifier)[] = [];
    while (this.isTypeName()) {
      if (this.isTypeSpecifier()) {
        specifiers.push(this.parseTypeSpecifier());
      } else {
        specifiers.push(this.parseTypeQualifier());
      }
    }

    const abstractDeclarator =
      this.currentToken.value === '*' || this.currentToken.value === '('
        ? this.parseAbstractDeclarator()
        : undefined;

    return { specifiers, abstractDeclarator };
  }

  private parseUnaryExpression(): Expression {
    if (this.currentToken.value === '++' || this.currentToken.value === '--') {
      const operator = this.currentToken.value;
      this.advance();
      const operand = this.parseUnaryExpression();
      return {
        type: 'Expression',
        operator,
        prefix: true,
        operand,
      };
    }

    if (['+', '-', '!', '~', '*', '&'].includes(this.currentToken.value)) {
      const operator = this.currentToken.value as
        | '+'
        | '-'
        | '!'
        | '~'
        | '*'
        | '&';
      this.advance();
      const operand = this.parseCastExpression();
      return {
        type: 'Expression',
        operator,
        prefix: true,
        operand,
      };
    }

    if ((this.currentToken.value as string) === 'sizeof') {
      this.advance();
      if (this.currentToken.value === '(' && this.isTypeName()) {
        this.advance();
        const typeName = this.parseTypeName();
        this.expect(TokenType.PUNCTUATOR, ')');
        return {
          type: 'Expression',
          operator: 'sizeof',
          operand: typeName,
        };
      } else {
        const operand = this.parseUnaryExpression();
        return {
          type: 'Expression',
          operator: 'sizeof',
          operand,
        };
      }
    }

    return this.parsePostfixExpression();
  }

  private parsePostfixExpression(): Expression {
    let expr = this.parsePrimaryExpression();

    while (true) {
      if (this.currentToken.value === '[') {
        this.advance();
        const index = this.parseExpression();
        this.expect(TokenType.PUNCTUATOR, ']');
        expr = {
          type: 'Expression',
          operator: '[]',
          array: expr,
          index,
        };
      } else if ((this.currentToken.value as string) === '(') {
        this.advance();
        const args: Expression[] = [];
        if (this.currentToken.value !== ')') {
          do {
            args.push(this.parseAssignmentExpression());
          } while (this.currentToken.value === ',' && this.advance());
        }
        this.expect(TokenType.PUNCTUATOR, ')');
        expr = {
          type: 'Expression',
          operator: 'call',
          callee: expr,
          arguments: args,
        };
      } else if (
        this.currentToken.value === '.' ||
        this.currentToken.value === '->'
      ) {
        const operator = this.currentToken.value;
        this.advance();
        const member = this.expect(TokenType.IDENTIFIER).value;
        expr = {
          type: 'Expression',
          operator,
          object: expr,
          member,
        };
      } else if (
        this.currentToken.value === '++' ||
        this.currentToken.value === '--'
      ) {
        const operator = this.currentToken.value;
        this.advance();
        expr = {
          type: 'Expression',
          operator,
          prefix: false,
          operand: expr,
        };
      } else {
        break;
      }
    }

    return expr;
  }

  private parsePrimaryExpression(): Expression {
    if (this.currentToken.type === TokenType.IDENTIFIER) {
      const value = this.currentToken.value;
      this.advance();
      return { type: 'Expression', kind: 'identifier', value };
    }

    if (
      this.currentToken.type === TokenType.INTEGER ||
      this.currentToken.type === TokenType.FLOAT ||
      this.currentToken.type === TokenType.CHARACTER
    ) {
      const value = this.currentToken.value;
      this.advance();
      return { type: 'Expression', kind: 'constant', value };
    }

    if (this.currentToken.type === TokenType.STRING) {
      const value = this.currentToken.value;
      this.advance();
      return { type: 'Expression', kind: 'string', value };
    }

    if (this.currentToken.value === '(') {
      this.advance();
      const expr = this.parseExpression();
      this.expect(TokenType.PUNCTUATOR, ')');
      return expr;
    }

    throw new Error(`Unexpected token: ${this.currentToken.value}`);
  }
}
