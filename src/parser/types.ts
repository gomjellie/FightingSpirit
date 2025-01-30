export interface ASTNode {
  type: string;
  location?: SourceLocation;
}

export interface SourceLocation {
  start: Position;
  end: Position;
}

export interface Position {
  line: number;
  column: number;
}

export interface Program extends ASTNode {
  type: 'Program';
  declarations: ExternalDeclaration[];
}

export type ExternalDeclaration = FunctionDefinition | Declaration;

export interface FunctionDefinition extends ASTNode {
  type: 'FunctionDefinition';
  specifiers: DeclarationSpecifier[];
  declarator: Declarator;
  declarations: Declaration[];
  body: CompoundStatement;
}

export interface Declaration extends ASTNode {
  type: 'Declaration';
  specifiers: DeclarationSpecifier[];
  declarators: InitDeclarator[];
}

export type DeclarationSpecifier =
  | StorageClassSpecifier
  | TypeSpecifier
  | TypeQualifier;

export interface StorageClassSpecifier extends ASTNode {
  type: 'StorageClassSpecifier';
  specifier: 'auto' | 'register' | 'static' | 'extern' | 'typedef';
}

export interface TypeSpecifier extends ASTNode {
  type: 'TypeSpecifier';
  specifier: string | StructOrUnionSpecifier | EnumSpecifier;
}

export interface StructOrUnionSpecifier extends ASTNode {
  type: 'StructOrUnionSpecifier';
  kind: 'struct' | 'union';
  identifier?: string;
  declarations?: StructDeclaration[];
}

export interface StructDeclaration extends ASTNode {
  type: 'StructDeclaration';
  specifiers: (TypeSpecifier | TypeQualifier)[];
  declarators: StructDeclarator[];
}

export interface StructDeclarator extends ASTNode {
  type: 'StructDeclarator';
  declarator?: Declarator;
  bitfield?: Expression;
}

export interface EnumSpecifier extends ASTNode {
  type: 'EnumSpecifier';
  identifier?: string;
  enumerators?: Enumerator[];
}

export interface Enumerator extends ASTNode {
  type: 'Enumerator';
  identifier: string;
  value?: Expression;
}

export interface TypeQualifier extends ASTNode {
  type: 'TypeQualifier';
  qualifier: 'const' | 'volatile';
}

export interface Declarator extends ASTNode {
  type: 'Declarator';
  pointer?: Pointer;
  directDeclarator: DirectDeclarator;
}

export interface Pointer extends ASTNode {
  type: 'Pointer';
  qualifiers: TypeQualifier[];
  pointer?: Pointer;
}

export interface DirectDeclarator extends ASTNode {
  type: 'DirectDeclarator';
  identifier?: string;
  declarator?: Declarator;
  arrayDimensions?: Expression[];
  parameters?: ParameterTypeList;
  identifierList?: string[];
}

export interface ParameterTypeList extends ASTNode {
  type: 'ParameterTypeList';
  parameters: ParameterDeclaration[];
  hasEllipsis: boolean;
}

export interface ParameterDeclaration extends ASTNode {
  type: 'ParameterDeclaration';
  specifiers: DeclarationSpecifier[];
  declarator?: Declarator;
  abstractDeclarator?: AbstractDeclarator;
}

export interface AbstractDeclarator extends ASTNode {
  type: 'AbstractDeclarator';
  pointer?: Pointer;
  directAbstractDeclarator?: DirectAbstractDeclarator;
}

export interface DirectAbstractDeclarator extends ASTNode {
  type: 'DirectAbstractDeclarator';
  arrayDimensions?: Expression[];
  parameters?: ParameterTypeList;
}

export interface InitDeclarator extends ASTNode {
  type: 'InitDeclarator';
  declarator: Declarator;
  initializer?: Initializer;
}

export type Initializer = Expression | InitializerList;

export interface InitializerList extends ASTNode {
  type: 'InitializerList';
  initializers: Initializer[];
}

export interface CompoundStatement extends ASTNode {
  type: 'CompoundStatement';
  declarations: Declaration[];
  statements: Statement[];
}

export type Statement =
  | LabeledStatement
  | ExpressionStatement
  | CompoundStatement
  | SelectionStatement
  | IterationStatement
  | GotoStatement
  | JumpStatement
  | ContinueStatement
  | BreakStatement
  | ReturnStatement;

export interface LabeledStatement extends ASTNode {
  type: 'LabeledStatement';
  label: string | Expression; // string for identifier, Expression for case constant
  isDefault?: boolean;
  statement: Statement;
}

export interface ExpressionStatement extends ASTNode {
  type: 'ExpressionStatement';
  expression?: Expression;
}

export interface SelectionStatement extends ASTNode {
  type: 'SelectionStatement';
  kind: 'if' | 'switch';
  condition: Expression;
  consequent: Statement;
  alternate?: Statement;
}

export interface IterationStatement extends ASTNode {
  type: 'IterationStatement';
  kind: 'while' | 'do-while' | 'for';
  initialization?: Expression | Declaration;
  condition?: Expression;
  update?: Expression;
  body: Statement;
}

export interface JumpStatement extends ASTNode {
  type: 'JumpStatement';
  kind: 'goto' | 'continue' | 'break' | 'return';
  label?: string;
  expression?: Expression;
}

export interface GotoStatement extends ASTNode {
  type: 'GotoStatement';
  label: string;
}

export interface ContinueStatement extends ASTNode {
  type: 'ContinueStatement';
}

export interface BreakStatement extends ASTNode {
  type: 'BreakStatement';
}

export interface ReturnStatement extends ASTNode {
  type: 'ReturnStatement';
  expression?: Expression;
}

type PrimaryExpression = {
  type: 'Expression';
  kind: 'identifier' | 'constant' | 'string';
  value: string;
};

export type Expression =
  | PrimaryExpression
  | (
      | {
          type: 'Expression';
          // UnaryExpression
          operator: '++' | '--';
          operand: Expression;
          prefix: boolean;
        }
      | {
          type: 'Expression';
          // UnaryExpression
          operator: '+' | '-' | '!' | '~' | '*' | '&';
          operand: Expression;
          prefix: boolean;
        }
      | {
          type: 'Expression';
          // UnaryExpression
          operator: 'sizeof';
          operand:
            | {
                specifiers: (TypeSpecifier | TypeQualifier)[];
                abstractDeclarator?: AbstractDeclarator;
              }
            | Expression;
        }
      | {
          type: 'Expression';
          operator: 'cast';
          typeName: {
            specifiers: (TypeSpecifier | TypeQualifier)[];
            abstractDeclarator?: AbstractDeclarator;
          };
          expression: Expression;
        }
      | {
          type: 'Expression';
          // assignment operators
          operator:
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
          left: Expression;
          right: Expression;
        }
      | {
          type: 'Expression';
          // Multiplicative operators
          operator: '*' | '/' | '%';
          left: Expression;
          right: Expression;
        }
      | {
          type: 'Expression';
          operator: ',';
          left: Expression;
          right: Expression;
        }
      | {
          type: 'Expression';
          operator: '?:';
          condition: Expression;
          consequent: Expression;
          alternate: Expression;
        }
      | {
          type: 'Expression';
          operator: '||';
          left: Expression;
          right: Expression;
        }
      | {
          type: 'Expression';
          operator: '<<' | '>>';
          operand?: Expression;
        }
      | {
          type: 'Expression';
          operator: '<' | '>' | '<=' | '>=';
          operand?: Expression;
        }
      | {
          // LogicalAndExpression
          type: 'Expression';
          operator: '&&';
          left: Expression;
          right: Expression;
        }
      | {
          // InclusiveOrExpression
          type: 'Expression';
          operator: '|';
          left: Expression;
          right: Expression;
        }
      | {
          // ExclusiveOrExpression
          type: 'Expression';
          operator: '^';
          left: Expression;
          right: Expression;
        }
      | {
          // EqualityExpression
          type: 'Expression';
          operator: '==' | '!=';
          left: Expression;
          right: Expression;
        }
      | {
          // AndExpression
          type: 'Expression';
          operator: '&';
          left: Expression;
          right: Expression;
        }
      | {
          // ShiftExpression
          type: 'Expression';
          operator: '<<' | '>>';
          left: Expression;
          right: Expression;
        }
      | {
          // RelationalExpression
          type: 'Expression';
          operator: '<' | '>' | '<=' | '>=';
          left: Expression;
          right: Expression;
        }
      | {
          // AdditiveExpression
          type: 'Expression';
          operator: '+' | '-';
          left: Expression;
          right: Expression;
        }
      | {
          // MultiplicativeExpression
          type: 'Expression';
          operator: '*' | '/' | '%';
          left: Expression;
          right: Expression;
        }
      | {
          // UnaryExpression
          type: 'Expression';
          operator: '+' | '-';
          operand: Expression;
        }
      | {
          // PostfixExpression
          type: 'Expression';
          operator: '[]';
          array: Expression;
          index: Expression;
        }
      | {
          // PostfixExpression
          type: 'Expression';
          operator: '.' | '->';
          object: Expression;
          member: string;
        }
      | {
          // PostfixExpression
          type: 'Expression';
          operator: '++' | '--';
          operand: Expression;
        }
      | {
          // CallExpression
          type: 'Expression';
          operator: 'call';
          callee: Expression;
          arguments: Expression[];
        }
      | {
          // PrimaryExpression
          type: 'Expression';
          operator: '[';
          operand: Expression;
        }
      | {
          // PrimaryExpression
          type: 'Expression';
          operator: '++' | '--';
          operand: Expression;
        }
    );
