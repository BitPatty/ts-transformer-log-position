import { createLogStatement } from './test-utils';

describe('Config', () => {
  test('Custom Template String', () => {
    expect(createLogStatement('"test"')).transformsInto(
      'console.log("[Line 0, Character 0]", "test");',
      {
        templateString: '[Line {line}, Character {character}] ',
      },
    );
  });

  test('Custom Logger', () => {
    expect(`
class Logger {
    public log(msg: string) {
        console.log(msg);
    }
}

Logger.log("test");
`).transformsInto(
      `class Logger {
    log(msg) {
        console.log(msg);
    }
}
Logger.log("[index.ts | L7C0]", "test");`,
      {
        expression: 'Logger',
      },
    );
  });

  test('Increment Line Number', () => {
    expect(createLogStatement('"test"')).transformsInto(
      'console.log("1", "test");',
      {
        templateString: '{line} ',
        incrementLineNumber: true,
      },
    );
  });
});
