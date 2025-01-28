import { Token, TokenType, Keywords, Operators, Punctuators } from './token';

export class CLexer {
  private source: string;
  private position: number;
  private line: number;
  private column: number;
  private currentChar: string | null;

  constructor(source: string) {
    this.source = source;
    this.position = 0;
    this.line = 1;
    this.column = 1;
    this.currentChar = this.source.length > 0 ? this.source[0] : null;
  }

  private advance(): void {
    this.position++;
    if (this.currentChar === '\n') {
      this.line++;
      this.column = 1;
    } else {
      this.column++;
    }
    this.currentChar =
      this.position < this.source.length ? this.source[this.position] : null;
  }

  private peek(): string | null {
    const peekPos = this.position + 1;
    return peekPos < this.source.length ? this.source[peekPos] : null;
  }

  private skipWhitespace(): void {
    while (this.currentChar && /\s/.test(this.currentChar)) {
      this.advance();
    }
  }

  private readIdentifier(): Token {
    let value = '';
    const startColumn = this.column;

    while (this.currentChar && /[a-zA-Z_0-9]/.test(this.currentChar)) {
      value += this.currentChar;
      this.advance();
    }

    const type = Keywords.has(value) ? TokenType.KEYWORD : TokenType.IDENTIFIER;
    return { type, value, line: this.line, column: startColumn };
  }

  private readNumber(): Token {
    let value = '';
    const startColumn = this.column;
    let isFloat = false;

    while (
      this.currentChar &&
      (/\d/.test(this.currentChar) || this.currentChar === '.')
    ) {
      if (this.currentChar === '.') {
        if (isFloat) break;
        isFloat = true;
      }
      value += this.currentChar;
      this.advance();
    }

    return {
      type: isFloat ? TokenType.FLOAT : TokenType.INTEGER,
      value,
      line: this.line,
      column: startColumn,
    };
  }

  private readString(): Token {
    const startColumn = this.column;
    let value = '';
    this.advance(); // Skip opening quote

    while (this.currentChar && this.currentChar !== '"') {
      if (this.currentChar === '\\') {
        this.advance();
        if (this.currentChar) {
          value += '\\' + this.currentChar;
        }
      } else {
        value += this.currentChar;
      }
      this.advance();
    }

    if (this.currentChar === '"') {
      this.advance(); // Skip closing quote
    }

    return {
      type: TokenType.STRING,
      value,
      line: this.line,
      column: startColumn,
    };
  }

  private readCharacter(): Token {
    const startColumn = this.column;
    let value = '';
    this.advance(); // Skip opening quote

    if (this.currentChar === '\\') {
      this.advance();
      if (this.currentChar) {
        value = '\\' + this.currentChar;
      }
    } else if (this.currentChar) {
      value = this.currentChar;
    }

    this.advance();
    if (this.currentChar === "'") {
      this.advance(); // Skip closing quote
    }

    return {
      type: TokenType.CHARACTER,
      value,
      line: this.line,
      column: startColumn,
    };
  }

  private readOperatorOrPunctuator(): Token {
    const startColumn = this.column;
    let value = this.currentChar || '';
    this.advance();

    // Handle ellipsis operator first
    if (value === '.' && this.currentChar === '.' && this.peek() === '.') {
      this.advance(); // second dot
      this.advance(); // third dot
      value = '...';
    } else {
      // Try to form two-character operators or punctuators
      if (this.currentChar) {
        const combined = value + this.currentChar;
        if (Operators.has(combined) || Punctuators.has(combined)) {
          value = combined;
          this.advance();

          // Try to form three-character operators or punctuators
          if (this.currentChar) {
            const triple = value + this.currentChar;
            if (Operators.has(triple) || Punctuators.has(triple)) {
              value = triple;
              this.advance();
            }
          }
        }
      }
    }

    const type = Punctuators.has(value)
      ? TokenType.PUNCTUATOR
      : TokenType.OPERATOR;

    return { type, value, line: this.line, column: startColumn };
  }

  private readComment(): Token {
    const startColumn = this.column;
    let value = '';

    if (this.peek() === '/') {
      // Line comment
      this.advance(); // Skip second /
      this.advance();

      while (this.currentChar && this.currentChar !== '\n') {
        value += this.currentChar;
        this.advance();
      }
    } else if (this.peek() === '*') {
      // Block comment
      this.advance(); // Skip *
      this.advance();

      while (this.currentChar) {
        if (this.currentChar === '*' && this.peek() === '/') {
          this.advance(); // Skip *
          this.advance(); // Skip /
          break;
        }
        value += this.currentChar;
        this.advance();
      }
    }

    return {
      type: TokenType.COMMENT,
      value,
      line: this.line,
      column: startColumn,
    };
  }

  public nextToken(): Token {
    while (this.currentChar !== null) {
      // Skip whitespace
      if (/\s/.test(this.currentChar)) {
        this.skipWhitespace();
        continue;
      }

      // Identifiers and keywords
      if (/[a-zA-Z_]/.test(this.currentChar)) {
        return this.readIdentifier();
      }

      // Numbers
      if (/\d/.test(this.currentChar)) {
        return this.readNumber();
      }

      // Strings
      if (this.currentChar === '"') {
        return this.readString();
      }

      // Characters
      if (this.currentChar === "'") {
        return this.readCharacter();
      }

      // Comments
      if (
        this.currentChar === '/' &&
        (this.peek() === '/' || this.peek() === '*')
      ) {
        return this.readComment();
      }

      // Operators and punctuators
      if (
        Operators.has(this.currentChar) ||
        Punctuators.has(this.currentChar)
      ) {
        return this.readOperatorOrPunctuator();
      }

      // Unknown character
      const token = {
        type: TokenType.OPERATOR,
        value: this.currentChar,
        line: this.line,
        column: this.column,
      };
      this.advance();
      return token;
    }

    // End of file
    return {
      type: TokenType.EOF,
      value: '',
      line: this.line,
      column: this.column,
    };
  }

  public tokenize(): Token[] {
    const tokens: Token[] = [];
    let token = this.nextToken();

    while (token.type !== TokenType.EOF) {
      tokens.push(token);
      token = this.nextToken();
    }

    tokens.push(token); // Push EOF token
    return tokens;
  }
}
