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
} from '../parser/types';

export class CSerializer {
  private indentLevel: number = 0;
  private indentString: string = '  ';

  private indent(): string {
    return this.indentString.repeat(this.indentLevel);
  }

  public serialize(node: Program): string {
    return this.serializeProgram(node);
  }

  private serializeProgram(node: Program): string {
    return node.declarations
      .map((decl) => this.serializeExternalDeclaration(decl))
      .join('\n\n');
  }

  private serializeExternalDeclaration(node: ExternalDeclaration): string {
    if (node.type === 'FunctionDefinition') {
      return this.serializeFunctionDefinition(node);
    } else {
      return this.serializeDeclaration(node);
    }
  }

  private serializeFunctionDefinition(node: FunctionDefinition): string {
    const specifiers = node.specifiers
      .map((spec) => this.serializeDeclarationSpecifier(spec))
      .join(' ');
    const declarator = this.serializeDeclarator(node.declarator);
    const declarations = node.declarations
      .map((decl) => this.serializeDeclaration(decl))
      .join('\n');
    const body = this.serializeCompoundStatement(node.body);
    return `${specifiers} ${declarator}${
      declarations ? '\n' + declarations : ''
    } ${body}`;
  }

  private normalizePointerStyle(code: string): string {
    return (
      code
        // const나 volatile 같은 한정자들(qualifiers)을 임시로 표시
        // .replace(/\b(const|volatile)\b/g, '@$1@')

        // * 앞의 공백 제거 및 뒤의 공백 추가
        // 1. 먼저 * 주변의 모든 공백 제거
        .replace(/\s*\*\s*/g, '*')

        // 2. * 뒤에 공백 추가 (단, 다음 *가 오는 경우는 제외)
        .replace(/\*(?!\*)/g, '* ')

      // 임시 표시했던 한정자들 복원
      // .replace(/@(const|volatile)@/g, '$1')
    );
  }

  private serializeDeclaration(node: Declaration): string {
    const specifiers = node.specifiers
      .map((spec) => this.serializeDeclarationSpecifier(spec))
      .join(' ');
    const declarators = node.declarators
      .map((decl) => this.serializeInitDeclarator(decl))
      .join(', ');

    if (!declarators) {
      return `${specifiers};`;
    }
    return this.normalizePointerStyle(`${specifiers} ${declarators};`);
  }

  private serializeDeclarationSpecifier(node: DeclarationSpecifier): string {
    switch (node.type) {
      case 'StorageClassSpecifier':
        return node.specifier;
      case 'TypeSpecifier':
        return this.serializeTypeSpecifier(node);
      case 'TypeQualifier':
        return node.qualifier;
      default:
        return '';
    }
  }

  private serializeTypeSpecifier(node: TypeSpecifier): string {
    if (typeof node.specifier === 'string') {
      return node.specifier;
    } else if ('kind' in node.specifier) {
      return this.serializeStructOrUnionSpecifier(node.specifier);
    } else {
      return this.serializeEnumSpecifier(node.specifier);
    }
  }

  private serializeStructOrUnionSpecifier(
    node: StructOrUnionSpecifier
  ): string {
    const kind = node.kind;
    const identifier = node.identifier ? ` ${node.identifier}` : '';
    if (!node.declarations) {
      return `${kind}${identifier}`;
    }

    this.indentLevel++;
    const declarations = node.declarations
      .map((decl) => this.indent() + this.serializeStructDeclaration(decl))
      .join('\n');
    this.indentLevel--;

    return `${kind}${identifier} {\n${declarations}\n${this.indent()}}`;
  }

  private serializeStructDeclaration(node: StructDeclaration): string {
    const specifiers = node.specifiers
      .map((spec) => {
        if (spec.type === 'TypeSpecifier') {
          return this.serializeTypeSpecifier(spec);
        } else {
          return spec.qualifier;
        }
      })
      .join(' ');

    const declarators = node.declarators
      .map((decl) => this.serializeStructDeclarator(decl))
      .join(', ');
    return `${specifiers} ${declarators};`;
  }

  private serializeStructDeclarator(node: StructDeclarator): string {
    const declarator = node.declarator
      ? this.serializeDeclarator(node.declarator)
      : '';
    const bitfield = node.bitfield
      ? ` : ${this.serializeExpression(node.bitfield)}`
      : '';
    return declarator + bitfield;
  }

  private serializeEnumSpecifier(node: EnumSpecifier): string {
    const identifier = node.identifier ? ` ${node.identifier}` : '';
    if (!node.enumerators) {
      return `enum${identifier}`;
    }

    const enumerators = node.enumerators
      .map((enumerator) => this.serializeEnumerator(enumerator))
      .join(', ');

    return `enum${identifier} { ${enumerators} }`;
  }

  private serializeEnumerator(node: Enumerator): string {
    const value = node.value
      ? ` = ${this.serializeExpression(node.value)}`
      : '';
    return node.identifier + value;
  }

  private serializeDeclarator(node: Declarator): string {
    const pointer = node.pointer ? this.serializePointer(node.pointer) : '';
    const directDeclarator = this.serializeDirectDeclarator(
      node.directDeclarator
    );
    return pointer + directDeclarator;
  }

  private serializePointer(node: Pointer): string {
    const qualifiers = node.qualifiers.map((q) => q.qualifier).join(' ');
    const pointer = node.pointer ? this.serializePointer(node.pointer) : '';
    return `*${qualifiers ? ' ' + qualifiers + ' ' : ''}${pointer}`;
  }

  private serializeDirectDeclarator(node: DirectDeclarator): string {
    let result = '';

    if (node.identifier) {
      result = node.identifier;
    } else if (node.declarator) {
      result = `(${this.serializeDeclarator(node.declarator)})`;
    }

    if (node.arrayDimensions) {
      result += node.arrayDimensions
        .map((dim) => `[${dim ? this.serializeExpression(dim) : ''}]`)
        .join('');
    }

    if (node.parameters) {
      result += `(${this.serializeParameterTypeList(node.parameters)})`;
    } else if (node.identifierList) {
      result += `(${node.identifierList.join(', ')})`;
    }

    return result;
  }

  private serializeParameterTypeList(node: ParameterTypeList): string {
    const params = node.parameters
      .map((param) => this.serializeParameterDeclaration(param))
      .join(', ');
    return params + (node.hasEllipsis ? ', ...' : '');
  }

  private serializeParameterDeclaration(node: ParameterDeclaration): string {
    const specifiers = node.specifiers
      .map((spec) => this.serializeDeclarationSpecifier(spec))
      .join(' ');
    if (node.declarator) {
      return `${specifiers} ${this.serializeDeclarator(node.declarator)}`;
    } else if (node.abstractDeclarator) {
      return `${specifiers} ${this.serializeAbstractDeclarator(
        node.abstractDeclarator
      )}`;
    }
    return specifiers;
  }

  private serializeAbstractDeclarator(node: AbstractDeclarator): string {
    const pointer = node.pointer ? this.serializePointer(node.pointer) : '';
    const directAbstractDeclarator = node.directAbstractDeclarator
      ? this.serializeDirectAbstractDeclarator(node.directAbstractDeclarator)
      : '';
    return pointer + directAbstractDeclarator;
  }

  private serializeDirectAbstractDeclarator(
    node: DirectAbstractDeclarator
  ): string {
    let result = '';

    if (node.arrayDimensions) {
      result += node.arrayDimensions
        .map((dim) => `[${dim ? this.serializeExpression(dim) : ''}]`)
        .join('');
    }

    if (node.parameters) {
      result += `(${this.serializeParameterTypeList(node.parameters)})`;
    }

    return result;
  }

  private serializeInitDeclarator(node: InitDeclarator): string {
    const declarator = this.serializeDeclarator(node.declarator);
    const initializer = node.initializer
      ? ` = ${this.serializeInitializer(node.initializer)}`
      : '';
    return declarator + initializer;
  }

  private serializeInitializer(node: Initializer): string {
    if ('type' in node && node.type === 'InitializerList') {
      const elements = node.initializers
        .map((init) => this.serializeInitializer(init))
        .join(', ');
      return `{ ${elements} }`;
    } else {
      return this.serializeExpression(node);
    }
  }

  private serializeCompoundStatement(node: CompoundStatement): string {
    this.indentLevel++;
    const declarations = node.declarations
      .map((decl) => this.indent() + this.serializeDeclaration(decl))
      .join('\n');
    const statements = node.statements
      .map((stmt) => this.indent() + this.serializeStatement(stmt))
      .join('\n');
    this.indentLevel--;

    // Handle empty function body
    if (!declarations && !statements) {
      return '{}';
    }

    return `{\n${declarations}${
      declarations && statements ? '\n' : ''
    }${statements}\n${this.indent()}}`;
  }

  private serializeStatement(node: Statement): string {
    switch (node.type) {
      case 'LabeledStatement':
        return this.serializeLabeledStatement(node);
      case 'ExpressionStatement':
        return this.serializeExpressionStatement(node);
      case 'CompoundStatement':
        return this.serializeCompoundStatement(node);
      case 'SelectionStatement':
        return this.serializeSelectionStatement(node);
      case 'IterationStatement':
        return this.serializeIterationStatement(node);
      case 'JumpStatement':
        return this.serializeJumpStatement(node);
      case 'GotoStatement':
        return `goto ${node.label};`;
      case 'ContinueStatement':
        return 'continue;';
      case 'BreakStatement':
        return 'break;';
      case 'ReturnStatement':
        return node.expression
          ? `return ${this.serializeExpression(node.expression)};`
          : 'return;';
      default:
        return '';
    }
  }

  private serializeLabeledStatement(node: LabeledStatement): string {
    const label =
      typeof node.label === 'string'
        ? node.label
        : this.serializeExpression(node.label);
    const prefix = node.isDefault
      ? 'default'
      : node.type === 'LabeledStatement'
      ? label
      : `case ${label}`;
    return `${prefix}:\n${this.indent()}${this.serializeStatement(
      node.statement
    )}`;
  }

  private serializeExpressionStatement(node: ExpressionStatement): string {
    return node.expression
      ? this.serializeExpression(node.expression) + ';'
      : ';';
  }

  private serializeSelectionStatement(node: SelectionStatement): string {
    const condition = this.serializeExpression(node.condition);
    const consequent = this.serializeStatement(node.consequent);
    if (node.kind === 'if') {
      const alternate = node.alternate
        ? ` else ${this.serializeStatement(node.alternate)}`
        : '';
      return `if (${condition}) ${consequent}${alternate}`;
    } else {
      return `switch (${condition}) ${consequent}`;
    }
  }

  private serializeIterationStatement(node: IterationStatement): string {
    switch (node.kind) {
      case 'while':
        return `while (${this.serializeExpression(
          node.condition!
        )}) ${this.serializeStatement(node.body)}`;
      case 'do-while':
        return `do ${this.serializeStatement(
          node.body
        )} while (${this.serializeExpression(node.condition!)});`;
      case 'for':
        const init = node.initialization
          ? this.serializeExpression(node.initialization)
          : '';
        const cond = node.condition
          ? this.serializeExpression(node.condition)
          : '';
        const update = node.update ? this.serializeExpression(node.update) : '';
        return `for (${init}; ${cond}; ${update}) ${this.serializeStatement(
          node.body
        )}`;
    }
  }

  private serializeJumpStatement(node: JumpStatement): string {
    switch (node.kind) {
      case 'goto':
        return `goto ${node.label};`;
      case 'continue':
        return 'continue;';
      case 'break':
        return 'break;';
      case 'return':
        return node.expression
          ? `return ${this.serializeExpression(node.expression)};`
          : 'return;';
    }
  }

  private serializeExpression(node: Expression): string {
    if ('value' in node && node.value !== undefined) {
      if ('kind' in node && node.kind === 'string') {
        return `"${node.value}"`;
      }

      return node.value.toString();
    }

    if (
      'operator' in node &&
      'left' in node &&
      'right' in node &&
      node.operator
    ) {
      const left = node.left ? this.serializeExpression(node.left) : '';
      const right = node.right ? this.serializeExpression(node.right) : '';
      return `${left} ${node.operator} ${right}`;
    }

    if ('operator' in node && node.operator === 'call') {
      const callee = this.serializeExpression(node.callee);
      const args = node.arguments
        ? node.arguments.map((arg) => this.serializeExpression(arg)).join(', ')
        : '';
      return `${callee}(${args})`;
    }

    return '';
  }
}
