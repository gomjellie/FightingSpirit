import { CLexer } from '../lexer/lexer';
import { CParser } from '../parser/parser';
import { CSerializer } from './serializer';

const roundTrip = (code: string): string => {
  const lexer = new CLexer(code);
  const tokens = lexer.tokenize();
  const parser = new CParser(tokens);
  const ast = parser.parse();
  const serializer = new CSerializer();
  return serializer.serialize(ast);
};

describe('declarations', () => {
  test('serializes basic variable declarations', () => {
    const code = 'int x;';
    expect(roundTrip(code)).toBe(code);
  });

  test('serializes multiple variable declarations', () => {
    const code = 'int x, y, z;';
    expect(roundTrip(code)).toBe(code);
  });

  test('serializes array declarations', () => {
    const code = 'int arr[10];';
    expect(roundTrip(code)).toBe(code);
  });
});

describe('function declarations and definitions', () => {
  test('serializes function declaration', () => {
    const code = 'int add(int a, int b);';
    expect(roundTrip(code)).toBe(code);
  });

  test('serializes function definition', () => {
    const code = `int main() {
  return 0;
}`;
    expect(roundTrip(code)).toBe(code);
  });

  test('serializes function with multiple parameters', () => {
    const code = `void test(int a, float b, char c) {}`;
    expect(roundTrip(code)).toBe(code);
  });
});

describe('struct and union', () => {
  test('serializes struct declaration', () => {
    const code = `struct Point {
  int x;
  int y;
};`;
    expect(roundTrip(code)).toBe(code);
  });

  test('serializes union declaration', () => {
    const code = `union Data {
  int i;
  float f;
};`;
    expect(roundTrip(code)).toBe(code);
  });

  test('serializes struct with bit fields', () => {
    const code = `struct Flags {
  unsigned int a : 1;
  unsigned int b : 2;
};`;
    expect(roundTrip(code)).toBe(code);
  });
});

describe('enums', () => {
  test('serializes enum declaration', () => {
    const code = 'enum Color { RED, GREEN, BLUE };';
    expect(roundTrip(code)).toBe(code);
  });

  test('serializes enum with explicit values', () => {
    const code = 'enum Numbers { ONE = 1, TWO = 2, THREE = 3 };';
    expect(roundTrip(code)).toBe(code);
  });
});

describe('type qualifiers and storage classes', () => {
  test('serializes const qualifier', () => {
    const code = 'const int x;';
    expect(roundTrip(code)).toBe(code);
  });

  test('serializes static storage class', () => {
    const code = 'static int x;';
    expect(roundTrip(code)).toBe(code);
  });

  test('serializes multiple specifiers', () => {
    const code = 'static const volatile int x;';
    expect(roundTrip(code)).toBe(code);
  });
});

describe('pointers', () => {
  test('serializes pointer declaration', () => {
    const code = 'int* ptr;';
    expect(roundTrip(code)).toBe(code);
  });

  test('serializes multiple pointer levels', () => {
    const code = 'int** ptr;';
    expect(roundTrip(code)).toBe(code);
  });

  test('serializes pointer with type qualifiers', () => {
    const code = 'int* const* volatile ptr;';
    expect(roundTrip(code)).toBe(code);
  });
});

describe('complex code', () => {
  test('serializes complete program', () => {
    const code = `int main(int argc, char** argv) {
  int x = 42;
  if (x > 0) {
    printf("Positive");
  } else {
    printf("Non-positive");
  }
  return 0;
}`;
    expect(roundTrip(code)).toBe(code);
  });

  test('serializes nested structures', () => {
    const code = `struct Outer {
  struct Inner {
    int x;
    int y;
  } inner;
  int z;
};`;
    expect(roundTrip(code)).toBe(code);
  });

  test('serializes complex declarations', () => {
    const code = 'static const int* const* volatile* p;';
    expect(roundTrip(code)).toBe(code);
  });
});
