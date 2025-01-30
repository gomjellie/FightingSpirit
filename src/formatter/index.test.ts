import { Formatter } from './index';

describe('complex formatting', () => {
  test.skip('formats nested for loops correctly', () => {
    const code = `int main() {
    for (int i = 0; i < 10; i++) {
        for (int j = 0; j < 10; j++) {
            printf("%d times %d is %d", i, j, i * j);
        }
    }
    return 0;
}`;

    const expected = `int main()                                                                      {
    for (char i = 0; i < 10; i++)                                                {
        for (int j = 0; j < 10; j++)                                            {
            printf("%d times %d is %d", i, j, i * j)                            ;}}
    return 0                                                                    ;}
`;

    const formatter = new Formatter({ space: 4, indentation: 4 });
    expect(formatter.format(code)).toBe(code);
  });
});
