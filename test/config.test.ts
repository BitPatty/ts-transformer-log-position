import { createLogStatement } from './test-utils';

describe('Config', () => {
  test('Custom Template String', () => {
    expect(createLogStatement('"test"')).transformsInto(
      'console.log("[Line 0, Character 0]", "test");',
      {
        templateString: '[Line {line}, Character {character}]',
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
      `
class Logger {
    log(msg) {
        console.log(msg);
    }
}

Logger.log("[index.ts:7:0]", "test");`,
      {
        expressions: 'Logger.log',
      },
    );
  });

  test('Nested Logger Function', () => {
    expect(`
class Logger {
    public print = {
        log(msg: string) {
            console.log(msg);
        }
    }
}

Logger.print.log("test");
`).transformsInto(
      `
class Logger {
    print = {
        log(msg) {
            console.log(msg);
        }
    };
}

Logger.print.log("[index.ts:9:0]", "test");`,
      {
        expressions: 'Logger.print.log',
      },
    );
  });

  test('Global Logger', () => {
    expect(`
const log = (msg: string) => {
  console.log(msg)
};
log()
    `).transformsInto(
      `
const log = (msg) => {
    console.log(msg);
};
log("[index.ts:4:0]");
      `,
      {
        expressions: 'log',
      },
    );
  });

  test('Multiple Log Statements', () => {
    expect(`
class Logger {
    public static log(msg?: string) {
        console.log(msg);
    }

    public warn(msg?: string) {
        console.warn(msg);
    }

    public error(msg) {
        console.error(msg);
    }
}

const error = (msg?: string) => console.error(msg)

Logger.log("Test");
console.log();
error("Test");
`).transformsInto(
      `
class Logger {
  static log(msg) {
      console.log(msg);
  }

  warn(msg) {
      console.warn("[index.ts:7:8]", msg);
  }

  error(msg) {
      console.error("[index.ts:11:8]", msg);
  }
}

const error = (msg) => console.error("[index.ts:15:32]", msg);

Logger.log("[index.ts:17:0]", "Test");
console.log();
error("[index.ts:19:0]", "Test");

`,
      {
        expressions: ['Logger.log', 'console.warn', 'error', 'console.error'],
      },
    );
  });

  test('Increment Line Number', () => {
    expect(createLogStatement('"test"')).transformsInto(
      'console.log("1", "test");',
      {
        templateString: '{line}',
        incrementLineNumber: true,
      },
    );
  });

  test('Increment Char Number', () => {
    expect(createLogStatement('"test"')).transformsInto(
      'console.log("01", "test");',
      {
        templateString: '{line}{character}',
        incrementCharNumber: true,
      },
    );
  });
});
