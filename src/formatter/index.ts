import { CLexer } from '../lexer/lexer';
import { CParser } from '../parser/parser';
import { CSerializer } from '../serializer/serializer';

interface FormatterOptions {
  indentation?: number;
  space?: number;
}

export class Formatter {
  private space: number;
  private indentation: number;

  constructor(options?: FormatterOptions) {
    this.space = options?.space ?? 84;
    this.indentation = options?.indentation ?? 2;
  }
  format(code: string): string {
    const lexer = new CLexer(code);
    const tokens = lexer.tokenize();
    const parser = new CParser(tokens);
    const ast = parser.parse();
    const serializer = new CSerializer({ indentation: this.indentation });
    return serializer.serialize(ast);
  }
}
